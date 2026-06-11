# Testing Reference

Use when choosing test strategy, writing tests, debugging failing tests, creating fixtures, using mocks, designing testable code, or defining quality gates.

## Test selection

- Unit tests: domain rules, pure logic, transformations, edge cases, and behavior behind stable interfaces.
- Integration tests: APIs, database behavior, serialization, framework wiring, service boundaries, and infrastructure behavior.
- End-to-end tests: critical user flows only; avoid broad brittle coverage.
- Regression tests: bugs that should not return; start from the failing symptom when practical.

Prefer the cheapest test that gives real confidence. Move up the test pyramid when correctness depends on wiring, persistence, framework behavior, or external boundaries.

## Principles

- Good tests protect against regressions, resist refactoring, give fast feedback, and remain maintainable.
- Optimize for high-value tests: strong regression protection, high resistance to refactoring, fast feedback, and low maintenance cost.
- Test observable behavior, not implementation details. Prefer public APIs, stable module boundaries, outputs, state changes, and externally visible effects.
- Avoid coupling tests to shallow wrappers, private helpers, exact call sequences, or internal control flow unless the interaction itself is the contract.
- Prefer deep modules and domain APIs that make tests simple. If tests require elaborate setup, the production interface may be leaking complexity.
- Separate pure/domain logic from I/O, time, randomness, network, and persistence so important rules can be tested directly.
- Include meaningful failure, boundary, and authorization cases; do not chase coverage numbers for their own sake.
- Make test data explicit and readable; hide irrelevant setup behind builders/factories only when they reduce cognitive load.
- When a test fails, read the failure carefully before editing production code.

## Mocks and test doubles

- Use mocks primarily for out-of-process dependencies: network calls, databases, queues, email/SMS, payment providers, file systems, clocks, and randomness.
- Avoid mocking internal collaborators just to isolate classes. That often makes tests brittle and encodes implementation details.
- Prefer state/output verification over interaction verification unless the interaction is the observable contract, such as sending an email, publishing an event, charging a card, or calling an external API.
- Use fakes/stubs when they make behavior clearer and cheaper than a real dependency; use real integrations when wiring or persistence behavior is the risk.

## Testable design prompts

- What behavior must remain stable for callers?
- Can this behavior be verified through a public boundary?
- Is complexity hidden inside a deep module, or pushed into every test setup?
- Can pure decisions be separated from side effects?
- Are tests free to survive an internal refactor?
- Would a failing test explain a user-visible or business-relevant regression?

## Quality gate

Before declaring done:

- State which checks were run and which were skipped.
- Explain why the selected test level gives enough confidence.
- Prefer adding or updating tests when behavior changes, a bug is fixed, or the change affects contracts, security, persistence, or critical flows.
