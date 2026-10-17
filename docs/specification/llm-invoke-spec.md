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
[ADR-001](../adr/adr-001-make-product-intent-govern-invocation-semantics.md),
then extended by
[ADR-003](../adr/adr-003-agent-first-invocation-and-credential-authority.md).
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

`llm-invoke` prioritizes adoption by software-building agents. An agent
constructing or modifying a program that requires LLM calls should be able to
integrate a trustworthy invocation primitive without rebuilding provider
authentication, execution-integrity checks, retry safety, termination
interpretation, or outcome classification.

This agent-first adoption objective concerns the software construction
experience. It does not make `llm-invoke` an agent, a coding harness, or a
workflow orchestrator. The same invocation semantics remain available to
non-agent callers.

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
requested reasoning effort
requested thinking mode / thinking budget
evidence of reasoning-configuration acceptance
credential/account identity when explicitly contractually required
fallback permissions
termination semantics
output structure
output completeness / truncation policy
deadline
retry permissions
duplicate-execution tolerance
execution-certainty requirements
response-integrity requirements
metadata / provenance requirements
```

This list identifies semantic concerns, not a mandatory closed field set or an
implementation structure.

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
next action.

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
component.

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

Retry is governed by the same principle. If a prior execution has become
indeterminate and the contract forbids duplicate-execution risk, an automatic
retry may violate the contract.

Therefore:

```text
availability
!= authority to weaken invocation meaning
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
- lets a backend, provider, router, gateway, or reliability mechanism redefine
  the caller's contract;
- collapses materially relevant execution uncertainty into a known failure;
- requires the caller to interpret raw provider responses or provider-specific
  errors to determine whether the contract was satisfied;
- requires the caller to discover an undeclared fallback after receiving
  success;
- silently modifies a requested provider, model, or reasoning setting;
- presents a merely submitted reasoning setting as proof of unobservable
  internal cognitive activity;
- arbitrarily chooses among ambiguous credential profiles;
- exposes secrets in errors, traces, or results;
- makes a particular secret vault mandatory for the universal product;
- requires callers to reconstruct the guarantees needed for invocation
  integrity themselves;
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
  - exact execution provider P;
  - exact requested model X;
  - requested reasoning configuration R;
  - capability Y to actually be supported;
  - a known acceptable termination;
  - complete output matching schema Z;
  - no retry if prior execution becomes indeterminate.

Execution occurs through an arbitrary compatible backend.

During execution:
  - the provider may reject the request;
  - the network may fail;
  - the backend may propose or follow a fallback;
  - the provider may return unknown termination;
  - output may be truncated;
  - execution may become ambiguous after transmission.

The workflow must never receive ordinary success unless llm-invoke can
establish the conditions required by the contract. Reasoning configuration R
must be established at the observability level declared by the contract;
internal model reasoning is not presumed to be directly observable.

