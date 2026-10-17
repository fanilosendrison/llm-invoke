---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "experimental-evidence"
domain: "llm-invoke"
severity: "guideline"
name: "Exact llm-runtime baseline and pinned Vercel SDK evidence"
---

# Baseline and execution-backend evidence — 2026-10-17

> **2026-10-18 correction:** The product owner has ruled out double
> actual inference for the same logical invocation universally. The
> previous caller-selectable duplicate-tolerance interpretation is
> superseded by [ADR-003 / PR #2](https://github.com/fanilosendrison/llm-invoke/pull/2).
> Existing observations and test results are unchanged.

**Status: MEASURED / PARTIAL CONFORMANCE COVERAGE.** This is a non-normative evidence report, NOT an accepted product or architectural decision and NOT a parity certification.

## Source identities and provenance

| Item | Exact identity | Evidence |
| --- | --- | --- |
| Historical runtime | `fanilosendrison/llm-runtime` `29e9a2bb5e2dfdc6cd7f29933ff96536f9226f5d` | https://github.com/fanilosendrison/llm-runtime/commit/29e9a2bb5e2dfdc6cd7f29933ff96536f9226f5d |
| Historical CI | run `34904759785`, 2026-09-14, exact above SHA | https://github.com/fanilosendrison/llm-runtime/actions/runs/34904759785 |
| Historical Node 22 job | `104178730946` | 28 Vitest files / 644 PASS |
| Historical Node 20 job | `104178731254` | 28 Vitest files / 644 PASS |
| Historical build job | `104178863282` | PASS |
| Invoke Product Intent baseline | `08c736ff3b243895b17cfa148458edf01eaed338` | `docs/specification/llm-invoke-spec.md` |
| AI SDK experiment | `ai@7.0.141`, `@ai-sdk/openai-compatible@3.0.66`, Node.js 22 | https://github.com/fanilosendrison/llm-invoke/actions/runs/39075284045 |
| SDK experiment revision | `39aa345ebd53a39000d8e145a3168370247e49e5` | 15/15 PASS; zero paid-provider calls |
| SDK resolution | SHA-256(`package-lock.json`) `db1a618790d34b8c8b4bd6a0cddd4c2b6488a7254fdfc9d48bc42378305b6245` | CI artifact `vercel-sdk-evidence-ad79d9ef16525afcf79346423f3c839029e8a9ba` (retention 30 days) |

These are **observations from completed existing CI jobs**; historical tests were not re-executed here because the container has no outbound GitHub DNS. The exact-SHA CI run was independently inspected, including its test summaries and job steps. No assertion of independent live re-execution of the old runtime is made.

## Historical regression baseline — evidence grouping

| Historical test group | File count | Tests passed | Coverage nature |
| --- | ---: | ---: | --- |
| Provider bindings (Anthropic, OpenAI, OpenAI-compatible, DeepSeek thinking, Google, embeddings) | 6 | 144 | Normalization and provider fixture parsing |
| Generation engine (happy path, retry, timeout/abort, integrity, throttle, body timeout) | 6 | 122 | Operational call execution |
| Embeddings engine (batch and body timeout) | 2 | 35 | Batch execution |
| Services (retry, throttle, token estimate, sanitizer, signals, classifiers, Retry-After, error kinds) | 8 | 213 | Pure policy functions |
| Cross-cutting contracts / properties (observability, errors, stats, temporal, global, property) | 6 | 130 | Public and system contract tests |
| **TOTAL** | **28** | **644** | Same passing suite on Node.js 20 and Node.js 22 |

Historical CI tests verify the historical runtime's own rules. They **do not** test that an invoke contract can distinguish provider-side execution certainty after transport failure, require actual model identity, or forbid duplicate-execution risk; these are different product-level questions.

### Historical documentation mismatches

- README example `retry.maxAttempts = 2` while `src/engine/execute-call.ts` default is **5** physical attempts.
- README example `perAttemptMs = 60000` while engine default is **120000**.
- Historical NIB-S section says 14 events, while `src/types.ts` defines 15 variants; CI behavioral shape is authoritative for actual behavior at the pinned SHA.
- These are discrepancies in the reference, not failings of the executed historical test suite. Do not silently turn README settings into preservation obligations.

## Vercel AI SDK experiment — 15/15 PASS

Sources: `experiments/vercel-ai-sdk-evidence/probe.test.mjs`, `transport.test.mjs`, and `.github/workflows/vercel-sdk-evidence.yml`. Mock providers and a local HTTP server; **no real provider or gateway contacted**.

| Probe | Observed result | Consequence for Invoke |
| --- | --- | --- |
| SDK-001 | Text returned with normalized `stop` and raw finish reason | SDK offers useful termination signals |
| SDK-002 | `length` and incomplete text returned without an error | Completeness must be checked against caller contract |
| SDK-003 | `other` with unknown raw reason returned without an error | Unknown required termination must not become VerifiedSuccess |
| SDK-004 | One `unsupported-setting` warning and normal return | Required parameter semantics cannot rely on SDK normal return |
| SDK-005 | Explicit `maxRetries: 0` made exactly one mocked model call | Can disable SDK-level retry at this API boundary |
| SDK-006 | Explicit `maxRetries: 1` made two calls on a retryable failure | Physical-attempt policy must be owned and bounded |
| SDK-007 | With NO provider response metadata, `response.modelId` populated as `mock-model-id`, equal to selected model ID | **Response model ID alone is not proof of actual provider model identity** |
| SDK-008 | `wrapLanguageModel` middleware entered once for one model call | Middleware is a candidate interception hook, not proof of transport coverage |
| SDK-009 | Caller `AbortSignal` was visible inside model call | Signal forwarding shown; cancellation/remote-effects not yet proved |
| HTTP-001 | Requested model `requested-model`; local HTTP provider reported `other-executed-model`; SDK returned normally and exposed different model in `response.modelId` | Model mismatch known, but SDK does not enforce caller contract |
| HTTP-002 | Local provider returned `finish_reason: length`; SDK returned normally and reported `length` | Same issue reproduced through actual HTTP/adapter path |
| HTTP-003 | Fake provider marked its first operation complete then destroyed socket; `maxRetries: 0` => one HTTP request and error | Error does **not** establish whether upstream work occurred |
| HTTP-004 | Same first-operation-completed-then-socket-reset; `maxRetries: 1` => **two HTTP requests**, second completed, normal result returned | Direct evidence of automatic replay despite first completed upstream operation; universal at-most-once rule forbids relying on such a retry without execution-boundary deduplication |
| HTTP-005 | Two parallel requests returned correctly attributed `alpha` and `beta` | Basic isolation shown in this simple case only |
| HTTP-006 | Simulated intermediary made **one SDK→gateway request** and **two gateway→provider requests** despite SDK `maxRetries: 0` after first simulated upstream work completed and lost its reply | Client-side retry suppression does not control hidden downstream retries. **Local proxy simulation only**, not evidence that Vercel AI Gateway actually performed this behavior |

**Interpretation boundary:** a simulated server-side completion is not evidence of a real model completing or billing; it proves a transport sequence where an SDK client cannot distinguish completed upstream work from a failed operation based on its error alone. Each experiment is bounded to the pinned versions and local conditions. No live provider access, billing, gateway reroute, full streaming, headers-rate-limit or credential use was tested.

**Experiment CI detail:** first workflow run `39073430556` failed **before tests** because an unsaved temporary npm manifest did not produce a lockfile. This harness defect was corrected. Subsequent core mock run `39073483842` passed 9/9 with `ai@7.0.141`; complete run `39073654672` passed 14/14 after pinning the OpenAI-compatible adapter and transitive resolution for that run. The extended complete run `39075284045` passed 15/15 including the simulated hidden proxy retry, with the **same dependency lockfile SHA-256**. Do not count harness setup failure as evidence of SDK functional failure.

## Crosswalk into the original assessment

- `G01`: limited provider path only (local OpenAI-compatible test); broad provider parity **NOT VERIFIED**.
- `G04`: basic retry controls observed, and post-execution socket loss replay **MEASURED**. Contract-aware retry authority **NOT IMPLEMENTED**.
- `G06`: signal forwarding measured; provider-side cancellation, body-deadline semantics, and monotonic time **NOT VERIFIED**.
- `G07/G08`: provider `length` and unknown finish can return ordinarily; Invoke completeness/termination policy needed when contract requires it.
- `G09`: mismatched model metadata is exposed but not contract-enforced; missing provider model metadata may be filled by SDK fallback.
- `G10`: sanitization parity **NOT VERIFIED**.
- `G13`: basic 2-call isolation measured; full concurrent state correctness **NOT VERIFIED**.
- `G17`: forbidden/allowed backend fallback and gateway substitutions **NOT VERIFIED**.
- `G19/G20`: correctness gap is demonstrated as a **product requirement**, not an implemented or proved resolution.
- All other families (including proactive throttle, embedding end-to-end, event privacy and error taxonomy) remain **NOT VERIFIED** for SDK parity.

## P0 inferences — not yet implementation decisions

1. A contract evaluation must not equate SDK return with `VerifiedSuccess` (length, unsupported setting, unknown termination, and known model mismatch may return normally).
2. Separate **model requested**, **model declared by SDK**, and **model observed from provider evidence**. When exact actual model is required, an SDK-provided default model ID alone is insufficient evidence.
3. **Duplicate actual inference is never acceptable for one logical invocation.** A caller cannot waive that prohibition. A retry after possibly completed upstream work is forbidden without sufficient evidence of no prior inference or effective inference-boundary deduplication. The architecture must govern the full execution path; setting `maxRetries: 0` may be necessary but does not prove that upstream gateways do not retry.
4. Lost-response failure is not evidence that the upstream provider did not execute; do not turn materially unknown execution into a certain `ExecutionFailure`.
5. A wrapper can evaluate observed outcomes, but cannot manufacture proof missing at the chosen backend boundary. Capability/evidence insufficiency must fail closed.

## Next gated verification stage

1. **Freeze a reproducible suite**: check in a reviewed `package-lock.json` for the isolated experiment (currently lockfile and checksum archived as CI artifact) and bind outputs to exact revision and dependency resolution.
2. **Expand transport adversarial cases**: TCP connection failure before send, cut during body transfer, server accepts then delays/loses response, partial response body, cancellation after send, 429/503 and `Retry-After`, proxy retry and gateway failover; instrument server-side accepted/completed counters and client attempts separately.
3. **Provider evidence matrix**: for each selected backend/provider, record source and trust level for model/provider identity, actual parameters/capabilities, finish reason, response integrity, fallback and retry provenance. Distinguish requested defaults from returned evidence.
4. **Historical 644-vector migration map**: do not blindly port implementation tests. Derive minimum distinct **behavioral equivalence or conformance obligations**, with one-to-many mapping back to historical test names and property groups, then selectively replay fixtures and fault injections.
5. **Outcome algebra decision**: derive coexistence/precedence of violation, execution failure and uncertainty with no semantic collapse. Resolve via authoritative Product Intent/explicit accepted decision, not from SDK defaults.
6. **Ratification separate from experiments**: only if the user authorizes, create an ADR selecting Vercel as first backend reference **without making it a mandatory product semantic dependency**. No present document has accepted that decision.

## Assessment outcome

`HISTORICAL_BASELINE=GREEN_AT_EXACT_SHA`  
`SDK_MOCK_AND_LOCAL_HTTP_PROBES=15/15_PASS`  
`HISTORICAL_PARITY=UNDETERMINED`  
`INVOKE_CONFORMANCE=NOT_YET_TESTED`  
`PRODUCT_INTENT_CHANGED=NO`  
`ARCHITECTURE_ACCEPTED=NO`
