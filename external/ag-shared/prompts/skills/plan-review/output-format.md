# Plan Review Output Format

Use this template to generate the final review report.

---

```markdown
# Plan Review Report

## Summary

-   **Plan File:** [path/to/plan.md]
-   **Review Mode:** [Quick/Thorough]
-   **Overall Assessment:** [Ready/Needs Work/Major Gaps]
-   **Specification Coverage:** X/N original requirements fully covered
-   **Intent Clarity:** [Clear/Partial/Missing] ← CRITICAL for execution quality
-   **Agentic Readiness:** [High/Medium/Low]
-   **Parallelisation Potential:** XX%

### Issue Counts

| Severity  | Count |
| --------- | ----- |
| Critical  | X     |
| Important | Y     |
| Minor     | Z     |

---

## Intent Assessment

### Core Intent

> [Extracted or inferred core intent - the "why" of this plan]

### Intent Propagation Status

| Component               | Intent Clarity          | Issue                 |
| ----------------------- | ----------------------- | --------------------- |
| Plan overview           | [Clear/Partial/Missing] | [Any issues]          |
| Task 1                  | [Clear/Partial/Missing] | [Any issues]          |
| Task 2 sub-agent prompt | [Clear/Partial/Missing] | [Missing WHY context] |
| ...                     | ...                     | ...                   |

### Recommendations for Intent Clarity

1. **[If issues found]** Add explicit intent statement at plan start:

    > "This plan exists to [WHY]. Success means [DEFINITION]. We are NOT trying to [NON-GOALS]."

2. **[For sub-agent prompts]** Include context prefix:
    > "Context: We are [INTENT]. Your task contributes by [HOW THIS TASK SERVES INTENT]."

---

## Specification Coverage

### Original Requirements

> [Numbered list extracted from original user request/specification]

### Traceability Matrix

| # | Original Requirement | Plan Task(s) | Coverage |
|---|---------------------|--------------|----------|
| 1 | [requirement]       | Task 2, 5    | Full     |
| 2 | [requirement]       | Task 3       | Partial  |
| 3 | [requirement]       | —            | Missing  |

### Coverage Summary

- **Full coverage:** X/N requirements
- **Partial coverage:** Y/N requirements
- **Missing coverage:** Z/N requirements (CRITICAL if > 0)
- **Untraced plan tasks:** [list of tasks not linked to any original requirement]

### Coverage Gaps (if any)

For each missing or partial requirement:
- **Requirement #N:** [requirement text]
- **Gap:** [what is not covered]
- **Recommendation:** [specific plan task to add or expand]

---

## Agentic Execution Analysis

### Parallelisability Assessment

| Task Group | Tasks   | Dependencies       | Parallel Potential       |
| ---------- | ------- | ------------------ | ------------------------ |
| Group 1    | 1, 2, 3 | None               | Can run in parallel      |
| Group 2    | 4, 5    | Depends on Group 1 | Sequential after Group 1 |
| Group 3    | 6       | Depends on Group 2 | Sequential               |

### Recommended Execution Topology
```

Topology: [Sequential | Parallel | Tree | Hybrid]

Execution Graph:
┌─────────────────────────────────────────┐
│ Start                                   │
├─────────────────────────────────────────┤
│ Parallel: Tasks 1, 2, 3                │
│ └─> Each spawns verification agent      │
├─────────────────────────────────────────┤
│ Wait: All Group 1 verification complete │
├─────────────────────────────────────────┤
│ Sequential: Tasks 4, 5                  │
│ └─> With iterate-until-verified         │
├─────────────────────────────────────────┤
│ Final: Task 6 (consolidation)           │
└─────────────────────────────────────────┘

```markdown
### Agentic Pattern Recommendations

| Task | Recommended Pattern | Rationale |
|------|-------------------|-----------|
| Task 1 | Sub-agent + Verify | Complex, benefits from dedicated verification |
| Task 2 | Simple execution | Straightforward, no sub-agent needed |
| Task 3 | Iterate-until-verified | Has testable success criteria, should loop |

---

## Critical Issues

### [Issue Title]

- **Reviewer:** [Completeness/Technical/Verification/Risk/Parallelisability]
- **Location:** [Plan section reference]
- **Issue:** [Description of the problem]
- **Impact:** [Why this matters]
- **Recommendation:** [Specific actionable fix]

---

## Important Issues

### [Issue Title]

- **Reviewer:** [Agent name]
- **Location:** [Plan section reference]
- **Issue:** [Description]
- **Recommendation:** [Fix]

---

## Minor Issues

### [Issue Title]

- **Reviewer:** [Agent name]
- **Issue:** [Description]
- **Recommendation:** [Optional improvement]

---

## Devil's Advocate Findings

### [DA] [Issue Title]

- **Severity:** [Critical/Important/Minor]
- **Location:** [Task N / Plan section]
- **Challenge:** [What is being questioned]
- **Risk:** [Why this matters — what could go wrong]
- **Recommendation:** [Alternative approach or mitigation]

_{Or "The Devil's Advocate found no substantive issues — this is a strong signal the plan is robust."}_

---

## Recommendations

### High Priority (Address Before Implementation)

1. **[Recommendation]**
   - Specific change: [what to modify]
   - Location: [where in plan]

### Medium Priority (Address During Implementation)

1. **[Recommendation]**
   - [Details]

### Low Priority (Optional Enhancements)

1. **[Recommendation]**
   - [Details]

---

## Discovered Tasks

Tasks proposed by sub-agents for out-of-scope work:

| ID  | Category | Subject   | Priority | Disposition     |
| --- | -------- | --------- | -------- | --------------- |
| 1   | [Cat]    | [Subject] | High     | Include in plan |
| 2   | [Cat]    | [Subject] | Medium   | Defer to later  |
| 3   | [Cat]    | [Subject] | Low      | Dismissed       |

### Task Details

#### Task 1: [Subject]

-   **Discovered by:** [Agent name]
-   **Context:** [What was being reviewed when discovered]
-   **Issue:** [What was found]
-   **Recommendation:** [Suggested action]
-   **Priority rationale:** [Why this priority]
-   **Disposition:** [Include/Defer/Dismiss with reason]

---

## Next Tasks

1. [ ] Address critical issues
2. [ ] Review important issues
3. [ ] Consider agentic execution recommendations
4. [ ] Re-run `/plan-review --quick` after revisions (optional)
5. [ ] Proceed with `/plan-implementation-review` during execution
```
