---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-compatibility-projection"
domain: "llm-invoke"
severity: "strict"
name: "Turnlock compatibility projection"
---

# Turnlock compatibility projection

> **Status: derived architecture/compatibility projection.**
>
> This document maps applicable Turnlock invariants to derived compatibility
> obligations for `llm-invoke` integration. It does not modify either
> product. Normative `llm-invoke` product meaning remains in the
> [llm-invoke specification](../specification/llm-invoke-spec.md); Turnlock
> semantics and invariants remain owned by the Turnlock specification
> (`turnlock-rust/docs/specification/turnlock-spec.md`).

## Status and authority

This document is a derived architecture/compatibility projection between
two independent authorities:

- the `llm-invoke` Product Intent, normative in the
  [llm-invoke specification](../specification/llm-invoke-spec.md), remains
  the product authority for `llm-invoke`;
- the Turnlock specification
  (`turnlock-rust/docs/specification/turnlock-spec.md`), including its
  stable `TL-INV-*` invariants, remains the authority on Turnlock.

The projection is not a source of `llm-invoke` Product Intent, not a copy of
the Turnlock specification, and not an independent authority capable of
modifying either product. It records derived compatibility constraints and
traceability only.

[ADR-001](../adr/adr-001-make-product-intent-govern-invocation-semantics.md)
makes Product Intent govern invocation semantics and implementation.
[ADR-002](../adr/adr-002-establish-turnlock-compatibility-boundary.md)
establishes this projection and the boundary it records.

A future modification of Turnlock requires re-evaluating this projection. A
new Turnlock requirement does not automatically become an intrinsic
`llm-invoke` invariant. A future divergence requiring a change to
`llm-invoke`'s Product Intent requires a separate explicit product decision.

## Responsibility direction

```text
Turnlock
  owns workflow / orchestration semantics
        ↓
  requests bounded LLM invocation

llm-invoke
  owns invocation-contract and outcome semantics
        ↓
  execution backend / provider
```

The compatibility relationship creates no reverse semantic dependency.
`llm-invoke` remains a generic, coherent product independently of Turnlock,
and Turnlock is not required to express the `llm-invoke` invocation
contract.

## How to read the projection

`TL-COMP-001` through `TL-COMP-008` are projection-local compatibility
obligations. They are not `llm-invoke` product invariants and do not modify
Section 0 of the specification.

For each obligation this document states:

```text
Turnlock source invariant(s)
      ↓
derived compatibility obligation
      ↓
existing llm-invoke semantic support
      ↓
remaining architecture / implementation implication
```

Coverage in the matrix is `explicit` when the current Product Intent
already states the requirement, or `partial` when only part of the
requirement is currently stated and the remainder constrains future
architecture. Where coverage is explicit, no new `llm-invoke` invariant is
created.

## Traceability matrix

| Obligation | Turnlock sources | Product Intent coverage |
| --- | --- | --- |
| TL-COMP-001 | TL-INV-012, TL-INV-028, TL-INV-029 | partial |
| TL-COMP-002 | TL-INV-030 | explicit |
| TL-COMP-003 | TL-INV-028, TL-INV-033 | explicit |
| TL-COMP-004 | TL-INV-033, TL-INV-036 | explicit |
| TL-COMP-005 | TL-INV-028, TL-INV-033 | explicit |
| TL-COMP-006 | TL-INV-024, TL-INV-027, TL-INV-028 | partial |
| TL-COMP-007 | TL-INV-034 | explicit |
| TL-COMP-008 | TL-INV-038 | partial |

### TL-COMP-001 — Preserve bounded non-agentic invocation semantics

**Turnlock sources.** `TL-INV-012` (non-equivalence of cognitive execution
forms), `TL-INV-028` (raw LLM inference), `TL-INV-029` (minimum-sufficient
cognition).

**Derived compatibility obligation.** To serve as the realization of a
Turnlock raw LLM region, `llm-invoke` must be able to realize an invocation
as a bounded non-agentic semantic operation:

```text
explicit instruction + explicit context
                ↓
      one semantic invocation
                ↓
         result / outcome
```

Such an operation must not introduce an autonomous observe/reason/act loop,
a persistent cognitive lineage, a hidden autonomous agent, or global
orchestration authority.

`one semantic invocation` does not mean exactly one HTTP request, exactly
one provider attempt, that streaming is prohibited, or that
contract-compatible internal retries are prohibited. The distinction must
be preserved.

**Existing `llm-invoke` semantic support.** The Product Intent defines
bounded programmatic invocation with caller-owned contracts (§0.1, §0.3),
makes reliability mechanisms subordinate to the contract (§0.6), and
excludes agent or harness orchestration from the product's identity (§0.1,
§0.7). The semantic-operation-versus-physical-attempt distinction is
implicit in §0.6 but is not yet stated as a standalone product clause.

