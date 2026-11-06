---
okf_version: "1.0"
kind: "KnowledgeAsset"
asset_type: "architecture-compatibility-assessment"
domain: "llm-invoke"
severity: "guideline"
name: "Exact historical 644-test coverage crosswalk"
---

# Historical `llm-runtime` test coverage crosswalk

**Status:** complete **file-level** inventory of the exact historical CI
run, with design-relevance routing. **NOT** a per-assertion or
per-test-case 644-vector migration, not a Vercel SDK parity pass,
and not a Product Intent authority.

## Provenance

- Source repository: `fanilosendrison/llm-runtime`, pinned SHA
  `29e9a2bb5e2dfdc6cd7f29933ff96536f9226f5d`.
- GitHub Actions: https://github.com/fanilosendrison/llm-runtime/actions/runs/34904759785
- Verified job logs: Node 22 job `104178730946` and Node 20
  job `104178731254`; each reports `28 passed` test files and
  `644 passed` tests; build job `104178863282` succeeded.
- Per-file counts below were extracted from the Node 22 job's Vitest
  log output. They sum mechanically to 644.
- New safety decision: [ADR-003 proposal / PR #2](https://github.com/fanilosendrison/llm-invoke/pull/2).
  Duplicate actual LLM inference for one logical invocation is **never
  permissible**, even if the old runtime's retry tests expect re-execution
  after a timeout.

## Classification rule

- **PRESERVE:** an independently desirable *observable property* of the
  old runtime that does not contradict the new Product Intent.
- **ADAPT:** the property still matters but requires a contract/evidence
  interpretation, a different boundary, or a complementary mechanism.
- **SUPERSEDE:** an old behavior conflicts with universal at-most-once
  execution. Do not treat an intentional safety correction as a regression.
- **SCOPE-OPEN:** the old feature is not yet established as required
  Product Intent (especially embedding support). Retain evidence, but
  do not impose an unratified new requirement.
- **MECHANISM:** old TypeScript types, HTTP bindings and file architecture
  cannot become mandatory merely because they were previously tested.

## All historical test files (28/28)

| # | Historical file | Tests | Guarantee links | Crosswalk / disposition |
| ---: | --- | ---: | --- | --- |
| 01 | `tests/engine/execute-call-abort-timeout.test.ts` | 26 | G06 G19; AMO-01/03/06 | Keep abort/deadline handling; REPLACE timeout-as-safe-retry assumption |
| 02 | `tests/contracts/observability.test.ts` | 36 | G11; AMO-11/12 | Preserve call/attempt correlation and privacy; add known/unknown remote execution evidence |
| 03 | `tests/engine/execute-call-retry.test.ts` | 33 | G04 G19; AMO-01/02/04 | Keep bounded retry decision evidence; SUPERSEDE retries after possibly executed inference |
| 04 | `tests/engine/execute-embedding.test.ts` | 33 | G02 G04; AMO TBD | Embedding batch parity candidate; semantics/scope need separate product decision |
| 05 | `tests/engine/execute-call-happy-path.test.ts` | 26 | G01 G07 G09 G12 G16 | Retain normalized response and evidence; SDK return cannot imply VerifiedSuccess |
| 06 | `tests/engine/execute-call-integrity.test.ts` | 22 | G08 G09; AMO-12 | Retain truncation/mismatch detection; require adequate evidence, not inferred fields |
| 07 | `tests/global-contract.test.ts` | 25 | G13 G15 G16 | Preserve observable safety; legacy type/HTTP shape not normative to Invoke |
| 08 | `tests/bindings/anthropic.test.ts` | 37 | G01 G03 G07 G09 | Provider fixtures reusable; SDK adapter parity not yet proved |
| 09 | `tests/properties/properties.test.ts` | 31 | G06 G11 G13 G14; AMO-07/08 | Preserve deterministic and isolation properties; extend to invocation identity |
| 10 | `tests/services/retry-resolver.test.ts` | 52 | G04 G14 G19; AMO-01/02/04 | Keep pure retry inputs/decisions only if at-most-once safe; old retriable-kind alone insufficient |
| 11 | `tests/engine/execute-call-throttle.test.ts` | 10 | G05 G06 | Preserve proactive rate handling if qualified; no duplicate side effects through waits |
| 12 | `tests/bindings/openai.test.ts` | 28 | G01 G03 G07 G09 | Provider fixture parity candidate; model identity evidence provenance separate |
| 13 | `tests/services/sanitizer.test.ts` | 37 | G10 G08 | Preserve optional raw vs transformed content distinction; no false proof of completeness |
| 14 | `tests/bindings/openai-compatible.test.ts` | 22 | G01 G03 G07 G09 | SDK route candidate; inspect provider identifiers, headers, fallback |
| 15 | `tests/contracts/errors.test.ts` | 20 | G03 G16 G19 | Keep operational taxonomy where useful; add IndeterminateExecution |
| 16 | `tests/bindings/google.test.ts` | 29 | G01 G03 G07 G09 | Provider fixture parity candidate; reasons and capabilities |
| 17 | `tests/services/signal-composer.test.ts` | 18 | G06 G14 G19 | Preserve cancellation precedence/cleanup; abort does not prove remote non-execution |
| 18 | `tests/contracts/stats.test.ts` | 12 | G11 G12 | Keep usage as observed only; distinguish all attempts and inference identity |
| 19 | `tests/services/throttle-resolver.test.ts` | 18 | G05 G14 | Keep pure throttle decisions; rate-limit headers are not inference non-execution evidence |
| 20 | `tests/services/token-estimator.test.ts` | 22 | G05 | Preserve estimate as estimate, not provider evidence |
| 21 | `tests/services/error-classifier-base.test.ts` | 28 | G03 G16 G19 | Retain error kind but do NOT classify timeout as known non-execution |
| 22 | `tests/bindings/openai-embeddings.test.ts` | 15 | G02 G03 | Candidate parity; embedding support decision required |
| 23 | `tests/services/parse-retry-after.test.ts` | 25 | G04 G14 G19 | Retry-After affects delay only; never authorizes a second inference |
| 24 | `tests/contracts/temporal.test.ts` | 6 | G06 G13 G14 | Preserve monotonic deadlines; timeouts never imply provider did not execute |
| 25 | `tests/services/error-kind.test.ts` | 13 | G03 G19 | Typed error taxonomy candidate; add execution certainty dimension |
| 26 | `tests/bindings/openai-compatible-deepseek-thinking.test.ts` | 13 | G01 G09 G20 | Preserve actual provider-option semantics and warnings |
| 27 | `tests/engine/execute-call-body-timeout.test.ts` | 5 | G06 G19; AMO-01/03 | Body/read timeout after dispatch: do not replay without dedup |
| 28 | `tests/engine/execute-embedding-body-timeout.test.ts` | 2 | G02 G06 G19 | Potential executed embedding batch; scope and cardinality still open |
| **TOTAL** | **28 files** | **644** | — | Historical CI exact-SHA PASS; Invoke parity UNKNOWN |

The `G..` identifiers point to
[`llm-runtime-guarantee-preservation-assessment.md`](llm-runtime-guarantee-preservation-assessment.md).
The `AMO-..` identifiers point to the at-most-once derivation proposed in
[PR #2](https://github.com/fanilosendrison/llm-invoke/pull/2). These are
routing aids, not normative or test-execution evidence.

## Immediate non-regression gates

1. **Fail closed after possible execution:** anything in old retry or
   timeout tests which expects another inference after an ambiguous network
   error must be replaced by a negative test asserting no second inference.
   Do not count such an intentional change as reduced reliability.
2. **Preserve real operational protections:** backoff on proven
   non-execution, proactive rate limits, abort propagation, monotonic time,
   normalized errors, explicit termination/truncation, raw/clean output
   distinctions and privacy-preserving event correlation.
3. **Do not infer unsupported completeness:** all historical test group
   outcomes are green in their historical CI. That does not establish
   equivalence of a Vercel provider adapter, or even that 644 individual
   vector semantics are all desirable for Invoke.
4. **Explicit independent scope decisions:** embeddings are implemented
   historically, but not yet specified as an intrinsic `llm-invoke`
   Product Intent obligation. Any future support must specify whether
   at-most-once compute applies to each embedded input/batch.
5. **Adversarial conformance first:** use controllable provider counters
   to distinguish transport attempts from actual inference executions,
   including hidden gateway failover and recovery after process crash.

## Coverage status

```text
HISTORICAL_EXECUTION=PASS_AT_EXACT_SHA
HISTORICAL_FILES_MAPPED=28/28
HISTORICAL_TESTS_ACCOUNTED_FOR=644/644
INDIVIDUAL_TEST_SEMANTICS_MAPPED=NOT_YET
SDK_PARITY_FOR_644_TESTS=NOT_YET
UNIVERSAL_AT_MOST_ONCE_INFERENCE=PRODUCT_REQUIREMENT_NOT_YET_IMPLEMENTED
```

This crosswalk is the input to a future itemized conformance corpus, not
a substitute for it.
