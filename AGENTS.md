---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "agent-directives"
domain: "llm-invoke"
severity: "strict"
name: "llm-invoke repository directives"
---

# llm-invoke repository directives

Use this file as the operational map for work in the `llm-invoke` repository.
Apply it together with all applicable parent workspace instructions.

## Authority by responsibility

Use each source only for the responsibility it owns:

1. [`docs/specification/llm-invoke-spec.md`](docs/specification/llm-invoke-spec.md)
   is the primary expression of current normative product meaning.
2. Accepted ADRs under `docs/adr/` record why important decisions exist and may
   authorize later changes. A semantic change is complete only when the
   specification is updated in the same change.
3. Future architecture and implementation artifacts may realize the normative
   contract but do not create or weaken product meaning. Derived architecture
   and compatibility projections under `docs/architecture/` record derived
   constraints and traceability and are non-authoritative for product
   semantics.
4. [`README.md`](README.md), generated views, tests, provider behavior, backend
   behavior, and historical `llm-runtime` mechanisms are non-authoritative for
   product semantics.

If the specification and an accepted ADR diverge, stop and report the
inconsistency. Do not select the interpretation that is most convenient for an
implementation.

## Required reading

Before changing product semantics, architecture, or preparing implementation
work, read:

1. `docs/specification/llm-invoke-spec.md`;
2. the ADRs governing the affected concepts, including
   [`ADR-003`](docs/adr/adr-003-agent-first-invocation-and-credential-authority.md)
   before modifying the invocation interface or credential resolution; and
3. every applicable parent workspace instruction.

## Derivation rule

Preserve this order:

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

Implementation convenience, provider behavior, backend capability, or an
existing library API must not silently weaken a higher-level obligation.

## Current implementation boundary

The repository currently establishes product semantics, not a runtime design.
Do not infer or introduce any of the following without a later accepted
decision that derives them from the Product Intent:

- a public API or schema;
- an implementation language;
- a mandatory backend or provider;
- a package architecture;
- persistence;
- a network protocol;
- a deployment model; or
- a retry, fallback, routing, caching, or observability mechanism.

Do not create speculative source, test, package, or deployment layouts before
those responsibilities and ecosystem boundaries are decided.

## Product boundary

Keep `llm-invoke` backend-neutral and autonomous. Turnlock is an important
prospective consumer, not a source of `llm-invoke` semantics.

Prioritize agent-first adoption without turning `llm-invoke` into an agent,
harness, or orchestrator. Treat explicitly requested invocation parameters as
contractual conditions, and do not infer equivalence between provider-specific
reasoning controls.

Resolve credentials through an independent boundary without imposing a
universal secret source. Keep any personal Doppler adapter separate from the
product core. Do not present a definitive API, adapter, backend, or runtime
implementation at this stage.

Keep invocation execution integrity separate from semantic truth. A verified
invocation contract does not establish that model output is true, correct,
useful, safe, optimal, or fit for an unstated purpose.

## Documentation rules

- Use `llm-invoke` as the canonical product name.
- Keep normative product meaning in the specification rather than duplicating it
  across entry-point documents.
- Use ADRs for decision provenance, not as a second independently maintained
  current specification.
- Mark non-authoritative summaries as such.
- Keep new filenames and directories in lowercase kebab-case except recognized
  system entry points such as `AGENTS.md` and `README.md`.
