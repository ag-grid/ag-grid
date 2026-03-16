# Plan Implementation Review Output Format

Use this template to generate the final progress report.

---

```markdown
# Plan Implementation Review

## Summary

- **Plan File:** [path/to/plan.md]
- **Review Mode:** [Quick/Thorough]
- **Overall Completion:** XX%
- **Intent Alignment:** [High/Medium/Low] ← Does implementation serve the WHY?
- **Steps Completed:** X/Y
- **Verification Steps Run:** A/B

### Quick Stats

| Metric | Value |
|--------|-------|
| Total Steps | Y |
| Completed | X |
| In Progress | Z |
| Pending | W |
| Blocked | B |

---

## Completion by Section

| Section | Status | Completion | Notes |
|---------|--------|------------|-------|
| [Section 1] | Done | 100% | All steps verified |
| [Section 2] | Partial | 60% | 2 of 5 steps remaining |
| [Section 3] | Pending | 0% | Blocked by Section 2 |

---

## Completed Steps

### [Section Name]

- [x] **Step 1:** [Description]
  - **Evidence:** Commit `abc1234` - "Add feature X"
  - **Files:** `src/feature.ts`, `src/feature.test.ts`
  - **Verified:** Tests pass ✓

- [x] **Step 2:** [Description]
  - **Evidence:** Commits `def5678`, `ghi9012`
  - **Files:** `src/module.ts`
  - **Verified:** Type check pass ✓

---

## In Progress Steps

### [Section Name]

- [ ] **Step 3:** [Description]
  - **Status:** 50% complete
  - **Done:** Basic implementation
  - **Remaining:** Error handling, tests
  - **Files Modified:** `src/partial.ts`

---

## Pending Steps

### [Section Name]

- [ ] **Step 4:** [Description]
  - **Blocker:** None / [blocker description]
  - **Dependencies:** Requires Step 3
  - **Estimated Effort:** [Low/Medium/High]
  - **Priority:** [High/Medium/Low]

---

## Intent Alignment Assessment

### Core Intent
> [The extracted "why" from the original plan]

### Does Implementation Serve the Intent?

| Aspect | Assessment | Notes |
|--------|------------|-------|
| Overall intent achieved | [Yes/Partial/No] | [Explanation] |
| Sub-agent work quality | [Good/Mixed/Poor] | [Did sub-agents understand context?] |
| Technically correct but missing point? | [Yes/No] | [Examples if yes] |

### Intent-Related Concerns

[List any implementations that complete tasks but miss the underlying goal]

---

## Deviations from Plan

### [Deviation Title]

- **Planned:** [What the plan specified]
- **Actual:** [What was actually done]
- **Reason:** [Why the deviation occurred]
- **Intent Impact:** [Serves intent better / Neutral / Drifts from intent]
- **Action Required:** [Yes/No] - [If yes, what action]

---

## Verification Status

| Verification Step | Status | Evidence | Notes |
|-------------------|--------|----------|-------|
| Unit tests | Pass ✓ | `yarn nx test` | 42 tests pass |
| Type check | Pass ✓ | `yarn nx build:types` | No errors |
| Lint | Warning ⚠ | `yarn nx lint` | 2 warnings (non-blocking) |
| Integration tests | Pending | - | Not yet run |

---

## Recommended Next Steps

### High Priority

1. **Complete Step 3** - [Brief description]
   - Finish error handling
   - Add unit tests

### Medium Priority

2. **Run verification** - [Brief description]
   - Execute integration tests

### Low Priority

3. **Documentation** - [Brief description]

---

## Git Activity Summary

### Commits Since Plan Creation

```
abc1234 - Add feature X (2 hours ago)
def5678 - Implement module Y (3 hours ago)
```

### Files Modified

| File | Changes | Related Step |
|------|---------|--------------|
| `src/feature.ts` | +120, -30 | Step 1 |
| `src/module.ts` | +45, -10 | Step 2 |

---

## Discovered Tasks

Tasks proposed by sub-agents for out-of-scope work:

| ID  | Category | Subject   | Priority | Disposition   |
| --- | -------- | --------- | -------- | ------------- |
| 1   | [Cat]    | [Subject] | High     | Address now   |
| 2   | [Cat]    | [Subject] | Medium   | Defer         |

---

## Session Notes

-   **Review Date:** [timestamp]
-   **Branch:** [current branch]
```
