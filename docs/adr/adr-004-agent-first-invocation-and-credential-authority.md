---
okf_version: "1.0"
adr_profile_version: "0.1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-decision-record"
domain: "llm-invoke"
severity: "strict"
name: "Establish agent-first invocation and credential authority"
id: "ADR-004"
status: "accepted"
date: "2026-10-18"
decision_body_sha256: "ece1df25f85f57688712b83d6e8136788fe678adef326e10accb7131c9ed2c95"
relation_completeness: "complete"
relations:
  clarifies: []
  amends:
    - "ADR-001"
  supersedes: []
  confirms:
    - "ADR-002"
    - "ADR-003"
governs:
  - "agent-first invocation adoption and explicit invocation-parameter authority"
  - "credential-resolution and secret-authority boundary"
---

# ADR-004: Establish agent-first invocation and credential authority

- **Status:** Accepted
- **Date:** 2026-10-18
- **Governs:** agent-first invocation adoption, explicit invocation-parameter
  authority, and the credential-resolution boundary
- **Amends:** ADR-001
- **Confirms:** ADR-002 and ADR-003

## Context

The existing Product Intent correctly defines invocation integrity, caller-owned
acceptance conditions, explicit outcomes, and backend neutrality. It does not
yet state explicitly that the priority construction experience is adoption by
an agent building or modifying software, or define the responsibility boundary
for resolving and using credentials.

Without these decisions, low-friction adoption could be pursued by weakening
contract expression, treating requested parameters as preferences, or requiring
each caller to rebuild authentication and integrity mechanisms. Credential
support could also couple the universal product to one secret store, one
personal registry format, or unsafe command execution.

A separate historical audit is evaluating relevant `llm-runtime` guarantees and
Vercel AI SDK capabilities. This decision must preserve backend neutrality and
must not claim evidence or parity that the audit has not established.

## Decision

This decision amends ADR-001 by making additional product requirements explicit;
it neither removes nor reverses ADR-001's authority hierarchy. It confirms
ADR-002 without changing the Turnlock boundary and confirms ADR-003 without
weakening universal at-most-once actual LLM inference.

The following decisions are accepted:

1. `llm-invoke` prioritizes agent-first adoption for software construction
   without becoming an agent, harness, or orchestrator. Adoption convenience
   cannot weaken universal at-most-once actual LLM inference or any other
   invocation guarantee.
2. The standard conceptual invocation surface is minimal and based on provider,
   model, reasoning when requested, and prompt or messages as input. This is a
   product-interface direction, not a type or implemented API.
3. Parameters explicitly requested by the caller are contractual conditions,
   not silently mutable preferences.
4. Provider- and model-specific reasoning modes have no automatic universal
   equivalence.
5. Outcomes remain explicit and mechanically interpretable, and execution
   uncertainty must be preserved rather than converted into success or used to
   justify another inference.
6. `llm-invoke` owns a credential-resolution and credential-use boundary but
   does not intrinsically own durable secret storage, creation, revocation, or
   rotation.
7. Independent credential adapters are supported so that no secret source or
   personal registry format becomes mandatory product infrastructure.
8. The product remains backend-neutral, and backend mechanisms do not determine
   invocation success.
9. Vercel AI SDK is a preferred realization candidate that has not yet been
   selected or qualified.
10. Relevant historical guarantees must be preserved through explicit
    comparison and evidence only when they conform to the current Product
    Intent. Historical retry mechanisms that may cause a second inference for
    one logical invocation must not be preserved as guarantees, and parity with
    `llm-runtime` is not claimed without conformance tests.

Section 0 of the specification remains the sole consolidated normative product
contract. This ADR records decision provenance and does not become a second
independently maintained copy of Product Intent.

## Rationale

Low-friction integration must result from composition and abstraction of
provider authentication, execution-integrity checks, retry safety, termination
interpretation, and outcome classification. It must not result from reducing
guarantees, concealing uncertainty, or permitting a second actual inference for
a logical invocation.

A concise invocation surface makes the common construction path accessible to
agents and other callers while direct contractual authority prevents that
convenience from becoming semantic ambiguity. An independent credential
boundary similarly removes repetitive caller work without making one personal
secret-management choice universal.

## Consequences

- A future public API must permit trivial common-case integration while keeping
  advanced acceptance conditions expressible.
- Future authentication configuration must remain independent of provider
  execution and contract evaluation.
- Future outcomes must support mechanical interpretation without forcing
  callers to inspect provider-specific responses.
- Exact API syntax and types, serialized contract representation,
  implementation language, package architecture, credential-adapter protocol,
  backend realization, persistence, events, streaming, and conformance tooling
  remain undecided.
- Doppler and the current personal credential registry may be supported by an
  independent adapter but are not universal core dependencies.
- Agent-first mechanisms and imported historical behavior remain subordinate to
  universal at-most-once actual inference. A historical retry that may cause a
  second inference is non-conformant rather than a guarantee to preserve.
- No implementation, backend qualification, or historical parity is established
  by this decision.

## Alternatives considered

### Require every caller to write a detailed contract for the common case

Rejected. It would make callers reconstruct product semantics instead of
receiving a trustworthy, low-friction invocation primitive.

### Treat requested parameters as preferences

Rejected. Silent provider, model, or reasoning changes would contradict caller
authority and fail-closed invocation semantics.

### Require environment variables as the only credential source

Rejected. Environment variables are one possible integration mechanism, not a
universal requirement.

### Integrate Doppler directly into the universal core

Rejected. Doppler is a personal integration choice and must not define the
product's credential boundary.

### Execute commands from a registry without validation

Rejected. A credential reference does not authorize arbitrary command
execution; recognized retrieval operations require strict validation and
structured execution without shell interpretation.

### Delegate success determination to the SDK or provider

Rejected. Backend completion and provider responses are evidence inputs, not
authority over the caller's invocation contract.

### Declare parity with llm-runtime without tests

Rejected. Historical relevance does not prove preserved behavior. A parity
claim requires conformance evidence and appropriate tests.
