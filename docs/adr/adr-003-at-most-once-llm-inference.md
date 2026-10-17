---
okf_version: "1.0"
adr_profile_version: "0.1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-decision-record"
domain: "llm-invoke"
severity: "strict"
name: "At-most-once actual inference per logical invocation"
id: "ADR-003"
status: "accepted"
date: "2026-10-18"
decision_body_sha256: "bafcb5236f3de73b147f1fc7ebeb39795e0c0bb7dfa5d70a1ad32c01a8a01f78"
relation_completeness: "complete"
relations:
  clarifies: []
  amends:
    - "ADR-001"
  supersedes: []
  confirms: []
governs:
  - "at-most-once actual LLM inference and replay admissibility"
---

# ADR-003: At-most-once actual LLM inference per logical invocation

- **Status:** Accepted product decision, pending integration of this proposal
  through repository review.
- **Date:** 2026-10-18
- **Amends:** ADR-001
- **Fingerprint convention:** SHA-256 of the UTF-8 content from
  `## Context` (inclusive) through EOF, including the final LF.

## Context

The original Product Intent included caller-selectable
`duplicate-execution tolerance` and treated retry after uncertain execution
as conditionally admissible. The product owner explicitly rejected double
execution as an acceptable outcome. In controlled CI run `39073654672`,
probe `HTTP-004` showed a new Vercel SDK HTTP request after a local
server completed its first operation and lost the response; this was a
simulated transport demonstration, not a real provider's inference record.

## Decision

`llm-invoke` must permit at most one actual LLM inference execution per
logical caller-intended invocation, with no contract or caller waiver.
It may execute zero times. This is a universal Product Intent constraint,
not an optional `InvocationContract` setting.

Retries, failover and recovery preserve the identity of the original
logical invocation. A second HTTP request is admissible only when it is
established that no earlier inference happened, or when a proven
inference-boundary idempotency/deduplication mechanism rules out a second
actual inference. A timeout, disconnect or missing reply is not such proof.

When the earlier execution may have occurred and its result cannot be
reliably recovered, no second inference is admissible and
`IndeterminateExecution` must be preserved. Known duplicate execution is
a violation, not an availability tradeoff. Identical prompts from genuinely
different caller-intended operations remain separate invocations; a
technical replay may not be renamed to bypass this prohibition.

The safety rule applies across the full execution path, including SDK,
router, gateway, provider, and process recovery. An opaque backend whose
hidden replays cannot be excluded sufficiently must not be admitted as a
conformant execution path. Client `maxRetries: 0` alone does not prove
end-to-end absence of duplicated inference.

This amendment to ADR-001 is made simultaneously with the normative
Product Intent update in `docs/specification/llm-invoke-spec.md`.
It neither requires exactly-once execution nor selects an API, language,
backend, provider, storage or deployment model.

## Rationale

Availability cannot override the integrity of execution. A lost response
can force non-success even after inference actually occurred. The system
must expose the uncertainty instead of attempting inference again.
Inference cardinality and HTTP request cardinality are different facts.

## Consequences

- Caller retry permissions are always subordinate to at-most-once inference.
- Retry after possibly executed inference requires established end-to-end
  deduplication; otherwise it is forbidden.
- An implementation must address execution-path admissibility, recovery
  identity continuity, concurrent admissions and hidden gateway behaviors,
  without choosing the mechanisms in this ADR.
- Historic `llm-runtime` timeout retry behavior cannot be imported without
  a non-duplication guard.
- Turnlock remains orchestration authority but cannot replay the same
  logical invocation merely to recover an uncertain result.

## Alternatives considered

### Allow duplicate-execution tolerance in the caller contract

Rejected. The product-level constraint is unconditional.

### Rely on the SDK to perform safe retries

Rejected. Ordinary retry success is not evidence that no earlier
inference occurred.

### Forbid every repeated HTTP exchange

Rejected as conflating transport retry with a second model execution;
provably safe retries or inference-boundary deduplication remain possible.

### Promise exactly-once execution

Rejected. At-most-once does not guarantee execution, response delivery,
or response recovery after a network failure.
