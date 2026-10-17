---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "specification"
domain: "llm-invoke"
severity: "strict"
name: "llm-invoke normative product specification"
---

# llm-invoke — Product specification

This specification intentionally begins with Product Intent and leaves concrete
mechanisms open. It does not define a public API, implementation language,
backend, provider, package architecture, persistence model, network protocol,
or deployment model.

## 0. Product Intent — governing invocation meaning

This section is normative. It is the primary expression of the current
`llm-invoke` product contract and is ratified by
[ADR-001](../adr/adr-001-make-product-intent-govern-invocation-semantics.md).
Lower-level requirements, architecture, tests, and implementation must be
derived in this order:

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

Implementation convenience cannot weaken this Product Intent. A future semantic
change requires an explicit ADR and a synchronized update to this section in the
same change. If an implementation, backend, provider, or historical mechanism
conflicts with this section, the Product Intent governs until explicitly
amended.

### 0.1 Product definition: contract-first programmatic LLM invocation

`llm-invoke` is a **contract-first runtime for programmatic LLM invocation**.

It exists for software, workflows, pipelines, and autonomous systems that need
to invoke an LLM and reason precisely about this question:

> **Did the invocation that just occurred actually satisfy the conditions under
> which the caller permits it to be considered successful?**

`llm-invoke` is not primarily:

- a multi-provider SDK;
- an AI gateway;
- a model router;
- an agent or coding harness;
- a prompt manager;
- an observability product;
- a retry library; or
- an evaluator of the truth or semantic quality of LLM output.

Those capabilities may exist beneath, beside, or above `llm-invoke`. They do not
define the product.

The defining property is:

> **An invocation may be reported as successful only when `llm-invoke` can
> establish, to the degree required by the caller's explicit contract, that the
> requested invocation conditions were satisfied. Otherwise it must return an
> explicit non-success outcome.**

### 0.2 Fundamental promise: do not misrepresent what occurred

A caller must be able to depend on an LLM invocation without being misled about
what actually occurred.

In particular:

```text
HTTP 200
!= automatically successful llm-invoke invocation

provider SDK returned normally
!= automatically successful llm-invoke invocation

gateway found a fallback
!= automatically successful llm-invoke invocation

some model produced content
!= automatically successful llm-invoke invocation
```

Success exists only after the applicable invocation contract has been
satisfied.

The central rule is:

> **`llm-invoke` must never report a successful invocation when a condition
> required by the caller's invocation contract is known to be violated or
> cannot be established to the degree the contract requires.**

This is fail-closed invocation semantics. It does not mean that LLM invocations
always succeed. It means that a degraded, ambiguous, substituted, or
insufficiently established execution cannot be silently transformed into
success.

Each logical invocation is additionally bound by a universal, non-waivable
**at-most-once actual LLM inference** constraint (§0.6.1).

### 0.3 Caller authority and the InvocationContract concept

The caller owns the authority to define the conditions under which an invocation
is acceptable. The future concept of an `InvocationContract` represents those
conditions without yet prescribing an API, schema, type, enum, or wire format.

When technically relevant to the requested invocation, contract dimensions may
include:

```text
model identity / permitted model set
provider identity / permitted provider set
required capabilities
required parameter semantics
fallback permissions
termination semantics
output structure
output completeness / truncation policy
deadline
retry permissions (within the at-most-once constraint)
logical invocation identity / replay continuity
execution-certainty requirements
response-integrity requirements
metadata / provenance requirements
```

This list identifies semantic concerns, not a mandatory closed field set or an
implementation structure. A caller cannot authorize a duplicate LLM inference
for the same logical invocation. That safety constraint is not optional.

The governing evidence rule is:

> **If a required contract dimension cannot be established on a particular
> execution backend, that backend cannot produce `VerifiedSuccess` for that
> contract.**

Absence of information is not permission to assume satisfaction. A backend may
be suitable for one contract and unable to verify another.

### 0.4 Fundamental outcome distinctions

The product semantics must preserve at least these conceptual distinctions:

```text
VerifiedSuccess
ContractViolation
ExecutionFailure
IndeterminateExecution
```

These names identify semantic outcome classes. They do not yet prescribe
language-level types, serialization, inheritance, exhaustiveness rules, or an
API representation. Future specification work must define any required
precedence or composition without collapsing the distinctions below.

#### 0.4.1 VerifiedSuccess

`VerifiedSuccess` means that sufficient evidence exists, at the observation
boundary of `llm-invoke`, to establish that the conditions required by the
applicable invocation contract were satisfied to the degree that contract
requires.

