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
invocation.

This README is a non-normative entry point. The current product contract lives
in the [normative specification](docs/specification/llm-invoke-spec.md).
Architectural decision history begins with
[ADR-001](docs/adr/adr-001-make-product-intent-govern-invocation-semantics.md).

## Repository status

The repository is product-semantics-first. It does not yet select a public API,
implementation language, execution backend, provider, package architecture,
persistence model, network protocol, or deployment model.

Read the [repository directives](AGENTS.md) before architecture or
implementation work.

## Documents

- [Normative specification](docs/specification/llm-invoke-spec.md) — current
  product meaning, success semantics, outcome distinctions, and boundaries.
- [ADR-001](docs/adr/adr-001-make-product-intent-govern-invocation-semantics.md)
  — why Product Intent and its future derivations govern mechanisms.
- [Repository directives](AGENTS.md) — authority order and agent guardrails.
