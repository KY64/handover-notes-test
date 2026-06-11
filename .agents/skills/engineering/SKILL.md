---
name: engineering
description: Guides implementation-oriented software work: building features, debugging, refactoring, architecture-sensitive changes, security-aware design, and verification. Use when changing code, investigating bugs, improving implementation quality, or making non-trivial engineering decisions. Routes to frontend, backend, testing, debugging, and security references when relevant.
---

# Engineering

Use this skill for implementation-oriented software work. Keep the work grounded in the actual codebase and verify with the project's tools.

## Default workflow

1. Clarify the goal and acceptance criteria if they are ambiguous.
2. Inspect relevant files before proposing or editing code.
3. Choose the smallest safe implementation path.
4. Make incremental changes; keep the project runnable.
5. Verify with compile, tests, lint, or a focused smoke check.
6. Summarize what changed, what was verified, and remaining risks.

## Reference routing

Read these references only when relevant:

- https://www.conventionalcommits.org/en/v1.0.0/#specification - this is how you write commit if unsure, yet always check git commit history first to follow the existing convention
- `references/frontend.md` — frontend engineering and design: UI, components, styling, accessibility, state, routing, forms, browser behavior, frontend testing, distinctive visual direction, polished aesthetics, landing pages, dashboards, posters, or web interfaces.
- `references/backend.md` — APIs, databases, services, auth/authz, migrations, queues, server-side architecture, persistence, or reliability.
- `references/testing.md` — choosing test levels, writing tests, debugging failing tests, fixtures, mocks, coverage, or quality gates.
- `references/debugging.md` — runtime errors, failing commands, regressions, crashes, incorrect behavior, unclear root causes, or build failures.
- `references/security.md` — security-sensitive changes, authentication, authorization, input validation, secrets, dependency risk, OWASP Top 10 concerns, CWE-style weakness analysis, or threat modeling.

## Principles

- Use simple direct language to explain
- Optimize for reduced total complexity, not just fewer lines. Watch for change amplification, high cognitive load, and unknown caller contracts.
- Prefer deep modules and helpers: simple interfaces that hide meaningful complexity. Avoid shallow wrappers, pass-through abstractions, and scattered special cases.
- Preserve existing behavior unless the user asks to change it. When changing shared or generic paths, audit all callers and opt-out modes before assuming a local fix is safe.
- Keep narrow fixes narrow. Do not move a specific helper/fix into a generic creation/execution path unless every affected caller contract is intentionally updated.
- Hide unstable design decisions behind the module that owns them. Pull complexity downward when it makes callers simpler and more consistent.
- Write testable code by designing clear observable behavior behind stable interfaces. Prefer pure/domain logic separated from I/O, time, randomness, network, and persistence boundaries.
- Do not add test-only seams that make production design shallower. Improve the design boundary first; tests should usually exercise public behavior, not private implementation details.
- Prefer boring, maintainable code over cleverness; consistency reduces cognitive load.
- Define errors out of existence when practical instead of spreading defensive handling across callers.
- Treat compiler/test/runtime output as evidence, not as a substitute for design review.
- Treat security as a normal engineering constraint, not a final checklist. Consider OWASP Top 10, CWE classes, least privilege, secure defaults, and abuse cases when relevant.
- Surface tradeoffs, assumptions, and irreversible decisions when they are not obvious.
- Leave the code easier to understand than you found it.

## Design review prompts

Use these prompts before making or approving non-trivial changes:

- What complexity does this change add, remove, or relocate?
- Does a small future change become easier, or will it require edits in many places?
- Is the interface simple because complexity is well hidden, or shallow because the burden moved to callers?
- Can the important behavior be tested through a stable public boundary without coupling tests to internals?
- Which behavior is intentionally changed, and which existing caller contracts must remain unchanged?
- Are there opt-out modes, local/remote variants, tags, metadata, permissions, or lifecycle paths that the change accidentally broadens?
- Can this be made narrower, more consistent, or easier to delete later?

## Comments and documentation

- Write comments to explain intent, invariants, design constraints, tradeoffs, and why a non-obvious approach is necessary.
- Do not write comments that merely restate what the code says; improve the name or structure instead.
- Put comments near the abstraction boundary where the reader needs the context: public APIs, tricky helpers, protocol contracts, compatibility constraints, and error-handling policy.
- Use comments to record caller contracts that must not be broadened accidentally, especially around generic paths, opt-out modes, metadata/tag preservation, persistence, permissions, and local/remote behavior.
- Update or delete stale comments when changing behavior. A wrong comment is worse than no comment because it creates false confidence.
- Prefer short comments with durable facts over long narratives about implementation history. If history matters, capture the preserved lesson or invariant, not the whole story.

## Done checklist

Before declaring implementation done, consider:

- Does it compile/typecheck?
- Do relevant tests pass?
- Is important behavior testable without exposing internals or adding brittle test-only hooks?
- Was a focused manual smoke check done or considered?
- Are edge cases and failure paths handled or explicitly noted?
- Were relevant security risks considered: auth/authz, validation, injection, XSS/CSRF, secrets, unsafe deserialization, dependency risk, sensitive data exposure, and access control?
- Are risks, skipped checks, or follow-ups clearly stated?
