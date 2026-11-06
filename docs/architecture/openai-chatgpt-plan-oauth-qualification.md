---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-integration-projection"
domain: "llm-invoke"
severity: "guideline"
name: "OpenAI ChatGPT-plan OAuth future qualification projection"
---

# OpenAI ChatGPT-plan OAuth future qualification projection

> **Status: Non-normative future qualification projection.**
>
> This document is not an accepted runtime architecture, a test result, or a
> source of product semantics. No OAuth adapter, execution path, or backend is
> implemented or qualified by this projection. No runtime scenario below has
> been executed.

## Authority and time boundary

The durable product requirement is support for officially authorized direct
OpenAI inference through eligible ChatGPT-plan OAuth, as established by
[Section 0.15 of the normative specification](../specification/llm-invoke-spec.md#015-openai-chatgpt-plan-oauth-for-direct-llm-inference)
and recorded in
[ADR-005](../adr/adr-005-openai-chatgpt-plan-oauth-inference.md).

The current provider state is the technical mechanism and limitations described
in official OpenAI documentation consulted on **2026-11-05**. These details may
change. They are integration constraints to recheck when qualifying a route,
not universal `llm-invoke` invariants or a selected runtime realization.

[ADR-002](../adr/adr-002-establish-turnlock-compatibility-boundary.md) and
[ADR-003](../adr/adr-003-at-most-once-llm-inference.md) remain confirmed. Neither
provider documentation nor OAuth access establishes execution-path conformance.
The product remains independent of Codex, Turnlock, and any particular backend.

## Official OpenAI references

All six pages were consulted as the documentation state on 2026-11-05:

- [Sign in with ChatGPT overview](https://developers.openai.com/siwc/token-sharing-open-source)
- [Registration and sign-in](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)
- [Models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)
- [Preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations)
- [Self-hosted VMs](https://developers.openai.com/siwc/token-sharing-open-source/self-hosted-vms)
- [Errors and recovery](https://developers.openai.com/siwc/token-sharing-open-source/errors-and-recovery)

Reading these pages is documentary verification only, not OAuth or backend
qualification. No sign-in, credential inspection, model request, or subscription
consumption is part of this update.

## Current provider integration facts

The following describe the currently documented OpenAI mechanism only:

1. The official mechanism is **Sign in with ChatGPT**, with permission to consume
   the user's ChatGPT plan for eligible requests. Plan usage is an optional
   capability of sign-in, not a consequence of identity authentication alone.
2. The OAuth flow requests identity scopes `openid`, `profile`, and `email`, and
   plan-usage scopes `offline_access`, `resource.invoke`, and
   `chatgpt.tokens.use.direct`. Requested scopes and actually granted permissions
   must not be conflated.
3. Identity authentication alone does not authorize subscription inference.
   Sign-in and recovery documentation require checking the granted direct-use
   permission; a valid ID token alone is insufficient.
4. The officially documented direct inference interface is
   `POST https://api.openai.com/v1/responses`, using an OAuth access token
   authorized for this route. This records a current provider endpoint, not a
   universal `llm-invoke` transport or public API decision.
5. The current HTTP route requires `store: false` and `stream: true`. A transport
   completion or stream terminal event is not by itself `VerifiedSuccess` under
   `llm-invoke`'s applicable invocation contract.
6. The application must account for the route's parameter and capability
   restrictions in **Preview limitations**. For example, current restrictions
   include unsupported `temperature`, `top_p`, and `max_output_tokens` fields
   and limitations on tools and conversation state. This projection is not an
   exhaustive capability catalog; qualification must recheck the current route.
   An explicitly required unsupported parameter must produce explicit non-success,
   not silent removal or alteration of the caller's contract.
7. Model availability is specific to the account and workspace. A requested
   model is not automatically accessible; discovering another available model
   does not authorize substitution of the requested one.
8. Personal self-hosted installations can use distinct host identifiers and the
   official secure credential-transfer procedure. The VM guide describes a
   stable VM host ID, local OAuth for the same tool/client, user and workspace,
   secure transfer of the selected protected registration, preservation of the
   VM's own host ID, and VM-owned later refreshes. The guide also states that
   host-specific usage attribution and revocation for transferred sessions are
   not yet available. These are current provider integration properties, not a
   selected `llm-invoke` storage, transfer, or deployment architecture.
9. Paid commercial applications or applications hosted for third parties must
   not be assumed eligible for the same mechanism. The overview scopes these
   documents to open-source and locally hosted apps and directs paid or remotely
   hosted app inquiries to an interest process; the self-hosted VM guide does
   not establish universal hosting eligibility.
10. An OAuth token from an existing Codex login must not be presumed usable for
    direct inference without checking its effective authorization and the
    selected route's eligibility. A login, credential file, or authenticated
    session alone is not sufficient evidence.
11. No internal ChatGPT `backend-api` endpoint is authorized as an alternative
    by this decision. The official direct-inference documentation points to the
    public Responses API and explicitly excludes those internal endpoints.
12. Token presence demonstrates neither available quota, universal absence of
    additional billing, nor at-most-once conformance. Subscription ownership
    does not establish unlimited usage, every model entitlement, request
    eligibility, or execution integrity.

## Future qualification boundary

Identity authentication, inference authorization, and invocation acceptance
must be assessed separately. Credential selection must preserve explicit
account, workspace, profile, authentication-mode, and billing-path authority;
without explicit selection, only an authorized, unambiguous policy may choose.
Doppler and environment variables remain optional credential integration
choices, not mandatory core infrastructure.

Provider recovery advice is not authority to replay an invocation, change its
billing path, or remove required parameters. Any future recovery must preserve
[Section 0.6.1](../specification/llm-invoke-spec.md#061-universal-at-most-once-actual-llm-execution).
An error, failed stream, disconnect, HTTP status, or missing response alone is
not evidence of prior non-execution. A genuinely separate caller-authorized
operation cannot disguise replay of a possibly executed logical invocation.

OAuth client realization, token lifecycle and concurrent renewal, multiple
accounts and workspaces, host identities, storage, secure transfer, transports,
backend adapters, and deployment realization remain open. No persistence or
retry mechanism is imposed here. Unsupported or insufficiently evidenced
execution routes fail closed; no backend qualification, historical parity, or
runtime conformance is claimed.

## Future qualification matrix

Every entry is a planned scenario only. `NOT_IMPLEMENTED / NOT_QUALIFIED`
records its current state, not a runtime result or a passing test.

| Scenario ID | Condition to qualify | Status |
| ----------- | -------------------- | ------ |
| OAUTH-01 | Valid account and direct permission: access only to the authorized model. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-02 | Missing `chatgpt.tokens.use.direct` permission: no inference. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-03 | Consent declined or session revoked: explicit stop. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-04 | Expired or inaccessible OAuth profile: no silent identity change. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-05 | Requested model unavailable: no automatic model substitution. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-06 | Subscription quota exhausted: no fallback to a separately billed API key. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-07 | Multiple accounts or workspaces: deterministic selection and preserved identity. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-08 | Personal self-hosted VPS or VM: host identities and authorized procedure respected. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-09 | Interruption after transmission: no second inference without sufficient evidence. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-10 | Interrupted streamed response: no unestablished success or unsafe replay. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-11 | Required parameter unsupported by the route: explicit non-success without silently altering the contract. | NOT_IMPLEMENTED / NOT_QUALIFIED |
| OAUTH-12 | Token renewal and concurrent invocations: no credential confusion or duplicated inference. | NOT_IMPLEMENTED / NOT_QUALIFIED |
