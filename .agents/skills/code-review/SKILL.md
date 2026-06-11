---
name: code-review
description: Reviews code, diffs, pull requests, architecture changes, security risks, and implementation quality. Use when the user asks for a review, PR review, critique, audit, risk assessment, security review, or asks what is wrong with code. Focuses on correctness, maintainability, OWASP/CWE-style risks, and verification gaps.
---

# Code Review

Use this skill to review code as a maintainer. Prefer specific, actionable feedback over broad commentary.

## Review priorities

1. Correctness and bugs
2. Edge cases and failure modes
3. Security, privacy, or data-loss risks, including OWASP Top 10 and CWE-style weakness classes when relevant
4. API/contract compatibility
5. Maintainability and clarity
6. Tests and verification gaps
7. Style and consistency

## Security review prompts

For security-sensitive code, explicitly consider:

- Broken access control: missing object-level, tenant-level, role-level, or server-side authorization checks.
- Injection: SQL, command, template, NoSQL, LDAP, path traversal, SSRF, or unsafe parsing.
- XSS/CSRF/browser risks: unsafe HTML, weak cookie/session settings, missing CSRF protection, unsafe redirects.
- Secrets and sensitive data: leaked tokens, PII exposure, verbose errors, insecure logging, weak crypto.
- Insecure design or defaults: unsafe fallbacks, overly broad permissions, trust in client-controlled data.
- Vulnerable dependencies or supply-chain risk from new packages, generated code, or external services.

## SEO review prompts

For public, indexable frontend pages such as blogs, documentation, marketing pages, landing pages, portfolios, and product pages, also review against `engineering/references/seo.md`. Do not apply SEO requirements heavily to private tools, authenticated dashboards, admin panels, or internal applications unless requested.

Consider metadata, canonical URLs, semantic headings, crawlability, structured data, meaningful links, image alt text, social previews, redirects, sitemap/robots behavior, and Core Web Vitals.

## Review style

- Reference files, functions, or line numbers when possible.
- Separate blocking issues from non-blocking suggestions.
- Explain why each issue matters.
- Do not rewrite code unless asked.
- Avoid nitpicks unless they affect readability, consistency, or future maintenance.

## Comment review

- Treat comments as part of the design surface. Good comments explain intent, invariants, design constraints, tradeoffs, compatibility contracts, and why a non-obvious approach is necessary.
- Flag comments that merely restate code when they add cognitive load; suggest better naming or structure instead.
- Check that comments live near the abstraction boundary where readers need the context: public APIs, tricky helpers, protocol contracts, compatibility constraints, and error-handling policy.
- Look for stale or misleading comments after behavior changes. A wrong comment is worse than no comment because it creates false confidence.
- Prefer concise comments with durable facts over long narratives about implementation history. If history matters, preserve the lesson or invariant, not the whole story.
- When reviewing broad/generic paths, value comments that record caller contracts that must not be broadened accidentally: opt-out modes, metadata/tag preservation, persistence, permissions, and local/remote behavior.

## Output shape

Use this structure when appropriate:

```text
Summary
Blocking issues
Non-blocking suggestions
Tests / verification gaps
Overall verdict
```

## Engineering context

For deep architectural review, complex refactors, or implementation tradeoffs, also use the `engineering` skill. Do not automatically load engineering for small/local reviews.

For security-heavy reviews, use `engineering/references/security.md` as deeper context.
