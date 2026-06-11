# Backend Engineering Reference

Use when implementation touches APIs, services, databases, auth/authz, migrations, queues, background jobs, persistence, external services, or server-side architecture.

## Workflow

1. Identify the contract: inputs, outputs, side effects, error cases, and compatibility requirements.
2. Inspect existing service/API/database patterns before adding new ones.
3. Validate input at trust boundaries and normalize data before business logic.
4. Preserve backwards compatibility unless explicitly changing a contract.
5. Make persistence changes transaction-safe, migration-safe, and rollback-aware.
6. Verify success, failure, and authorization paths.

## API and service contracts

- Define request shape, response shape, status/error behavior, and side effects.
- Preserve existing API behavior unless the change intentionally updates the contract.
- Avoid leaking internal errors or implementation details to callers.
- Keep business logic out of thin transport/controller layers when a service/domain layer exists.
- Prefer explicit errors over ambiguous booleans, silent failures, or hidden fallbacks.

## Auth, authorization, and tenancy

- Treat authentication and authorization as separate checks.
- Enforce authorization server-side, close to the resource or domain operation.
- Check object-level and tenant-level access, not only role-level access.
- Do not trust client-provided user IDs, tenant IDs, roles, prices, limits, ownership fields, or permission flags.
- For auth/authz, secrets, sensitive data, injection, SSRF, file uploads, admin actions, or multi-tenant access, also read `security.md`.

## Database and consistency

- Check transaction boundaries for multi-step writes.
- Consider race conditions, concurrent updates, retries, and partial failure.
- Make migrations safe for existing data and running deployments.
- Prefer expand/contract migrations for risky schema changes.
- Consider indexes, query shape, pagination, and N+1 behavior for new or changed queries.
- Avoid broad data rewrites unless rollback and verification are clear.

## External calls, queues, and jobs

- Use timeouts and explicit error handling for external calls.
- Consider idempotency for retries, webhooks, background jobs, and payment-like flows.
- Decide what happens on partial failure and duplicate delivery.
- Consider rate limits, backoff, retry storms, and dead-letter behavior.
- Log enough to debug production issues without leaking secrets or sensitive data.

## Observability and operations

- Add structured logs at important state transitions and failure points.
- Include correlation/request IDs when available so requests can be traced across services.
- Record enough context to debug production issues without logging secrets, tokens, PII, or sensitive payloads.
- Consider metrics for throughput, latency, error rate, retries, queue depth, and external dependency failures.
- Use tracing spans around slow or failure-prone boundaries: database queries, external calls, jobs, and queues.
- Make important failures actionable: clear error messages, useful log fields, and alerts for sustained or severe issues.
- For audit-sensitive actions, record who did what, to which resource, and when.

## Verification

- Test contract behavior, not only implementation details.
- Cover success, failure, auth/authz, and important edge cases.
- For migrations, verify fresh setup and existing-data upgrade paths when practical.
- For jobs/webhooks/retries, verify idempotency or duplicate handling.
- State skipped checks or assumptions clearly.
