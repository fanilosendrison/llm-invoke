---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-compatibility-assessment"
domain: "llm-invoke"
severity: "guideline"
name: "Historical llm-runtime guarantee preservation assessment against Vercel AI SDK"
---

# llm-runtime guarantee preservation — Vercel AI SDK backend candidate

**Status:** investigative, non-normative, NOT an accepted architecture decision.  
**Assessment date:** 2026-10-17.  
**Source revisions:** `llm-runtime` `29e9a2bb5e2dfdc6cd7f29933ff96536f9226f5d`; `llm-invoke` `08c736ff3b243895b17cfa148458edf01eaed338`.  
**Target:** preserve at least the actually established, desirable execution guarantees of the former runtime, subject to conformity with llm-invoke Product Intent, by composing a maintained execution backend. Vercel AI SDK is the **candidate**, not a mandatory backend or product authority.

## Authority and interpretation

- The normative `docs/specification/llm-invoke-spec.md` §0 governs success, caller authority, uncertainty, backend neutrality and quality boundary.
- This assessment neither amends Product Intent nor ratifies an implementation, architecture, dependency, language, backend, or public API.
- The older repository's specifications, code and tests are evidence of **historical behavior**, not normative sources for llm-invoke. Resolve any divergence between old documentation and implementation by tests against an exact commit.
- **Feature presence != behavioral equivalence != proven conformance.** Labels: `NATIVE-CANDIDATE` = documented relevant feature but not equivalence; `COMPLEMENT` = likely invoke-owned adapter/policy required; `GAP` = no general equivalent established; `EXPERIMENT` = unresolved without code-based probe; `OUT-OF-SCOPE-DECISION` = retaining feature requires product decision.
- Documents reviewed: llm-runtime README, NIB-S, `src/types.ts`, `src/engine/execute-call.ts`, `src/services/retry-resolver.ts`, `src/errors/index.ts`; llm-invoke specification, ADR-001/002, Turnlock compatibility projection. This is a targeted architecture/source inspection, **not** a complete test execution or exhaustive line-by-line audit of all NIB-M/NIB-T and fixtures.

## Guarantee and evidence matrix