`Verified` applies only to the invocation contract. It does not mean:

```text
the model response is true
the reasoning is correct
the decision is good
the generated code is correct
```

Ordinary invocation success is reserved for `VerifiedSuccess`.
The universal at-most-once property must also be sufficiently established;
an SDK return is not itself proof of that property.

#### 0.4.2 ContractViolation

`ContractViolation` means that execution evidence is sufficient to establish
that at least one mandatory contract condition was not satisfied.

Examples may include:

```text
unexpected model identity
forbidden fallback
required capability unsupported
required parameter semantics not satisfied
unknown or forbidden termination
detected truncation
required output structure invalid
provider protocol incompatible with the contract
known duplicate actual LLM inference for the same logical invocation
```

The examples are illustrative rather than a closed taxonomy.

#### 0.4.3 ExecutionFailure

`ExecutionFailure` means that the invocation could not be completed because of
an operational failure whose nature is sufficiently known.

A known operational failure is not success merely because a backend handled it,
retried it, or returned a normal SDK-level value.

#### 0.4.4 IndeterminateExecution

`IndeterminateExecution` means that information materially required by the
contract cannot be established.

A critical example is:

```text
request sent
provider may have executed it
connection or response lost

=> whether execution actually occurred is unknown
```

This uncertainty must not be arbitrarily reduced to a simple timeout or a
certain execution failure when the distinction may change the caller's correct
next action. In particular, an unknown earlier execution must never be
replayed merely to obtain a response.

### 0.5 Backend neutrality and evidence authority

`llm-invoke` remains backend-neutral. Potential execution mechanisms include:

```text
Vercel AI SDK
LiteLLM
Bifrost
Portkey
provider-native SDKs
direct provider APIs
future execution backends
```

They may provide provider access, protocol translation, retry, routing,
fallback, rate limiting, telemetry, guardrails, or structured-output support.
They are not the authority that decides whether an `InvocationContract` is
satisfied.

The semantic direction is:

```text
caller / workflow
      ↓
InvocationContract
      ↓
llm-invoke
      ↓
execution backend
      ↓
provider / model
```

On return:

```text
provider / backend evidence
      ↓
llm-invoke evaluates the applicable contract
      ↓
VerifiedSuccess
or an explicit non-success outcome
```

When an existing maintained component provides a required capability correctly,
`llm-invoke` should compose it rather than reimplementing it without reason.
Composition does not transfer authority over invocation success to that
component. A backend whose path may duplicate actual inference without a
sufficiently established prevention mechanism is not admissible. If this
cannot be established before dispatch, an optimistic attempt followed by
failure is not a substitute for preventing duplication.

### 0.6 Reliability mechanisms are subordinate

Retry, fallback, throttling, routing, circuit breakers, caching, and similar
capabilities are mechanisms, not Product Intent. They are admissible only when
they preserve the applicable contract.

For example:

```text
contract requires exact model A

A is unavailable
backend silently calls B
B produces a valid-looking answer

=> not VerifiedSuccess
```

The result could be `VerifiedSuccess` only if the contract explicitly permitted
B or an equivalence class that contains B and every other required condition was
established.

Retry is governed by the same principle. Caller permissions never authorize
another actual inference for the same logical invocation.

### 0.6.1 Universal at-most-once actual LLM execution

An individual **logical invocation** is one caller-intended inference
operation. For that invocation, zero or one actual LLM inference executions
may occur, **never two or more**. This property is mandatory for the product
and cannot be waived through an `InvocationContract`, availability policy,
retry policy, or backend configuration.

Invocation identity survives network disconnects, timeouts, retry attempts,
process restarts, orchestration re-entry, gateway routing, and recovery. A
technical replay is not a new logical invocation merely because a new HTTP
request, correlation identifier, process, or connection is created. Genuinely
separate caller-intended operations may use identical prompts and are distinct.

A subsequent transport attempt is admissible only if there is sufficient
evidence that earlier attempts caused **no actual LLM inference**, or if an
established inference-boundary deduplication/idempotency mechanism guarantees
that a new transport request cannot cause a second actual inference. Merely
observing an error, timeout, connection reset, HTTP status, abort, or missing
response does not establish that the earlier inference did not happen.

If an earlier execution is possible and no adequate non-duplication mechanism
is available, no further inference attempt is admissible. Where the execution
state cannot be established, the outcome must preserve
`IndeterminateExecution`, rather than trying the invocation again.

The rule spans SDKs, gateways, proxies, provider-side behavior, retries,
failover and recovery. An execution path that may replay inference invisibly
and cannot sufficiently exclude duplication must not be admitted as a
conformant backend. Disabling a client retry switch is not sufficient evidence
that the full execution path is safe.

