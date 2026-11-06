// Controlled loopback HTTP transport probe for AI SDK; NOT production Invoke code.
// No provider credentials, no external model calls. This measures observable
// behavior of exactly pinned ai@7.0.141 / @ai-sdk/openai-compatible@3.0.66.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

async function withProvider(onRequest, run) {
  const server = createServer(async (req, res) => {
    let body = '';
    try {
      for await (const chunk of req) body += chunk.toString();
      await onRequest(req, res, body);
    } catch (e) {
      if (!res.headersSent && !res.destroyed) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { message: String(e) } }));
      }
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseURL = 'http://127.0.0.1:' + port + '/v1';
  const provider = createOpenAICompatible({ baseURL, name: 'local-probe', apiKey: 'fake' });
  try {
    return await run(provider, baseURL);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}
function send(res, { model = 'requested-model', text = 'ok', finish = 'stop' } = {}) {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({
    id: 'response-local',
    object: 'chat.completion',
    created: 1_791_000_000,
    model,
    choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: finish }],
    usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
  }));
}
function evidence(probe, facts) {
  console.log('INVOKE_EVIDENCE ' + JSON.stringify({ probe, ...facts }));
}
function call(provider, options = {}) {
  return generateText({
    model: provider.chatModel('requested-model'),
    prompt: 'locally controlled transport probe',
    maxRetries: 0,
    ...options,
  });
}
test('HTTP-001: model identity from actual HTTP response is observable', async () => {
  let received = 0;
  await withProvider(async (_req, res) => {
    received += 1;
    send(res, { model: 'other-executed-model', text: 'server output' });
  }, async provider => {
    const result = await call(provider);
    assert.equal(result.text, 'server output');
    evidence('HTTP-001', {
      networkRequests: received,
      requestedModelId: 'requested-model',
      reportedModelId: result.response?.modelId ?? null,
      mismatchVisible: result.response?.modelId === 'other-executed-model',
      returnedNormally: true,
    });
    assert.equal(received, 1);
  });
});
test('HTTP-002: provider declares output length and SDK still returns normally', async () => {
  await withProvider(async (_req, res) => send(res, {
    finish: 'length',
    text: '{ partial:',
  }), async provider => {
    const result = await call(provider);
    assert.equal(result.text, '{ partial:');
    evidence('HTTP-002', {
      finishReason: result.finishReason,
      rawFinishReason: result.rawFinishReason ?? null,
      returnedNormally: true,
    });
  });
});
test('HTTP-003: connection lost after mock server completes work, retries disabled', async () => {
  let accepted = 0;
  let completedWork = false;
  await withProvider(async (req) => {
    accepted += 1;
    completedWork = true;
    req.socket.destroy();
  }, async provider => {
    await assert.rejects(call(provider, { maxRetries: 0 }));
    assert.equal(accepted, 1);
    evidence('HTTP-003', {
      serverReceivedRequests: accepted,
      serverWorkCompletedBeforeResponseLost: completedWork,
      clientReceivedResult: false,
    });
  });
});
test('HTTP-004: inspect SDK replay after a post-execution network reset', async () => {
  let accepted = 0;
  let firstCompleted = false;
  await withProvider(async (req, res) => {
    accepted += 1;
    if (accepted === 1) {
      firstCompleted = true;
      req.socket.destroy();
      return;
    }
    send(res, { text: 'second execution response' });
  }, async provider => {
    let outcome = 'threw';
    let errorName = null;
    try {
      const result = await call(provider, { maxRetries: 1 });
      outcome = result.text;
    } catch (e) {
      errorName = e?.name ?? 'unknown';
    }
    assert.equal(firstCompleted, true);
    assert.ok(accepted >= 1);
    evidence('HTTP-004', {
      physicalServerRequests: accepted,
      firstWorkCompletedButResponseLost: firstCompleted,
      finalOutcome: outcome,
      errorName,
      duplicateNetworkAttempt: accepted > 1,
    });
  });
});
test('HTTP-005: independent concurrent calls remain attributable', async () => {
  const observed = [];
  await withProvider(async (_req, res, body) => {
    const parsed = JSON.parse(body);
    const prompt = JSON.stringify(parsed.messages ?? []);
    const marker = prompt.includes('alpha') ? 'alpha' : 'beta';
    observed.push(marker);
    send(res, { text: marker });
  }, async provider => {
    const [a,b] = await Promise.all([
      call(provider, { prompt: 'alpha' }),
      call(provider, { prompt: 'beta' }),
    ]);
    assert.equal(a.text,'alpha');
    assert.equal(b.text,'beta');
    evidence('HTTP-005', { concurrentCalls: 2, observed, results: [a.text,b.text] });
  });
});


test('HTTP-006: simulated hidden gateway retry defeats SDK maxRetries=0', async () => {
  let sdkToGateway = 0;
  let gatewayToProvider = 0;
  let firstInferenceCompleted = false;

  // This local upstream simulates inference that completes before its reply
  // is lost. It is NOT a real LLM or the actual Vercel AI Gateway.
  await withProvider(async (req, res) => {
    gatewayToProvider += 1;
    if (gatewayToProvider === 1) {
      firstInferenceCompleted = true;
      req.socket.destroy();
      return;
    }
    send(res, { text: 'gateway retried upstream' });
  }, async (_unusedProvider, upstreamBaseUrl) => {
    await withProvider(async (_req, res, body) => {
      sdkToGateway += 1;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const upstreamResponse = await fetch(
            upstreamBaseUrl + '/chat/completions',
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body,
            },
          );
          const responseText = await upstreamResponse.text();
          res.writeHead(upstreamResponse.status, { 'content-type': 'application/json' });
          res.end(responseText);
          return;
        } catch (error) {
          if (attempt === 1) throw error;
        }
      }
    }, async gatewayProvider => {
      const result = await call(gatewayProvider, { maxRetries: 0 });
      assert.equal(result.text, 'gateway retried upstream');
      assert.equal(sdkToGateway, 1);
      assert.equal(gatewayToProvider, 2);
      assert.equal(firstInferenceCompleted, true);
      evidence('HTTP-006', {
        simulatedGateway: true,
        sdkMaxRetries: 0,
        sdkToGatewayRequests: sdkToGateway,
        gatewayToProviderRequests: gatewayToProvider,
        firstUpstreamWorkCompleted: firstInferenceCompleted,
        duplicateUpstreamInferenceSimulated: gatewayToProvider > 1,
      });
    });
  });
});