**Remaining architecture/implementation implication.** Future runtime design
must preserve the bounded non-agentic semantic unit of an invocation and
must not introduce an internal autonomous loop or orchestration authority.

### TL-COMP-002 — Preserve Turnlock orchestration authority

**Turnlock source.** `TL-INV-030` (workflow-owned control over probabilistic
or externally dependent results).

**Derived compatibility obligation.** A probabilistic, nondeterministic, or
externally dependent invocation result never grants `llm-invoke`, the model,
or the provider authority to create or modify the global progression of a
Turnlock workflow. `llm-invoke` produces a result/outcome; Turnlock decides
how that result participates in the continuations already authorized by the
workflow. No `llm-invoke` mechanism may implicitly become a Turnlock
orchestration engine.

**Existing `llm-invoke` semantic support.** §0.7 assigns workflow and
orchestration semantics to Turnlock and invocation-contract/outcome
semantics to `llm-invoke`; §0.1 excludes router, agent, and harness roles;
§0.9 forbids making any consumer the semantic authority for `llm-invoke`.

**Remaining architecture/implementation implication.** Integration design
must keep continuation decisions in Turnlock; `llm-invoke` outcomes must not
be converted into workflow actions.

### TL-COMP-003 — Preserve explicit result and uncertainty semantics

**Turnlock sources.** `TL-INV-028` (raw LLM inference), `TL-INV-033`
(execution inspectability).

**Derived compatibility obligation.** Turnlock requires a real result
frontier for a raw LLM region and forbids transforming unknown information
into known fact. The existing outcome distinctions are directly compatible
with that requirement:

```text
VerifiedSuccess
ContractViolation
ExecutionFailure
IndeterminateExecution
```

In particular:

```text
request sent
provider may have executed it
response lost
```

must not become `ExecutionFailure` when actual execution is unknown.
`IndeterminateExecution` must remain a real semantic distinction. Short of
evidence, interruption, expiry, cancellation, or transport error must not
produce a stronger claim about actual provider state than the available
evidence supports.

**Existing `llm-invoke` semantic support.** §0.4.4 defines
`IndeterminateExecution`; §0.2 establishes fail-closed semantics; §0.9
classifies collapsing materially relevant uncertainty into a known failure
as non-conformant.

**Remaining architecture/implementation implication.** The outcome
representation and serialization left open in §1 must preserve this
distinction.

### TL-COMP-004 — Preserve caller-selected execution conditions and provenance

**Turnlock sources.** `TL-INV-033` (execution inspectability), `TL-INV-036`
(effective execution-condition provenance).

**Derived compatibility obligation.** When an execution condition is chosen,
bound, supplied, or resolved by Turnlock and passed to `llm-invoke`,
`llm-invoke` must not silently replace it or change its meaning. Applicable
conditions may concern, when the contract requires them:

```text
model
provider
capabilities
parameters
fallback permissions
termination semantics
deadline
retry permissions
duplicate-execution tolerance
execution-certainty requirements
response-integrity requirements
metadata/provenance requirements
```

The `InvocationContract` concept is the appropriate vehicle for this
boundary. A Turnlock-selected condition is not a backend suggestion, not a
provider default, and not a reliability-mechanism preference. If a backend
cannot establish that a mandatory condition was satisfied, it cannot
convert that into `VerifiedSuccess`.

This obligation does not mean that `llm-invoke` must copy or store
Turnlock's internal provenance structures.

**Existing `llm-invoke` semantic support.** §0.3 establishes caller
authority over the contract, the applicable condition dimensions, and the
evidence rule that a backend unable to establish a required dimension
cannot produce `VerifiedSuccess`; §0.2 and §0.6 keep the contract above
backend behavior.

**Remaining architecture/implementation implication.** Contract
representation and backend-evidence modeling must preserve caller-selected
conditions without silent substitution, while importing no
Turnlock-internal provenance structures.

### TL-COMP-005 — Internal reliability mechanisms must not erase semantic truth

**Turnlock sources.** `TL-INV-028` (raw LLM inference), `TL-INV-033`
(execution inspectability).

**Derived compatibility obligation.** Turnlock defines a raw LLM call as a
semantic operation, not as exactly one physical attempt. `llm-invoke` may
therefore use retry, fallback, streaming, routing, throttling, caching, and
multiple physical exchanges with provider infrastructure if and only if
those mechanisms remain compatible with the `InvocationContract`. Turnlock
does not need to know each internal provider attempt.

An internal mechanism must not hide a fact that changes the semantic result
of the invocation:

```text
attempt 1 may have executed
response lost
contract forbids duplicate-execution risk

=> an automatic retry is not automatically admissible
```