| ID | Historical guarantee / behavior | Historical evidence | Vercel AI SDK candidate | Ownership / disposition | Required proof before adoption |
| --- | --- | --- | --- | --- | --- |
| G01 | Adapter-based Anthropic/OpenAI/Google/OpenAI-compatible generation | README; factories/index | NATIVE-CANDIDATE | SDK provider layer | Per-provider request/response and error fixture parity; verify effective model and option mapping |
| G02 | Embeddings, batching, indexed vector outputs | README; NIB-S §2; embedding engine | NATIVE-CANDIDATE / EXPERIMENT | Backend + possible Invoke compatibility requirement | Multi-item order, cardinality, dimensions, malformed/partial batch failure |
| G03 | Typed error taxonomy, provider-specific classification, no raw transport errors escaping | `errors/index.ts`; binding classifiers | COMPLEMENT | Invoke normalization if preserving old error API is selected | Error classification table against all fixtures, with lossless cause/provenance |
| G04 | Bounded exponential retry/backoff; selective retry by classified error | `retry-resolver.ts`; execute-call | NATIVE-CANDIDATE / COMPLEMENT | **One owner of retry decisions** | Fault injection: attempts, delays, fatal paths, cancellation, retry-after; disable overlapping backend retries |
| G05 | Proactive token-rate throttling from response headers + token estimation | NIB-S §2; throttle resolver/service | GAP / COMPLEMENT | Optional specialized policy outside SDK | Fake-clock header/reset/state corpus; concurrent calls; no unbounded waits; unknown-header behavior |
| G06 | Per-attempt timeout, external abort, abortable sleeps, monotonic durations | execute-call; NIB-S §9 | NATIVE-CANDIDATE / COMPLEMENT | SDK transport + Invoke deadline/uncertainty boundary | Abort-before-send, abort-during-fetch/body/retry wait, deadline precedence, timers/cleanup |
| G07 | Normalize provider termination, retain unknown rather than invent reason | `types.ts` TerminationReason; bindings; execute-call | NATIVE-CANDIDATE / COMPLEMENT | Evidence normalization + contract evaluator | Provider reason corpus; unmapped finish reason; exact raw reason preservation |
| G08 | Explicit max-token truncation and optional heuristic silent-truncation detection | `execute-call.ts`, sanitizer | COMPLEMENT | Optional old detector + contract-required completeness evaluator | Fixtures for explicit length, malformed/complete JSON and false positives; heuristic never counts as proof of completeness |
| G09 | Provider-model mismatch check when available; mayRouteModel and configurable predicate | `execute-call.ts`, IntegrityPolicy | COMPLEMENT | Contract evaluation | Missing, ambiguous, alias and gateway model evidence; no success when proof required but absent |
| G10 | Deterministic and observable sanitization of thinking tags and code fences; retain raw output | `types.ts`; `execute-call.ts` | NATIVE-CANDIDATE / COMPLEMENT | Optional transform under explicit output semantics | Fixtures for raw/clean invariance, empty cleaned output, nested tags, schema compatibility; detect lossy transformations |
| G11 | Correlated call ID; structured events; no unconditional prompt/response logging | `types.ts` (15-event union); execute-call; README | COMPLEMENT | Invoke evidence/event adapter | Correlation across attempts/batches, terminal event exactly once, error path; privacy review of preview exception |
| G12 | Passive usage/timing statistics without invented provider token counts | `types.ts`; NIB-S §7 | NATIVE-CANDIDATE / COMPLEMENT | Backend usage + compatibility presentation | Missing token counts remain unknown; cross-attempt totals; no fabricated zeros |
| G13 | Input request immutability, stable type surface, factories with frozen config | NIB-S §3, §5; `types.ts` | EXPERIMENT / COMPLEMENT | Implementation-specific compatibility behavior | Frozen-input/property tests; concurrent invocation isolation |
| G14 | Deterministic pure decisions for retry, throttle, mapping; isolated effects | NIB-S §3 | COMPLEMENT | Invoke decision layer or composed specialized components | Same input/time snapshot => same decision; replay/fault injection |
| G15 | HTTP/JSON parsing centralized and providers restricted to narrow bindings | NIB-S §3, §6 | OUT-OF-SCOPE-DECISION | Backend implementation detail, not portable invariant | Only retain if consumer-observable property depends on it |
| G16 | Fatal provider errors are not reported as successful responses | NIB-S I-4; execute-call | NATIVE-CANDIDATE / COMPLEMENT | Invoke outcome evaluator | HTTP OK with invalid body, provider 4xx/5xx, content filter, partial stream |
| G17 | No silent fallback or substitution in prior runtime | NIB-S I-3; execute-call | COMPLEMENT | Explicit caller authorization + provenance evaluation | Forbidden / allowed backend fallback, alias, silent gateway reroute |
| G18 | Strictly bounded single semantic operation; no tool/agent loop implicit | Historical multi-message completion API; Invoke TL-COMP-001 | EXPERIMENT / COMPLEMENT | Invoke/Turnlock compatibility boundary | Disable auto tool loop; distinguish physical attempts from semantic operation |
| G19 | Never claim known execution failure when provider may have executed after request transmission | **NOT established in old runtime**: timeout is retryable and thrown as `TimeoutError` | GAP | **New normative llm-invoke outcome semantics** | Inject drop before send / during send / after accepted / after inference; demonstrate `IndeterminateExecution` where required |
| G20 | Contract-owned required model/provider/capabilities/parameters/termination/completeness/deadline/retry/duplicate tolerance/provenance | **NOT established as single contract in old runtime** | GAP | **New normative llm-invoke core** | Contract-by-contract conformance vectors; missing evidence never silently upgraded to success |

## Critical incompatibilities / no-regression hazards

1. **Retry multiplication.** Vercel `generateText` documents `maxRetries` defaulting to 2, with `0` disabling retries. Wrapping it in another independently retrying layer can multiply attempts. The chosen policy must own physical-attempt admission and preserve uncertainty on any sent-but-unconfirmed attempt. Turning off SDK retries is one possible realization, **not an accepted design**.
2. **Timeout != definitely not executed.** The old implementation classifies a timed-out attempt as retryable. `llm-invoke` §0.4.4 prohibits turning materially unknown execution into a known failure. Distinguish transmission-phase evidence, provider-side execution evidence, and transport observations before classifying an outcome.
3. **Provider-model provenance.** The old mismatch check runs only if `providerModel` is supplied; missing model metadata can still yield a response. The new Product Intent disallows `VerifiedSuccess` whenever model identity is contract-required and cannot be established.
4. **Unknown termination.** The old `failOnUnknownTermination` is opt-in; unknown reason can return ordinarily. In Invoke, acceptability depends on declared termination requirements, with unavailable evidence distinguished from known violation.
5. **Truncation.** Old runtime detects explicit max tokens but `failOnSilentTruncation` applies to its silent heuristic only. Neither a heuristic nor an SDK success response proves completeness.
6. **Sanitization and raw response.** Mutating output can affect evidence/structure and user expectations. Preservation requires traceability from raw to transformed representation and an explicit distinction between generated and transformed content.
7. **Opaque backend metadata.** Vercel has `response.modelId`, `rawFinishReason`, `warnings`, `providerMetadata`, headers, and per-step information, but individual fields do not universally prove actual provider execution. Treat evidence availability per provider/backend and version.
8. **SDK execution boundary.** `wrapLanguageModel` middleware can intercept model calls, but does not automatically see the entire physical transport timeline, hidden gateway retries, or provider-side completion. Capability proof requires instrumentation or controlled fault injection at the proper boundary.
9. **Observability discrepancies.** README refers to 15 events; older normative NIB-S text mentions 14 in a section while `src/types.ts` defines 15 variants. Resolve historical parity against actual code and tests, not one prose count.
10. **Configuration discrepancies.** README examples give defaults (retry 2 attempts, 60 s) that differ from visible `execute-call.ts` constants (5 attempts, 120 s). The implementation at exact SHA, plus tests, is the relevant source for actual behavior; do not copy README defaults into the preservation contract without reconciliation.

