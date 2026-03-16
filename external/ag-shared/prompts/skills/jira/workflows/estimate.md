# JIRA Ticket Estimation Workflow

Structured complexity and effort estimation for JIRA tickets, features, or projects.

## Prerequisites

- User provides JIRA ticket content (markdown format preferred).
- Access to repository codebase for dependency analysis.
- Product-specific calibration data loaded from the product file.

## Workflow

### Step 0: Load Required Documentation

Read technology stack rules and `CLAUDE.md` from the target repo first. Confirm you understand repo structure, build/test commands, and architectural constraints before proceeding.

### Step 1: Gather and Analyse Ticket Information

- [ ] Receive JIRA ticket content from user (markdown format).
- [ ] Extract key requirements, acceptance criteria, and constraints.
- [ ] Identify the primary affected areas (packages/files) and work type (bug fix, feature, refactoring, docs).
- [ ] Note what information is present vs. missing.
- [ ] Determine scope boundaries and related dependencies.

### Step 1.5: Classify Scope

Based on initial analysis, classify the scope to determine report depth:

| Scope | Heuristic | Report Depth |
|-------|-----------|--------------|
| **Small** | <1 day, single file, clear root cause | Executive Summary + Time Estimate + Top Risk only |
| **Medium** | 1-5 days, multi-file, moderate unknowns | All 5 sections, concise |
| **Large** | >5 days, cross-package, new feature | All sections, detailed breakdown |

### Step 2: Identify Ambiguities and Implementation Choices

**CRITICAL: Do NOT proceed to estimation without completing this step.**

Only raise ambiguities that would change the estimate by >20% or shift the complexity level. Focus on material decisions:

**DO ask about:**

- Technical approach when multiple strategies differ significantly in effort.
- Whether framework wrappers (React/Angular/Vue) are in scope.
- Whether migration guides or backward compatibility is required.
- Performance requirements or targets.
- Documentation and example scope.

**Do NOT ask about:**

- Coding style preferences, exact file placement, variable naming.
- Standard testing expectations (covered by repo conventions).
- Obvious architectural patterns already established in the codebase.

Present 1-4 ambiguities using the **AskUserQuestion tool** with:

- **question**: Clear question about the ambiguity.
- **header**: Short label (max 12 chars).
- **options**: 2-4 implementation choices, each with impact on time/complexity in the description.
- **multiSelect**: false.

After receiving answers, document chosen approaches and adjust estimates accordingly.

### Step 3: Investigate Codebase Dependencies and Complexity

Use the **Explore agent** to analyse:

- All affected files and packages.
- Existing similar implementations for patterns.
- Dependencies on other systems/modules.
- Related tests that need updating.
- Documentation that needs changes.

### Step 4: Generate Structured Estimation Report

Use this structure consistently. All sections required for Medium/Large scope; Small scope uses abbreviated format (see Step 1.5).

**Report Header:**

```
## Estimation Report: [Ticket ID/Feature Name]

**Date:** [Current date]
**Estimator:** Claude Code
**Ticket Summary:** [Brief 1-2 sentence summary]
```

**Executive Summary (always required):**

| Metric | Value |
|--------|-------|
| **Total Effort** | [X-Y days] ([X-Y hours]) |
| **Complexity** | [Low \| Medium \| High \| Very High] |
| **Risk Level** | [Low \| Medium \| High] |
| **Confidence** | [Low \| Medium \| High] |

Follow with 2-3 bullet Key Highlights summarising main work, scope decisions, and top concern.

**Section 1 — Estimated Complexity Level:** Overall rating with rationale. Include breakdown across Implementation, Testing, Documentation, Integration (each Low/Medium/High).

**Section 2 — Estimated Time Effort:** Total range in days for single developer + confidence level. Break down into: Investigation & Design, Core Implementation, Testing, Documentation, Review & Iteration. Each gets hours/days. End with explicit Assumptions list.

**Section 3 — Dependencies, Gaps & Missing Information:** Four sub-sections: External Dependencies, Information Gaps, Implicit Scope (not stated but likely required, e.g. framework wrapper updates, locale strings), Out of Scope (confirm with stakeholder).

**Section 4 — Top 3 Highest Risk Aspects:** For each risk:

- **Category:** Known Unknown / Technical Complexity / Integration Risk / etc.
- **Details:** What makes it risky + potential impact.
- **Mitigation:** How to reduce this risk.

Use `###` sub-headings per risk.

**Section 5 — Overall Risk Level:** Assessment (Low/Medium/High) with justification. Include factor breakdown: Technical, Schedule, Integration, Requirement risks (each rated). End with Confidence in Estimate and what would increase it.

**Closing:**

- Recommended Next Steps (3 numbered items).
- Implementation Decisions (Confirmed) — include ONLY if significant choices were clarified during estimation. List each decision with the chosen approach.

---

## Completion Checklist

- [ ] User provided JIRA ticket content.
- [ ] Scope classified (Small/Medium/Large).
- [ ] Material ambiguities identified and clarified with user.
- [ ] Codebase investigation completed using Explore agent.
- [ ] All required report sections filled out.
- [ ] Time estimate includes breakdown, assumptions, and confidence level.
- [ ] Top risks identified with mitigations.
- [ ] Report reviewed for completeness.

## Critical Rules

1. **Never skip ambiguity clarification** — If implementation choices would shift the estimate by >20%, ask the user via AskUserQuestion before proceeding.
2. **Be honest about uncertainty** — Low confidence should be stated clearly, with what would increase it.
3. **Use ranges, not point estimates** — Give ranges (e.g. "3-5 days") to reflect uncertainty.
4. **Consider the full scope** — Testing, documentation, review iterations, and framework wrappers often represent 40-50% of total effort.

## Failure Handling

**Insufficient ticket information:** Request specifics from user. List what's needed. If unavailable, provide estimate with large uncertainty range and note the gaps.

**Estimate exceeds 2 weeks:** Recommend breaking into sub-tasks or phases. Highlight in risk assessment and discuss scope reduction with user.