Otherwise it receives the relevant explicit non-success outcome.
```

A design is not conformant if it requires the caller to inspect raw provider
responses, understand provider-specific errors, trust an undeclared fallback,
or treat absence of evidence as success.

### 0.11 Agent-first invocation adoption

`llm-invoke` prioritizes an invocation interface that software-building agents
can adopt easily. The common case must not require a caller to design a detailed
`InvocationContract` object. Conditions explicitly supplied through the
invocation interface participate directly in the applicable contract, while
advanced requirements remain separately expressible. The caller retains
authority over its acceptance conditions.

The minimum conceptual surface for the standard case is:

```text
provider
model
reasoning, when requested
prompt or messages
```

`provider`, `model`, and the input are the conceptual fields of the standard
case. `reasoning` may be omitted when no specific reasoning control is required.
Its omission must never be represented as verification of a particular effort
level. The interface must also be able to expose an optional credential profile
when more than one authentication identity exists.

The product must return an explicit, mechanically interpretable outcome.
Implicit behavior must not weaken declared guarantees or the caller's
acceptability conditions.

These fields are an accepted product-interface direction. They do not yet
define types, signatures, serialized schemas, a package, or an implementation.
The following example is illustrative and not implemented:

```typescript
const result = await invoke({
  provider: "openai",
  model: "gpt-5",
  reasoning: { effort: "high" },
  prompt: "Analyse ce problème...",
});
```

The example does not assert actual support for the provider, model, or effort
level by any backend version.

### 0.12 Provider, model and reasoning authority

#### Provider

An explicitly specified execution service is a contractual condition. The
requested provider, the model publisher, and the technical backend are distinct
identities. For example, using an Anthropic model through AWS Bedrock must not
be represented as a direct invocation of the Anthropic service.

#### Model

A requested model must not be silently replaced. The requested identifier, the
model actually resolved, and the available evidence of effective model identity
must remain distinguishable. Substitution, or resolution that is not
sufficiently established, cannot produce `VerifiedSuccess` when the contract
requires exact identity. Aliases and non-immutable identifiers must not be
implicitly treated as exact immutable identities.

#### Reasoning

Effort and thinking controls differ between providers and models. No universal
equivalence is presumed among `low`, `medium`, `high`, thinking enabled or
disabled, token budgets, or other controls. Translation is admissible only when
it preserves the explicitly requested semantics. A known incompatibility must
be reported rather than silently corrected. If evidence required to satisfy the
contract is absent, `VerifiedSuccess` is prohibited.

These states are distinct:

```text
requested configuration
configuration submitted
configuration accepted or established
internal reasoning actually performed
```

`llm-invoke` claims no universal ability to observe internal model reasoning.
The precise classification of situations with multiple simultaneous
non-success causes remains open as stated in Section 1.

### 0.13 Credential resolution and secret authority

`llm-invoke` must provide an integration boundary for credential resolution and
use. The caller must not have to implement secret retrieval systematically for
every invocation. Credentials may originate from different external mechanisms;
no particular secret provider is mandatory. Environment variables may be
supported but are not a mandatory dependency.

Permanent secret storage, secret creation, revocation, and rotation are outside
the product's intrinsic scope. A credential profile may be selected explicitly
or resolved through unambiguous configuration. When several profiles exist and
there is neither an explicit selection nor an authorized default rule, no
arbitrary selection is permitted. Missing, inaccessible, or ambiguous
credentials must not trigger a silent authentication-identity change.

Secret values must not appear in public outcomes, errors, logs, traces, or
persisted evidence. Retrieval must remain compatible with the security
constraints of the execution environment. A credential reference alone never
authorizes execution of an arbitrary command. An authorized execution mechanism
may use the secret, but the secret must not be returned to the caller as
invocation data.

The following responsibilities are distinct:

```text
Credential selection / authentication mechanism
```

and:

```text
Caller-owned invocation acceptance conditions
```

An account or profile identity becomes a contractual requirement only when the
caller declares it as such. This section prescribes no class, interface,
protocol, or configuration format.

### 0.14 Backend composition and guarantee preservation

`llm-invoke` remains backend-neutral. Vercel AI SDK is a preferred realization
candidate, but it is not yet definitively selected. Existing mechanisms should
be reused when they correctly satisfy the requirements, without making any
backend mechanism an authority over invocation success.

Guarantees historically provided by `llm-runtime` must be inventoried and
compared with `llm-invoke` requirements. Historically useful protections do not
become normative invariants merely through prior existence. No relevant
guarantee loss may be accepted silently to ease backend adoption. Any parity
claim requires conformance evidence and appropriate tests.

This update claims neither Vercel AI SDK conformance nor parity with
`llm-runtime` and does not duplicate the separate historical audit.

## 1. Current specification scope

This specification establishes Product Intent, including agent-first adoption,
the contractual authority of explicitly supplied invocation parameters,
user-visible success semantics, minimum outcome distinctions, the credential
resolution boundary, and other authority boundaries. It does not yet claim a
complete invariant set or select implementation mechanisms.

Future work may derive stable system invariants, constraints, and architecture
only when they are necessary consequences of Section 0 or are introduced by an
explicit accepted product decision.

The following remain intentionally open:

- exact public API syntax and types;
- serialized contract representation;
- implementation language;
- definitively selected backend;
- package architecture;
- actual adapters and provider support;
- evidence acquisition and normalization mechanisms;
- outcome representation and serialization;
- the treatment of simultaneously applicable non-success facts;
- retry, fallback, routing, caching, throttling, and circuit-breaker mechanisms;
- event handling, streaming, persistence, and recovery mechanisms;
- observability and telemetry mechanisms;
- network protocols;
- deployment models; and
- conformance tests and tooling.

None of these open elements is represented as implemented. Historical
`llm-runtime` mechanisms, if any, are not promoted to invariants by existence.
Any future adoption must be justified from this Product Intent.