## Proposed interpretation of 'no fewer guarantees'

Preserve each **behavioral property** of `llm-runtime` for which (a) the behavior is actually established at the pinned revision, (b) it remains desired for Invoke consumers, and (c) it does not contradict the Product Intent. Features like mandatory provider HTTP bindings, TypeScript public API, fixed logging event shape, and default retry count are **not** automatically obligations of `llm-invoke`. Preserve beneficial operational behavior by composition first, writing missing components only when necessary.

For any invocation contract `C` and backend `B`:

- `VerifiedSuccess` requires evidence sufficient for **every applicable condition** of `C`, not merely SDK completion.
- A known unmet mandatory condition produces non-success with the violation preserved.
- A materially unknown required condition does not get treated as satisfied; do not collapse sent-but-unconfirmed execution into definitely failed execution.
- Candidate backend limitations restrict contracts the backend can satisfy; they cannot amend the product meaning.

## Verification backlog (priority order)

**P0 / safety of success claims**
1. Pin exact Vercel AI SDK packages and provider adapters, not floating documentation. Capture installed export/types/source version and test harness.
2. Run an evidence-availability matrix for each target provider: effective model, provider identity, termination/raw termination, provider parameters/warnings, usage, response IDs, headers, provider/gateway fallback behavior.
3. Build a controllable transport/proxy fault injector to distinguish pre-transmission, post-transmission, provider-completed-but-lost, timeout, abort, connection reset and partial body/stream. Confirm which phases are observable, which are inherently unknown.
4. Prove one retry authority and contract-aware duplicate-execution policy, including upper bounds on physical attempts and no silent fallback.
5. Derive outcome precedence/composition for simultaneous violation, operational failure, and uncertainty; this is **open** in current Invoke spec (§1). Do not invent precedence in code.

**P1 / historical robustness parity**
6. Execute old `llm-runtime` test corpus at exact SHA as reference; inventory NIB-M/NIB-T vectors and record explicit mapping IDs.
7. Replay provider/error/termination/structured-output/truncation/sanitization fixtures against the SDK adapter and Invoke overlay, recording semantic losses.
8. Validate proactive throttling, fake-clock deadlines, abortable waiting, idempotence-sensitive retries and concurrency isolation.
9. Verify event correlation, error taxonomy, evidence provenance, usage fields and privacy guarantees.

**P2 / portability and evolution**
10. Confirm embedding requirements, capability support negotiation, optional transforms and adapter compatibility with multiple SDK/provider versions.
11. Repeat key P0/P1 tests on another backend to show the contract is not accidentally Vercel-specific.

## Backend documentation evidence (investigation starting points)

- Vercel AI SDK `generateText`: https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text — `maxRetries`, `abortSignal`, timeout, finish and raw finish reason, warnings, response metadata, usage, steps.
- Vercel language model middleware: https://ai-sdk.dev/docs/ai-sdk-core/middleware — `transformParams`, `wrapGenerate`, `wrapStream` and composition behavior.
- Vercel middleware API: https://ai-sdk.dev/docs/reference/ai-sdk-core/language-model-v2-middleware — interface/version stability needs verification for pinned packages.

## Decision boundary

**Recommendation for discussion, not adopted:** maintain SDK backend neutrality in Product Intent; select Vercel AI SDK as a **first conformance candidate** once pinned and evaluated; retain/reimplement specialized mechanisms only to close *demonstrated* gaps. If this position is ratified, record the rationale in a separate accepted ADR. Do not declare universal historical-parity PASS until the entire pinned corpus and new failure-injection probes run.
