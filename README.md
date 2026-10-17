---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "repository-overview"
domain: "llm-invoke"
severity: "guideline"
name: "llm-invoke repository overview"
---

# llm-invoke

`llm-invoke` is being specified as a contract-first runtime for programmatic LLM
invocation. It prioritizes easy adoption by software-building agents without
becoming an agent, harness, or workflow orchestrator.

The standard invocation direction is conceptually
`provider + model + reasoning + input`, with reasoning control optional when no
specific reasoning condition is required. Explicitly requested parameters are
contractual conditions, not preferences that a backend may silently change.
Results preserve four execution distinctions: `VerifiedSuccess`,
`ContractViolation`, `ExecutionFailure`, and `IndeterminateExecution`.
Credential resolution, backend execution, and invocation-contract evaluation
remain separate responsibilities. Universal at-most-once actual inference is a
non-waivable requirement.

This README is a non-normative entry point. The current product contract lives
in the [normative specification](docs/specification/llm-invoke-spec.md).
Architectural decision history begins with
[ADR-001](docs/adr/adr-001-make-product-intent-govern-invocation-semantics.md).

## Repository status

The repository is product-semantics-first. It has no implemented public API,
ratified execution backend, or runtime architecture. It does not yet select an
implementation language, provider, package architecture, persistence model,
network protocol, or deployment model.

Read the [repository directives](AGENTS.md) before architecture or
implementation work.

## Documents

- [Normative specification](docs/specification/llm-invoke-spec.md) — current
  product meaning, success semantics, outcome distinctions, and boundaries.
- [ADR-001](docs/adr/adr-001-make-product-intent-govern-invocation-semantics.md)
  — why Product Intent and its future derivations govern mechanisms.
- [ADR-002](docs/adr/adr-002-establish-turnlock-compatibility-boundary.md) — why
  Turnlock compatibility remains a derived boundary.
- [ADR-003](docs/adr/adr-003-at-most-once-llm-inference.md) — why universal
  at-most-once actual inference is non-waivable.
- [ADR-004](docs/adr/adr-004-agent-first-invocation-and-credential-authority.md)
  — why agent-first invocation and credential authority extend Product Intent.
- [At-most-once inference derivation](docs/architecture/at-most-once-inference-derivation.md)
  — non-normative verification and backend-admissibility gates.
- [Turnlock compatibility projection](docs/architecture/turnlock-compatibility.md)
  — non-normative compatibility obligations for Turnlock integration.
- [Credential resolution projection](docs/architecture/credential-resolution.md)
  — non-normative credential integration and personal-adapter boundaries.
- [Repository directives](AGENTS.md) — authority order and agent guardrails.
