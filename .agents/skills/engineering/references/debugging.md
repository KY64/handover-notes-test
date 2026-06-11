# Debugging Reference

Use when investigating runtime errors, failing tests, build failures, regressions, crashes, incorrect behavior, or unclear root causes.

## Workflow

1. Use an isolated branch, worktree, or scratch area when the investigation or fix could disrupt existing work.
2. Reproduce the problem or identify the exact failing command/output.
3. Read the error message, stack trace, logs, and failing assertion carefully.
4. Narrow to the smallest failing path.
5. Form one hypothesis at a time.
6. Inspect relevant code and data flow.
7. Make the smallest change that tests or fixes the hypothesis.
8. Re-run the failing command.
9. Stop when the root cause and verification are clear.
10. Report the evidence, root cause, and proposed smallest fix, then request explicit user approval before implementing the fix.

## Principles

Use the Seven Phases of First-Principles Thinking as query generators, not as a reason to over-analyze:

* **Attunement:** What subtle signal, repeated pattern, or odd mismatch might be easy to dismiss?
* **Observation:** What exact facts do the error, logs, tests, inputs, outputs, and recent changes show?
* **Intuition:** What feels inconsistent with the system's intended behavior, and what evidence supports that feeling?
* **Transformation:** Can the vague symptom be converted into a precise, reproducible problem statement?
* **Analysis:** Which assumption is most likely wrong? What is the smallest experiment that could disprove it?
* **Execution:** What is the smallest fix or probe that tests the current hypothesis?
* **Iteration:** Did the result confirm the hypothesis, disprove it, or reveal a better question?

## Common causes

- Wrong input shape or type
- Off-by-one or boundary condition
- Missing None/null/error case
- State mutation or ordering bug
- Async/race/timing issue
- Environment/config mismatch
- Stale generated files or caches
- Dependency/API version mismatch

## Debug report shape

Use this structure when explaining findings:

```text
Symptom
Evidence
Root cause
Fix
Verification
```
