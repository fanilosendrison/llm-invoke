---
okf_version: "1.0"
adr_profile_version: "0.1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-decision-record"
domain: "llm-invoke"
severity: "strict"
name: "Make Product Intent govern invocation semantics and implementation"
id: "ADR-001"
status: "accepted"
date: "2026-09-21"
decision_body_sha256: "67434aa79fa447bbf7f12b5ff444672990899510fef015929b06b689a91dc692"
relation_completeness: "complete"
relations:
  clarifies: []
  amends: []
  supersedes: []
  confirms: []
governs:
  - "interpretation of future llm-invoke architecture and implementation decisions"
---

# ADR-001: Make Product Intent govern invocation semantics and implementation

- **Status:** Accepted
- **Date:** 2026-09-21
- **Governs:** interpretation of future `llm-invoke` architecture and
  implementation decisions

## Context

`llm-invoke` is vulnerable to mechanism-first definition because providers,
SDKs, gateways, routers, and reliability libraries expose different APIs and
success signals. Beginning with those mechanisms could produce a convenient
runtime that reports success according to transport or backend behavior rather
than according to the caller's invocation conditions.

The repository therefore needs an explicit authority rule before implementation
choices accumulate. The rule must establish Product Intent as the source from
which future invariants and constraints are derived without prematurely
selecting an API, language, backend, provider, package architecture,
persistence model, protocol, or deployment model.

## Decision

`llm-invoke` architecture is specified in this order:

```text
product intent
    ↓
user-visible truths
    ↓
system invariants
    ↓
constraints / authority boundaries
    ↓
implementation mechanisms
```

Section 0 of
[`docs/specification/llm-invoke-spec.md`](../specification/llm-invoke-spec.md)
is normative and is the primary expression of the current product contract.
Accepted ADRs record why important clauses exist and may authorize later
semantic changes, but they do not form a second independently maintained current
specification.

Concrete mechanisms are subordinate to Product Intent and its accepted
future derivations. An implementation choice must not silently weaken a
higher-level obligation because a backend, provider, SDK, gateway, harness, or
library makes another behavior easier.

If a mechanism cannot satisfy a particular invocation contract, that limitation
must be represented as a capability or conformance limitation and cannot be
converted into `VerifiedSuccess`.

A future decision may change Product Intent only when it:

1. explicitly amends this decision;
2. identifies the exact product promise or authority boundary being changed;
3. explains the caller-visible tradeoff; and
4. updates Section 0 of the specification in the same change.

Implementation behavior, tests, existing dependencies, and historical
`llm-runtime` mechanisms do not amend Product Intent.

## Rationale

The product is defined by trustworthy invocation-contract and outcome semantics,
not by the current success conventions of any execution mechanism. Preserving
this dependency direction allows different backends to realize the same product
meaning while making their evidence limitations explicit.

This decision also prevents retry, fallback, routing, and similar reliability
mechanisms from becoming implicit authorities that weaken the caller's requested
invocation meaning in exchange for availability.

## Consequences

- Future requirements and invariants must be traceable to Product Intent or to a
  later explicit product decision.
- The normative specification remains the current consolidated product
  contract; ADRs preserve decision provenance.
- Backend and provider limitations constrain conformance, not semantics.
- Public API, implementation language, backend selection, package structure,
  persistence, protocols, and deployment remain open.
- Turnlock may consume `llm-invoke`, but it does not define `llm-invoke`
  semantics.
- Existing mechanisms may be reused when they conform; their prior existence
  grants them no normative status.

## Alternatives considered

### Let backend success define invocation success

Rejected. Transport completion, SDK completion, fallback completion, or content
presence cannot establish caller-required conditions by themselves.

### Design a portable provider API first

Rejected as premature. An API designed before the semantic contract could freeze
provider limitations into product meaning.

### Keep the authority rule only as implementation guidance

Rejected. Guidance can be displaced by implementation convenience. The rule is
a product and architecture decision, and the consolidated specification must
remain its normative expression.

### Bootstrap the mature governance used by established repositories

Rejected as premature. A single normative specification, this decision record,
and a minimal authority map are sufficient now. Generated indexes, schema
vendoring, formal traceability, immutable evidence packages, and qualification
infrastructure may be considered only when actual repository needs justify
them.
