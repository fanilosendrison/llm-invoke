---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-derivation"
domain: "llm-invoke"
severity: "guideline"
name: "Non-duplicating inference: derived obligations and experimental gates"
---

# Universal at-most-once — derived verification and backend-admissibility gates

**Status: DERIVED / NON-NORMATIVE.** Source authority: Product Intent §0.6.1
and ADR-003. No backend, source-language, API, persistence or transport
mechanism is selected here.

**Counterexample:** Vercel `ai@7.0.141` plus
`@ai-sdk/openai-compatible@3.0.66`, controlled localhost provider, CI
https://github.com/fanilosendrison/llm-invoke/actions/runs/39073654672
(`HTTP-004`): first server operation completed then lost reply; SDK retry
made 2 HTTP requests and returned normal result. This simulates the risk; it
does not demonstrate actual inference duplication at a real provider.

## Product-level invariant and boundaries

For each distinct caller-intended inference, count actual model executions
at the provider inference boundary. Allowed cardinality is `0 | 1`.
HTTP attempts can differ from inference count, but no backend is
admissible without adequate evidence and control of that distinction.
A retry, recovery, worker restart or gateway switch cannot silently
create a fresh logical invocation for the same caller intent.

| Prior execution knowledge | Permitted next action | Outcome if unrecoverable |
| --- | --- | --- |
| Never attempted | Admit one execution on a qualified path | No result yet |
| Prior inference definitely did not occur | May retry if caller policies also permit | Known failure if no further attempt |
| Prior inference occurred; result known | Evaluate the existing result without re-execution | May become VerifiedSuccess |
| Prior inference may have occurred; no dedup | **Stop. No new inference** | IndeterminateExecution |
| Idempotent transport replay with proven model-boundary dedup | May resend transport while keeping inference <=1 | Dependent on evidence |
| Backend allows ungoverned hidden retries/failover | **Reject backend before dispatch** | Unsupported/non-success; exact outcome representation open |
| Two inferences established for one logical invocation | Never report success; retain violation | ContractViolation |

## Minimum falsifiable tests to derive next

| Test ID | Scenario | Required observation |
| --- | --- | --- |
| AMO-01 | Socket dropped after first inference completed | Exactly one inference; no retry; IndeterminateExecution |
| AMO-02 | DNS/connect failure proven before acceptance | Retry may be permitted, and total inference <=1 |
| AMO-03 | Socket drop midway through transmitted body | If prior inference possible: block retry |
| AMO-04 | HTTP 429/5xx with unproven execution status | Error category alone does not permit retry |
| AMO-05 | Provider idempotency key, stable invocation | Multiple transport deliveries; inference counter <=1 |
| AMO-06 | Worker crash after dispatch and resume | Same invocation is not sent anew |
| AMO-07 | Two concurrent workers race for same logical invocation | Inference counter <=1 |
| AMO-08 | Two genuinely separate caller intents with identical prompts | Each independent invocation can execute once |
| AMO-09 | Gateway hidden retry or timeout-triggered fallback | Backend rejected unless duplicate inference demonstrably prevented |
| AMO-10 | Caller sets duplicate-execution tolerance = true | No waiver: incompatible configuration rejected |
| AMO-11 | Known duplicate execution | Explicit non-success and retained violation evidence |
| AMO-12 | Ambiguous result plus unknown model identity | No success and no second inference |

## Consequences for Vercel SDK candidacy

- SDK `generateText` documents `maxRetries=2` by default, and
  `maxRetries:0` disables SDK-level retries; the previous experiment
  verified it with mocked calls. This is a necessary candidate control, **not
  a sufficient whole-path guarantee**.
- The SDK supports multi-step model invocations when configured to do so;
  its default single-step behavior must be held at the required raw-inference
  boundary.
- Vercel AI Gateway documents provider selection, fallback models and
  timeout-driven failover. A provider that continues working after the
  gateway times out can lead to more than one inference.
- Neither direct provider adapters nor SDK middlewares magically expose
  provider-side execution certainty; admissibility must be verified per
  execution route.
- Sources:
  https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text ;
  https://vercel.com/docs/ai-gateway/models-and-providers/provider-options ;
  https://vercel.com/docs/ai-gateway/models-and-providers/model-fallbacks ;
  https://vercel.com/docs/ai-gateway/models-and-providers/provider-timeouts .

## Remaining architectural questions (NOT decided here)

How logical invocations are identified across crashes; whether any durable
admission record is needed; which providers give enforceable idempotency at
model-execution level; whether upstream policies expose all retries and
fallbacks; how to classify failed pre-admission; how to resolve simultaneous
non-success facts. These must be derived and conformance-tested, not guessed
from an SDK's normal-return semantics.

**Status:** at-most-once is a **product requirement**; **backend conformance
is not yet proven**. Do not confuse these two statements.
