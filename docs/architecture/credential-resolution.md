---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-integration-projection"
domain: "llm-invoke"
severity: "guideline"
name: "Credential resolution architecture and integration projection"
---

# Credential resolution architecture and integration projection

> **Status: Non-normative architecture / integration projection.**
>
> This document derives integration constraints from the
> [normative specification](../specification/llm-invoke-spec.md). It is not a
> second source of product authority and does not define an implemented API.

## Responsibility boundaries

```text
Software / Agent
      |
      | provider + model + reasoning + input
      v
llm-invoke
      |
      +---- Invocation contract evaluation
      |
      +---- Credential resolution boundary
      |           |
      |           +---- Independent credential adapter
      |
      +---- Execution backend
                      |
                      v
                LLM Provider
```

Credential resolution supplies authorized authentication material to the
execution boundary. It is distinct from evaluating whether requested execution
conditions were satisfied. The execution backend supplies execution mechanisms
and evidence; it does not decide whether the invocation conforms to the
applicable contract.

## Current personal integration profile

The current personal setup is an integration profile, not a universal product
requirement:

```text
Credential store: Doppler
Credential registry: ~/.agents/agent-credentials.json
Environment variables required: No
Core Doppler dependency: No
```

The registry has this conceptual shape:

```json
{
  "provider": {
    "profile": {
      "type": "api_key",
      "key": "<reference to authorized Doppler retrieval>"
    }
  }
}
```

In the registry currently used, `key` contains a Doppler retrieval command, not
the secret value. This projection records no real registry content, secret
identifier, personal Doppler project name, key value, or credential. The
personal registry is not an input to this documentation update.

## Target resolution behavior

Credential resolution follows these ordered rules:

1. Identify the requested provider.
2. Resolve the explicitly requested profile, when present.
3. Otherwise, use an authorized, deterministic default profile.
4. Otherwise, use the sole available profile only when that rule is configured
   and applicable.
5. Reject any remaining ambiguity.
6. Resolve the credential through the appropriate adapter.
7. Pass the secret only to the authorized execution component.
8. Never return the secret in the invocation outcome.

Profile selection must never depend on arbitrary JSON object ordering. Missing,
inaccessible, or ambiguous credentials must fail explicitly rather than causing
silent fallback to another identity.

Credential selection and authentication remain separate from caller-owned
invocation acceptance conditions. A selected profile or account becomes part of
the invocation contract only when the caller explicitly requires that identity.

## Doppler command-reference safety

The current registry format represents retrieval operations as command strings.
These strings are references to resolution operations, not authorization to
execute arbitrary instructions. A future personal adapter must enforce all of
the following design requirements:

- strictly validate the recognized Doppler command forms and reject any
  reference that does not exactly match an allowed form;
- execute an allowed operation with structured arguments and no shell
  interpretation;
- reject shell substitutions, pipelines, redirections, and compound commands;
- capture the Doppler subprocess stdout directly as sensitive secret data,
  without forwarding it to a terminal or the calling program's stdout;
- pass the captured value only to the authorized authentication mechanism;
- prevent the secret from appearing in logs, diagnostics, exceptions, events,
  traces, public results, or persisted evidence;
- treat subprocess stderr as potentially sensitive and never forward it without
  safe filtering;
- retain secret material no longer than authentication requires, within the
  capabilities of the future runtime; and
- never substitute another credential or provider silently after a retrieval
  error.

These are design requirements, not instructions to implement or execute a
Doppler adapter in this update. A credential reference never authorizes general
command execution.

## Ephemeral and remote environments

The personal registry may be absent from an ephemeral virtual machine, remote
worker, container, or continuous-integration environment. Such an environment
must be able to receive another authorized resolver without changing the
semantics of an eventual `invoke()` call.

This projection prescribes no secret-distribution mechanism for those
environments. When no resolver and usable credentials are available, no
invocation may begin under an invented or substituted identity.

## Universal boundary

```text
Doppler is a personal integration choice.
The credential-resolution boundary is a product concern.
The Doppler adapter is not a mandatory core dependency.
```
