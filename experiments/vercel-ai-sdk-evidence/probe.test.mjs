// Isolated backend-behavior evidence probe; NOT llm-invoke runtime design.
// Target: Vercel AI SDK ai@7.0.141, mocked LanguageModelV3, no network model calls.
// All assertions are evidence of SDK behavior at the installed version only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateText, APICallError, wrapLanguageModel } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';

function usage() {
  return {
    inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined },
    outputTokens: { total: 2, text: 2, reasoning: undefined },
  };
}
function generated({ text = 'response', unified = 'stop', raw = 'stop', warnings = [] } = {}) {
  return {
    content: [{ type: 'text', text }],
    finishReason: { unified, raw },
    usage: usage(),
    warnings,
  };
}
function evidence(id, facts) {
  console.log('INVOKE_EVIDENCE ' + JSON.stringify({ probe: id, ...facts }));
}
function mock(doGenerate) {
  return new MockLanguageModelV3({ doGenerate });
}
function transient() {
  return new APICallError({
    message: 'controlled retryable provider failure',
    url: 'https://example.test/inference',
    requestBodyValues: { prompt: 'fake' },
    statusCode: 503,
    isRetryable: true,
  });
}

test('SDK-001: successful generated text and normalized finish reason', async () => {
  const result = await generateText({
    model: mock(async () => generated({ text: 'hello' })),
    prompt: 'probe',
    maxRetries: 0,
  });
  assert.equal(result.text, 'hello');
  assert.equal(result.finishReason, 'stop');
  evidence('SDK-001', {
    resultText: result.text,
    normalizedFinishReason: result.finishReason,
    rawFinishReason: result.rawFinishReason ?? null,
    modelId: result.response?.modelId ?? null,
  });
});

test('SDK-002: length termination can return ordinary successful API result', async () => {
  const result = await generateText({
    model: mock(async () => generated({
      text: '{ "unfinished":',
      unified: 'length',
      raw: 'max_output_tokens',
    })),
    prompt: 'probe',
    maxRetries: 0,
  });
  assert.equal(result.finishReason, 'length');
  assert.equal(result.text, '{ "unfinished":');
  evidence('SDK-002', {
    returnedNormally: true,
    finishReason: result.finishReason,
    rawFinishReason: result.rawFinishReason ?? null,
    contentReturned: result.text.length > 0,
  });
});

test('SDK-003: unknown termination can return ordinary successful API result', async () => {
  const result = await generateText({
    model: mock(async () => generated({
      unified: 'other',
      raw: 'unmapped_reason_from_provider',
    })),
    prompt: 'probe',
    maxRetries: 0,
  });
  assert.equal(result.finishReason, 'other');
  evidence('SDK-003', {
    returnedNormally: true,
    finishReason: result.finishReason,
    rawFinishReason: result.rawFinishReason ?? null,
  });
});

test('SDK-004: warning about unsupported setting does not automatically reject generation', async () => {
  const result = await generateText({
    model: mock(async () => generated({
      warnings: [{ type: 'unsupported-setting', setting: 'temperature' }],
    })),
    prompt: 'probe',
    maxRetries: 0,
  });
  assert.equal(result.text, 'response');
  evidence('SDK-004', {
    returnedNormally: true,
    warningsCount: result.warnings?.length ?? 0,
    warningTypes: (result.warnings ?? []).map(x => x.type),
  });
});

test('SDK-005: maxRetries=0 prevents hidden SDK retry of retryable error', async () => {
  let calls = 0;
  const model = mock(async () => {
    calls += 1;
    throw transient();
  });
  await assert.rejects(
    generateText({ model, prompt: 'probe', maxRetries: 0 }),
  );
  assert.equal(calls, 1);
  evidence('SDK-005', { physicalMockAttempts: calls, maxRetries: 0 });
});

test('SDK-006: maxRetries=1 permits second physical model call', async () => {
  let calls = 0;
  const model = mock(async () => {
    calls += 1;
    if (calls === 1) throw transient();
    return generated();
  });
  const result = await generateText({ model, prompt: 'probe', maxRetries: 1 });
  assert.equal(result.text, 'response');
  assert.equal(calls, 2);
  evidence('SDK-006', { physicalMockAttempts: calls, maxRetries: 1 });
});

test('SDK-007: response.modelId exists without provider-supplied response metadata', async () => {
  const model = mock(async () => generated());
  const result = await generateText({ model, prompt: 'probe', maxRetries: 0 });
  // The model mock intentionally returns no response metadata at all.
  // SDK fallback to the requested model ID must not be mistaken for provider proof.
  assert.equal(typeof result.response?.modelId, 'string');
  evidence('SDK-007', {
    doGenerateHadResponseMetadata: false,
    reportedModelId: result.response.modelId,
    requestedModelId: model.modelId,
    reportedEqualsRequested: result.response.modelId === model.modelId,
  });
});

test('SDK-008: model middleware can observe each generation invocation', async () => {
  let middlewareCalls = 0;
  let providerCalls = 0;
  const model = wrapLanguageModel({
    model: mock(async () => {
      providerCalls += 1;
      return generated();
    }),
    middleware: {
      specificationVersion: 'v3',
      wrapGenerate: async ({ doGenerate }) => {
        middlewareCalls += 1;
        return await doGenerate();
      },
    },
  });
  const result = await generateText({ model, prompt: 'probe', maxRetries: 0 });
  assert.equal(result.text, 'response');
  assert.equal(middlewareCalls, 1);
  assert.equal(providerCalls, 1);
  evidence('SDK-008', { middlewareCalls, providerCalls });
});

test('SDK-009: external AbortSignal is offered at language-model boundary', async () => {
  const controller = new AbortController();
  let sawSignal = false;
  const model = mock(async params => {
    sawSignal = Boolean(params.abortSignal);
    return generated();
  });
  const result = await generateText({
    model, prompt: 'probe', maxRetries: 0, abortSignal: controller.signal,
  });
  assert.equal(result.text, 'response');
  evidence('SDK-009', { sawSignal });
  assert.equal(sawSignal, true);
});
