---
okf_version: "1.0"
adr_profile_version: "0.1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-decision-record"
domain: "llm-invoke"
severity: "strict"
name: "Support authorized OpenAI ChatGPT-plan OAuth for direct LLM inference"
id: "ADR-005"
status: "accepted"
date: "2026-11-05"
decision_body_sha256: "fab27315bd5d1fa833928d9c53ed07653b262a880de3fab962093392bcb63544"
relation_completeness: "complete"
relations:
  clarifies: []
  amends: ["ADR-001", "ADR-004"]
  supersedes: []
  confirms: ["ADR-002", "ADR-003"]
governs:
  - "eligible ChatGPT-plan OAuth as a supported OpenAI direct-inference access mode"
  - "authentication-mode authority and non-silent billing-path substitution"
---

# ADR-005: Support authorized OpenAI ChatGPT-plan OAuth for direct LLM inference

- **Status:** Accepted
- **Date:** 2026-11-05
- **Amends:** ADR-001 and ADR-004
- **Confirms:** ADR-002 and ADR-003
- **Fingerprint convention:** SHA-256 of the UTF-8 content from
  `## Context` (inclusive) through EOF, including the final LF.

## Context

The existing Product Intent provides an independent credential-resolution
boundary but does not yet require support for direct OpenAI inference through
eligible ChatGPT/Codex subscription access. OpenAI API-key access represents a
distinct authorization and billing mode.

OpenAI officially documents Sign in with ChatGPT, allowing eligible clients and
users to make direct Responses API requests using appropriately authorized OAuth
tokens. Identity authentication alone, including an existing Codex CLI login,
credential file, or authenticated session, is not evidence of permission to
perform direct plan-funded inference.

An agent or workflow that needs only bounded LLM inference should not have to
start Codex to perform that call. Eligibility limits and official OpenAI rules
for this access mode must remain respected. Current provider integration details
are external constraints, not universal product invariants.

## Decision

This decision amends ADR-001 and ADR-004 by adding a supported OpenAI access
capability and making authentication-mode authority and non-silent billing-path
substitution explicit. It does not replace the Product Intent authority
hierarchy or make credentials an authority over invocation success. It confirms
ADR-002 and ADR-003 without changing the Turnlock boundary or universal
at-most-once actual LLM inference.

The recorded product decision is:

1. ChatGPT-plan OAuth is an OpenAI access mode that `llm-invoke` must support,
   subject to eligibility and official authorization.
2. This mode is distinct from OpenAI API-key authentication. An eligible caller
   must be able to use authorized subscription access without supplying a
   separately billed OpenAI API key for that invocation path.
3. The mode must permit direct LLM inference without mandatory execution of a
   Codex agent, Codex app-server, coding harness, autonomous tool loop, or
   workflow orchestrator.
4. Explicit account, credential-profile, and authentication-mode selections must
   not be silently replaced. Without an explicit mode selection, only an
   authorized, unambiguous resolution policy may choose one.
5. Automatic fallback between subscription quota and separately billed API
   access is not authorized. Failure of eligibility, consent, permissions,
   credential availability, token renewal, model access, quota, or route
   admission must not silently change the account, workspace, profile,
   authentication mode, or billing path. A genuinely separate caller-initiated
   operation under another explicitly authorized route cannot disguise replay
   of a possibly executed logical invocation.
6. Support does not presume universal model access, universal subscription
   eligibility or availability, or unlimited quota. Account, workspace,
   application, environment, model, request, and provider-policy constraints
   remain to be established for the selected route.
7. Personal self-hosted environments, including VPSs and VMs, are integration
   contexts to support when official conditions permit, without promising
   eligibility for every deployment.
8. Contract-first, fail-closed, and universal at-most-once guarantees remain
   unchanged. Authentication success or a completed transport response does not
   establish `VerifiedSuccess` without sufficient evidence of the applicable
   invocation contract. `ContractViolation`, `ExecutionFailure`, and
   `IndeterminateExecution` remain distinct; uncertain prior execution never
   authorizes a second actual inference for the same logical invocation.
9. The product remains independent of Codex, Turnlock, and any particular
   backend.
10. This ADR selects no OAuth client, SDK, internal protocol, storage mechanism,
    or deployment architecture.

Section 0 of the specification remains the sole consolidated normative product
contract. Integration of this decision requires a synchronized update to that
section in the same change. Credential selection remains separate from
invocation-contract evaluation; an account or profile identity becomes a
contractual requirement only when the caller explicitly requires it. No secret
source, including Doppler or environment variables, becomes mandatory universal
product infrastructure.

## Rationale

This decision improves adoption by software-building agents and conventional
programs while maintaining a strict separation between model access,
authentication, and invocation integrity. The caller-visible addition is an
authorized subscription access path without a separately billed API key;
availability remains subject to official eligibility and policy rather than
weakening any existing invocation guarantee. Bounded inference does not acquire
a mandatory agent or orchestrator dependency.

## Consequences

- The official OAuth mechanism must be qualified in future integration work.
- Permissions actually granted must be verified; identity authentication alone
  must not be treated as direct-inference authorization.
- Applications must respect the rules of the selected request route, including
  current parameter, capability, model-access, and deployment restrictions.
- Compatibility with the applicable invocation contract and universal
  at-most-once actual inference must be demonstrated, including interruption
  and recovery cases. Unsupported or insufficiently evidenced routes fail
  closed; token presence proves neither quota availability, billing treatment,
  nor execution integrity.
- Exact API and backend remain open implementation decisions. Token lifecycle,
  renewal coordination, multiple accounts and workspaces, host identities,
  credential storage, and secure transfer mechanisms remain open as well.
- No new persistence or retry mechanism is imposed by this decision.
- This ADR performs no implementation, OAuth qualification, backend
  qualification, runtime test, or demonstration of execution conformance.

## Alternatives considered

- **Require OpenAI API keys exclusively:** Rejected because this would exclude
  the required officially authorized subscription access mode.
- **Treat existing Codex CLI credentials as automatically reusable authority:**
  Rejected because an existing login or token does not establish the permissions
  and eligibility required for the direct inference route.
- **Launch a Codex agent for every LLM invocation:** Rejected because a bounded
  inference capability must not require agent execution.
- **Silently fall back to a separately billed API key when OAuth quota is
  unavailable:** Rejected because this would change the authorized billing path
  and could disguise replay of a possibly executed invocation.
- **Declare an eligibility- and policy-dependent feature universally usable:**
  Rejected because subscription ownership alone does not establish model
  entitlement, request eligibility, unlimited usage, or execution-path
  conformance.

## References

- [Normative product specification](../specification/llm-invoke-spec.md)
- [ADR-001](adr-001-make-product-intent-govern-invocation-semantics.md)
- [ADR-002](adr-002-establish-turnlock-compatibility-boundary.md)
- [ADR-003](adr-003-at-most-once-llm-inference.md)
- [ADR-004](adr-004-agent-first-invocation-and-credential-authority.md)
- [Credential resolution projection](../architecture/credential-resolution.md)
- [OpenAI Sign in with ChatGPT overview](https://developers.openai.com/siwc/token-sharing-open-source)
- [OpenAI registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)
- [OpenAI models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)
- [OpenAI preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations)
- [OpenAI self-hosted VMs](https://developers.openai.com/siwc/token-sharing-open-source/self-hosted-vms)
- [OpenAI errors and recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery)
