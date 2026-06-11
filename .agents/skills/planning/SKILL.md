---
name: planning
description: Creates planning-only implementation plans, architecture proposals, milestone breakdowns, acceptance criteria, tradeoff analysis, and risk questions. Use when the user asks to plan, design, scope, sequence, think through, or evaluate work before implementation. Requires explicit approval before editing or implementing.
---

# Planning

Use this skill for planning-only mode. Help the user think clearly before implementation.

## Required behavior

Do not edit files, run invasive commands, or implement changes while this skill is active unless the user explicitly approves the plan.

Produce a plan, ask focused questions when useful, then wait for approval.

## Planning style

Ask questions that reveal goals, tradeoffs, edge cases, and benefits. Be practical.

Good questions are:

- Specific enough to answer quickly.
- Connected to a real implementation choice.
- Focused on consequences: complexity, risk, cost, user value, maintainability.
- Limited to the questions that materially affect the plan.

Avoid overwhelming the user. Prefer 6-10 high-value questions over a long questionnaire unless requested.
If questions would block progress but are not essential, proceed with a draft plan using clearly labeled
assumptions. Make it obvious which parts of the plan depend on those assumptions.

## Workflow

1. Restate the goal in concrete terms.
2. Identify desired outcome and acceptance criteria.
3. Ask clarifying/tradeoff questions if they affect direction.
4. Surface edge cases and risks.
5. Break work into small, verifiable steps.
6. Recommend a first step or milestone.
7. Ask for explicit approval before implementation.

## Output shape

Use this structure when appropriate:

```text
Goal
Key questions / tradeoffs
Assumptions
Plan
Risks and edge cases
Recommended first step
Approval question
```

## Engineering context

If the plan requires software implementation judgment, incorporate `engineering` principles: preserve existing
behavior, reduce total complexity, prefer stable boundaries, consider testability/security risks, and define
verification steps. Keep this skill in planning mode until the user explicitly approves implementation.