**At-most-once is not exactly-once.** This product does not promise that an
invocation will execute, that a lost response can be recovered, or that an
abort reverses provider-side execution. It must not claim control of opaque
provider behavior that it cannot establish. No particular identity, storage,
idempotency, transport or deployment mechanism is chosen by this requirement.

Therefore:

```text
availability
!= authority to weaken invocation meaning

unknown previous execution
!= authority to execute inference again
```

### 0.7 Boundary with Turnlock

`llm-invoke` is intended to be usable as a primitive for bounded raw LLM
inference regions in Turnlock. This is an important use case, not the definition
of the product and not a reverse semantic dependency.

The responsibility boundary is:

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

Turnlock should be able to consume an explicit outcome without knowing
provider-specific details. `llm-invoke` must remain useful and coherent without
Turnlock.

### 0.8 Out of scope: semantic truth and quality

`llm-invoke` separates:

```text
faithful execution of the requested LLM invocation
```

from:

```text
semantic correctness of model output
```

It does not guarantee that a response is:

```text
true
correct
useful
safe
optimal
```

Higher-level systems may add tests, evaluations, judges, formal validation, or
business validation. The `llm-invoke` boundary is **execution integrity**, not
semantic truth.

### 0.9 Product-intent conformance rule

A proposed architecture or implementation is not product-conformant if it:

- reports ordinary success without establishing every contract condition to the
  required degree;
- treats transport success, SDK completion, content presence, or fallback
  completion as sufficient proof of invocation success;
- treats missing evidence as permission to assume compliance;
- admits a second actual LLM inference for the same logical invocation or
  permits a caller to waive this prohibition;
- retries a possibly executed inference without sufficient proof of previous
  non-execution or established inference-boundary deduplication;
- treats disabling SDK retries as sufficient proof that an opaque gateway or
  provider cannot perform hidden replay;
- lets a backend, provider, router, gateway, or reliability mechanism redefine
  the caller's contract;
- collapses materially relevant execution uncertainty into a known failure;
- requires the caller to interpret raw provider responses or provider-specific
  errors to determine whether the contract was satisfied;
- requires the caller to discover an undeclared fallback after receiving
  success;
- conflates verified invocation execution with semantic truth or quality; or
- makes Turnlock or any other consumer the semantic authority for
  `llm-invoke`.

Different backends may expose different evidence and capabilities. Those
limitations may restrict which contracts they can satisfy; they do not weaken
the meaning of `VerifiedSuccess`.

### 0.10 Reference product-conformance scenario

```text
A workflow needs one bounded LLM inference.

It requires:
  - exact model X;
  - capability Y to actually be supported;
  - a known acceptable termination;
  - complete output matching schema Z;
  - at-most-once actual inference across retry and recovery, without waiver.

Execution occurs through an arbitrary compatible backend.

During execution:
  - the provider may reject the request;
  - the network may fail;
  - the backend may propose or follow a fallback;
  - the provider may return unknown termination;
  - output may be truncated;
  - execution may become ambiguous after transmission.

The workflow must never receive ordinary success unless llm-invoke can
establish the conditions required by the contract and the universal
at-most-once execution constraint. Ambiguous transmission does not authorize
another inference.

Otherwise it receives the relevant explicit non-success outcome.
```

A design is not conformant if it requires the caller to inspect raw provider
responses, understand provider-specific errors, trust an undeclared fallback,
or treat absence of evidence as success.

## 1. Current specification scope

This initial specification establishes Product Intent, user-visible success
semantics, minimum outcome distinctions, and authority boundaries. It does not
yet claim a complete invariant set or select implementation mechanisms.

Future work may derive stable system invariants, constraints, and architecture
only when they are necessary consequences of Section 0 or are introduced by an
explicit accepted product decision.

The following remain intentionally open:

- public API shape and contract representation;
- implementation language and package boundaries;
- mandatory or optional backend adapters;
- provider support;
- evidence acquisition and normalization mechanisms;
- outcome representation and serialization;
- the treatment of simultaneously applicable non-success facts;
- retry, fallback, routing, caching, throttling, and circuit-breaker mechanisms
  compatible with at-most-once actual inference;
- persistence, logical-invocation continuity, and recovery mechanisms;
- observability and telemetry mechanisms;
- network protocols;
- deployment models; and
- conformance and verification tooling.

Historical `llm-runtime` mechanisms, if any, are not promoted to invariants by
existence. Any future adoption must be justified from this Product Intent.
