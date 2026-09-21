---
okf_version: "1.0"
adr_profile_version: "0.1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-decision-record"
domain: "llm-invoke"
severity: "strict"
name: "Establish the Turnlock compatibility boundary"
id: "ADR-002"
status: "accepted"
date: "2026-09-21"
decision_body_sha256: "e136fb4e3baf6ed0b2040e6faf8cae4e0a4c917ed2df0c05e939d3864854f15b"
relation_completeness: "complete"
relations:
  clarifies: []
  amends: []
  supersedes: []
  confirms:
    - "ADR-001"
governs:
  - "interpretation of the llm-invoke and Turnlock compatibility boundary"
---

# ADR-002: Establish the Turnlock compatibility boundary

- **Status:** Accepted
- **Date:** 2026-09-21
- **Governs:** interpretation of `llm-invoke` integration decisions at the
  Turnlock compatibility boundary
- **Confirms:** ADR-001

## Context

`llm-invoke` is intended to be usable as the realization of a Turnlock
bounded raw LLM inference region without violating the applicable Turnlock
invariants. That compatibility was derived from product meanings that
already exist; it is not a new product intention.

Without an explicit boundary, integration work could drift in either
direction:

- Turnlock's needs could be mistaken for `llm-invoke` product meaning;
- Turnlock internal concepts could enter the `llm-invoke` product model;
- `llm-invoke` could acquire a reverse semantic dependency on Turnlock; or
- a naive integration could silently weaken the caller-owned invocation
  contract.

At the same time, `llm-invoke` has no runtime design yet, and this decision
must not select one.

## Decision

`llm-invoke` maintains an explicit projection of compatibility with the
Turnlock invariants applicable to bounded raw LLM inference. This projection
constrains integration without making Turnlock a product authority of
`llm-invoke`, without importing its internal concepts, and without creating
a reverse semantic dependency.

The projection is recorded in
[Turnlock compatibility projection](../architecture/turnlock-compatibility.md)
under the stable projection identifiers `TL-COMP-001` through `TL-COMP-008`.

This decision also establishes that:

1. the Product Intent of `llm-invoke` remains the product authority for
   `llm-invoke`;
2. the Turnlock invariants remain the authority on Turnlock;
3. `docs/architecture/turnlock-compatibility.md` is a derived projection
   between those two authorities;
4. a future modification of Turnlock requires re-evaluating this projection;
5. a new Turnlock requirement does not automatically become an intrinsic
   `llm-invoke` invariant; and
6. a future divergence requiring a change to `llm-invoke`'s Product Intent
   requires a separate explicit product decision.

This decision does not modify the Product Intent of `llm-invoke`, does not
select an integration mechanism, and creates no compile-time or runtime
dependency on Turnlock.

## Rationale

A generic product can serve as the realization of another system's bounded
invocation region while remaining defined independently. Keeping the
boundary explicit preserves both authorities: Turnlock keeps ownership of
workflow and orchestration semantics, and `llm-invoke` keeps a contract and
outcome model that depends on no particular consumer.

Recording the compatibility as a derived projection, rather than as new
product semantics, prevents two failure modes: silently turning consumer
needs into product meaning, and silently weakening the caller-owned contract
under integration pressure.

## Consequences

- Applicable Turnlock invariants map to explicit compatibility obligations
  with traceability to existing semantic support and remaining
  implementation implications.
- `llm-invoke` non-obligations such as durability, replay, exactly-once
  execution, orchestration, and semantic evaluation are stated explicitly
  so they cannot be inferred from compatibility.
- Turnlock changes do not propagate automatically; the projection must be
  re-evaluated.
- The `llm-invoke` Product Intent, and Section 0 of its specification,
  remain unchanged.
- Concrete integration realization remains a Turnlock architecture
  responsibility, not an `llm-invoke` product commitment.

## Alternatives considered

### Fold Turnlock compatibility into the Product Intent

Rejected. `llm-invoke` is a generic product; compatibility with one consumer
is derived from its meaning rather than part of its definition.

### Copy the applicable Turnlock invariants as `llm-invoke` invariants

Rejected. It would import the consumer's concepts into the product and
create a reverse semantic dependency.

### Leave compatibility implicit in prose and summaries

Rejected. The projection would be re-derived ad hoc, and integration
pressure could silently redefine it.

### Implement a Turnlock adapter now

Rejected as premature. The repository has no runtime design, and this
decision creates no API, adapter, or dependency commitment.
