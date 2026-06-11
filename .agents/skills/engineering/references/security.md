# Security Reference

Use when work touches authentication, authorization, user input, file/network boundaries, secrets, dependencies, payments, personal data, multi-tenant access, admin surfaces, or other security-sensitive behavior.

## Primary references

- OWASP Top 10 — use for common web application risk categories: broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable components, identification/authentication failures, software/data integrity failures, logging/monitoring failures, and SSRF.
- CWE — use for weakness classes when describing precise implementation flaws.
- ASVS-style thinking — use for practical application security requirements around auth, sessions, validation, access control, and data protection.
- MITRE ATT&CK — attacker behavior and attack-path mapping.
- OWASP Cheat Sheet Series — remediation and secure implementation guidance.

Do not force mappings when they are not useful or applicable.

## Engineering checklist

- Validate and normalize input at trust boundaries.
- Enforce authorization server-side; do not trust client-side checks.
- Apply least privilege to users, services, tokens, files, and database access.
- Avoid leaking secrets, tokens, PII, or internal errors in logs or responses.
- Prefer safe framework APIs over hand-rolled escaping, crypto, parsing, or auth.
- Consider injection risks: SQL, command, template, LDAP, NoSQL, path traversal, and SSRF.
- Consider browser risks: XSS, CSRF, clickjacking, unsafe redirects, and insecure cookies.
- Consider dependency and supply-chain risk for new packages or generated code.
- Consider abuse cases, misconfiguration, and privilege escalation paths.
- Add security-focused tests or verification when a change affects access control, validation, or sensitive data.

## Threat-model prompt

For security-sensitive changes, ask:

```text
What asset is protected?
Who can access this path?
What trust boundary is crossed?
What assumptions are being made?
What could an attacker control?
What is the worst credible failure?
How is the mitigation verified?
```