The abstraction may hide physical details. It may not hide semantically
relevant uncertainty or violation.

**Existing `llm-invoke` semantic support.** §0.6 states that reliability
mechanisms are admissible only when they preserve the contract and that
`availability != authority to weaken invocation meaning`; §0.4.4 and §0.2
preserve uncertainty and fail-closed behavior.

**Remaining architecture/implementation implication.** Future reliability
mechanisms must be validated against contract compatibility before
adoption and must not mask semantic uncertainty or violation.

### TL-COMP-006 — Independent concurrent invocation without interference

**Turnlock sources.** `TL-INV-024` (heterogeneous parallel composition),
`TL-INV-027` (parallel semantic fan-out/fan-in), `TL-INV-028` (raw LLM
inference).

**Derived compatibility obligation.** Turnlock must be able to run several
independent raw LLM invocations in parallel. `llm-invoke` must therefore be
usable such that multiple independent invocations may be in flight
simultaneously without:

```text
contract mixing
result mixing
provenance mixing
global mutable state that silently changes another invocation's semantics
an artificial total order between independent invocations
```

Each result must remain attributable to the invocation that produced it.
This is not an obligation to implement fan-out/fan-in or to become a
scheduler; Turnlock remains the owner of workflow concurrency.

**Existing `llm-invoke` semantic support.** The Product Intent defines
contract and outcome semantics per invocation and grants `llm-invoke` no
scheduling or global-orchestration authority (§0.1, §0.7). Concurrent use
is not currently an explicit Product Intent clause.

**Remaining architecture/implementation implication.** Architecture must
preserve per-invocation isolation, contract association, and outcome
attribution; no global mutable state may let one invocation change another
invocation's semantics. Fan-out/fan-in scheduling remains outside
`llm-invoke`.

### TL-COMP-007 — Evaluation and semantic quality outside invocation success

**Turnlock source.** `TL-INV-034` (evaluation/optimization-policy boundary).

**Derived compatibility obligation.** Preserve the existing Product Intent
distinction between verified invocation execution and semantic truth or
quality. `VerifiedSuccess` does not mean true, correct, useful, safe, or
optimal. Turnlock or higher layers may perform evaluations, judges, tests,
or validations; `llm-invoke` must not integrate those judgments into the
universal definition of invocation success.

**Existing `llm-invoke` semantic support.** §0.4.1 limits `Verified` to the
invocation contract; §0.8 places semantic truth and quality out of scope;
§0.9 classifies conflating verified execution with semantic truth as
non-conformant.

**Remaining architecture/implementation implication.** None at Product
Intent level; any future evaluation feature must remain outside
invocation-success semantics.

### TL-COMP-008 — Remain a runtime-composable, consumer-independent realization

**Turnlock source.** `TL-INV-038` (runtime-realization composability).

**Derived compatibility obligation.** Turnlock must be able to compose, at
runtime, execution realizations that its own semantics do not fix. For
`llm-invoke` this implies a generic integration boundary: Turnlock concepts
and `llm-invoke` contract semantics remain separate. `llm-invoke` must not
require concepts such as:

```text
TurnlockRun
TurnlockWorkflow
TurnlockRegion
/go
main-agent region
Turnlock scheduler state
```

to express its own invocation contract. Providing the concrete runtime
composition point is primarily the responsibility of Turnlock's
architecture. This compatibility must not become a mandatory compile-time
or runtime dependency of `llm-invoke` on Turnlock.

**Existing `llm-invoke` semantic support.** §0.7 requires `llm-invoke` to
remain useful and coherent without Turnlock and lets Turnlock consume an
explicit outcome; §0.1 defines a generic invocation product rather than a
harness-specific one.

**Remaining architecture/implementation implication.** Any integration
realization belongs to Turnlock or to a composition layer and must not
enter the `llm-invoke` product model or contract expression.

## Non-obligations derived from this projection

Turnlock compatibility does not mean any of the following, and this
projection must not be read as introducing them:

- crash recovery;
- durable persistence;
- exactly-once provider execution;
- replay;
- cross-run reproducibility;
- stable persistent invocation IDs;
- machine-loss recovery;
- permanent execution history;
- identical retry outputs;
- deterministic model output;
- universal timeout;
- universal cancellation;
- universal retry;
- universal provider-attempt tracing;
- fan-out/fan-in scheduling;
- workflow orchestration;
- semantic-output evaluation.

Turnlock explicitly treats a one-shot raw LLM call as a semantic operation
that is not necessarily a single provider call, and its
execution-inspectability invariant introduces no universal crash-durable
post-mortem, replay, or permanent-retention guarantee. Adding any capability
from this list would exceed both authorities; it would require an explicit
decision, never an inference from this projection.
