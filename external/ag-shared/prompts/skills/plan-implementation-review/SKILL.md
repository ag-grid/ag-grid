---
targets: ['*']
name: plan-implementation-review
description: 'Review plan execution completeness and identify delivery gaps'
invocable: user-only
---

# Plan Implementation Review Prompt

You are an implementation reviewer for AG Charts. Review how complete plan execution is by tracking progress, identifying gaps, and validating quality.

## Input Requirements

User provides one of:

- Explicit plan file path: `/plan-implementation-review path/to/plan.md`
- Auto-detect from context: `/plan-implementation-review` (looks for recent plans)

Optional flags:

- `--quick` - Fast progress check (2 agents)
- `--thorough` - Comprehensive review (default, 4 agents)

## Execution Phases

### Phase 0: Context Gathering & Mode Selection

1. **Load original plan file:**

    ```bash
    # If explicit path provided, use it
    # Otherwise, check common locations:
    find "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plans node_modules/.cache/plans -name "*.md" -mtime -7 2>/dev/null | head -10
    ```

2. **Determine review mode:**

    | Flag | Mode | Agents | Use Case |
    |------|------|--------|----------|
    | `--quick` | Quick | 2 | Fast progress check |
    | `--thorough` (default) | Thorough | 4 | Comprehensive validation |

3. **Detect git changes since plan creation:**

    ```bash
    # Get plan creation/modification time
    plan_date=$(stat -f %m "$PLAN_FILE" 2>/dev/null || stat -c %Y "$PLAN_FILE")

    # Find commits since plan was created
    git log --oneline --since="@$plan_date" --all

    # Get diff of all changes
    git diff --name-only HEAD~N  # N = number of commits since plan

    # Get detailed changes for each file
    git diff HEAD~N -- path/to/file.ts
    ```

4. **Extract core intent from plan:**

    **Critical:** Understanding intent is essential for assessing implementation quality.
    - What is the core "why" of this plan?
    - What does "done well" look like (not just "done")?
    - What are the non-goals/boundaries?

    This intent guides assessment of whether implementation serves the goal, not just completes tasks.

5. **Identify modified files and their relationship to plan:**

    Cross-reference:
    - Files mentioned in plan → have they been modified?
    - Files modified → are they in the plan?
    - Unexpected changes → drift from plan or drift from intent?

### Phase 1: Implementation Analysis (Parallel Agents)

Launch analysis agents based on mode.

#### Quick Mode (2 agents)

```
┌─────────────────────────────────────────────────────────────┐
│                    QUICK MODE AGENTS                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Progress Auditor                                          │
│    - Maps plan steps to code changes                        │
│    - Calculates completion percentage                       │
│    - Identifies gaps between plan and implementation        │
├─────────────────────────────────────────────────────────────┤
│ 2. Verification Checker                                      │
│    - Test coverage status                                   │
│    - Build status                                           │
│    - Lint/type check status                                 │
└─────────────────────────────────────────────────────────────┘
```

#### Thorough Mode (4 agents)

```
┌─────────────────────────────────────────────────────────────┐
│                   THOROUGH MODE AGENTS                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Progress Auditor                                          │
│    - Maps plan steps to actual code changes                 │
│    - Identifies which steps are complete                    │
│    - Calculates completion percentage per section           │
├─────────────────────────────────────────────────────────────┤
│ 2. Gap Detector                                              │
│    - Identifies planned items not yet implemented           │
│    - Finds partial implementations                          │
│    - Detects missing pieces                                 │
├─────────────────────────────────────────────────────────────┤
│ 3. Intent & Quality Validator (CRITICAL)                     │
│    - Does implementation serve the core INTENT?             │
│    - Is the WHY being achieved, not just the WHAT?          │
│    - Validates approach aligns with plan goals              │
│    - Identifies deviations that drift from intent           │
├─────────────────────────────────────────────────────────────┤
│ 4. Test Coverage Reviewer                                    │
│    - Verifies test/verification steps completed             │
│    - Checks test pass/fail status                           │
│    - Identifies untested changes                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Discovered Work Protocol

Sub-agents executing review tasks may discover work outside their immediate scope.
This protocol ensures discovered work is captured without derailing focused review.

### When to Create a Task

Create a task using `TaskCreate` when you discover something:

-   **Significant**: Could affect implementation success or requires dedicated investigation
-   **Out of scope**: Not part of your current review focus area
-   **Actionable**: Clear enough that another agent could pick it up

Do NOT create tasks for:

-   Minor observations (include in your findings instead)
-   Things you can quickly address within your scope
-   Vague concerns without actionable next steps

### How to Create a Task

Use `TaskCreate` with:

| Field         | Content                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| `subject`     | `[Category] Brief description` (e.g., "[Gap] Missing error handling for timeout") |
| `description` | What you discovered, why it matters, suggested approach                           |
| `activeForm`  | Present tense action (e.g., "Investigating timeout handling")                     |

### After Creating a Task

1. Note in your findings that you created a follow-up task
2. Continue with your focused review - don't investigate further
3. The orchestrating agent will triage discovered tasks

### Example

**Scenario**: You're the Progress Auditor, tracking completion status.
You notice a quality concern with test coverage.

**Action**:

```javascript
TaskCreate({
    subject: '[Quality] Insufficient test coverage for edge cases',
    description:
        'While auditing progress, I noticed Step 3 is marked complete but the tests only cover happy path scenarios. The Quality Validator should check if edge cases are adequately tested.',
    activeForm: 'Investigating test coverage gaps',
});
```

**Then**: Continue your Progress Audit without investigating the quality issue.

---

**Agent Launch Pattern:**

```javascript
// Launch agents in parallel using Task tool
Task({
    subagent_type: 'general-purpose',
    description: 'Progress audit',
    prompt: `Audit the implementation progress against this plan.

    ## Your Focus
    Track completion status and map code changes to plan steps.

    ## Discovered Work Protocol
    If you discover significant issues OUTSIDE your focus area:
    - Use TaskCreate to propose a follow-up task
    - Include category, description, and suggested approach
    - Continue with your focused review - don't investigate further
    - Only create tasks for significant discoveries, not minor observations

    ## Original Plan:
    ${planContent}

    ## Git Changes Since Plan:
    ${gitChanges}

    ## Modified Files:
    ${modifiedFiles}

    ## For each plan step, determine:
    1. Status: Done / Partial / Pending / Not Started
    2. Evidence: Commits, file changes, or tests that demonstrate completion
    3. Notes: Any observations about the implementation

    ## Return:
    - Completion percentage per section
    - List of completed steps with evidence
    - List of pending steps with blockers (if any)

    **Discovered Work:**
    If you found significant issues outside your focus area, note that you
    created a follow-up task rather than investigating.`,
});
```
```

### Phase 2: Cross-Reference Analysis

Correlate plan steps with implementation evidence.

1. **Map to Git Commits:**

    ```bash
    # For each plan step, find related commits
    git log --oneline --grep="step keyword" --all
    git log --oneline -- "affected/file/path.ts"
    ```

2. **Map to Modified Files:**

    For each step in the plan:
    - Expected files to modify
    - Actually modified files
    - Alignment check

3. **Check Test Results (if available):**

    ```bash
    # Check if tests pass
    yarn nx test ag-charts-community --testPathPattern="relevant-test"

    # Check build status
    yarn nx build:types ag-charts-community
    ```

4. **Check Build Status (if available):**

    ```bash
    # Verify types compile
    yarn nx build:types ag-charts-community ag-charts-enterprise

    # Verify lint passes
    yarn nx lint ag-charts-community ag-charts-enterprise
    ```

### Phase 3: Report Generation

Generate comprehensive progress report.

1. **Calculate completion metrics:**

    - Overall completion percentage
    - Per-section completion
    - Per-step status

2. **Identify remaining work:**

    - Pending steps with priority
    - Blockers if any
    - Estimated remaining effort

3. **Document deviations:**

    - What was planned vs what was done
    - Unexpected changes
    - Scope changes

4. **Provide actionable next steps:**

    - Prioritised list of remaining work
    - Recommended order of completion
    - Dependencies to unblock

5. **Aggregate discovered tasks:**

    - Call `TaskList` to retrieve tasks created by sub-agents
    - For each task:
        - Check if it duplicates a finding (consolidate if so)
        - Assess priority based on implementation impact
        - Determine if it blocks completion
        - Decide: address now, defer, or dismiss
    - Include task summary in the output report

---

## Output Format

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

- [ ] **Step 5:** [Description]
  - **Blocker:** Waiting for API decision
  - **Dependencies:** None
  - **Estimated Effort:** Medium
  - **Priority:** High

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

### Example: Different API Approach

- **Planned:** Use callback-based API for events
- **Actual:** Implemented with async/await pattern
- **Reason:** Better ergonomics discovered during implementation
- **Intent Impact:** Serves intent better - cleaner DX aligns with user experience goal
- **Action Required:** No - deviation is an improvement

---

## Verification Status

| Verification Step | Status | Evidence | Notes |
|-------------------|--------|----------|-------|
| Unit tests | Pass ✓ | `yarn nx test` | 42 tests pass |
| Type check | Pass ✓ | `yarn nx build:types` | No errors |
| Lint | Warning ⚠ | `yarn nx lint` | 2 warnings (non-blocking) |
| Integration tests | Pending | - | Not yet run |
| Visual regression | Pending | - | Requires snapshot update |

---

## Recommended Next Steps

### High Priority

1. **Complete Step 3** - [Brief description]
   - Finish error handling
   - Add unit tests
   - Files: `src/partial.ts`

2. **Unblock Step 5** - [Brief description]
   - Resolve API decision blocker
   - Document decision in ADR

### Medium Priority

3. **Run verification** - [Brief description]
   - Execute integration tests
   - Update visual snapshots

### Low Priority

4. **Documentation** - [Brief description]
   - Update README
   - Add inline comments

---

## Git Activity Summary

### Commits Since Plan Creation

```
abc1234 - Add feature X (2 hours ago)
def5678 - Implement module Y (3 hours ago)
ghi9012 - Fix edge case in Z (4 hours ago)
```

### Files Modified

| File | Changes | Related Step |
|------|---------|--------------|
| `src/feature.ts` | +120, -30 | Step 1 |
| `src/module.ts` | +45, -10 | Step 2 |
| `src/partial.ts` | +60, -0 | Step 3 (in progress) |

---

## Session Notes

-   **Review Date:** [timestamp]
-   **Branch:** [current branch]
-   **Reviewer:** AI Assistant

### Observations

-   [Any notable observations about the implementation]
-   [Quality notes]
-   [Suggestions for improvement]

---

## Discovered Tasks

Tasks proposed by sub-agents for out-of-scope work:

| ID  | Category | Subject   | Priority | Disposition   |
| --- | -------- | --------- | -------- | ------------- |
| 1   | [Cat]    | [Subject] | High     | Address now   |
| 2   | [Cat]    | [Subject] | Medium   | Defer         |
| 3   | [Cat]    | [Subject] | Low      | Dismissed     |

### Task Details

#### Task 1: [Subject]

-   **Discovered by:** [Agent name]
-   **Context:** [What was being reviewed when discovered]
-   **Issue:** [What was found]
-   **Recommendation:** [Suggested action]
-   **Priority rationale:** [Why this priority]
-   **Disposition:** [Address now/Defer/Dismiss with reason]
```

---

## Review Agent Prompts

### Progress Auditor Prompt

```markdown
Audit the implementation progress against the original plan.

**Original Plan:**
${PLAN_CONTENT}

**Git Log (commits since plan):**
${GIT_LOG}

**Modified Files:**
${MODIFIED_FILES}

**Task:**
For each step in the plan, determine:
1. Status: Done / Partial / Pending / Not Started
2. Evidence: What commits or file changes demonstrate completion
3. Completion %: For partial steps, estimate percentage

**Return:**

-   Overall completion percentage
-   Per-section completion breakdown
-   List of completed steps with evidence
-   List of pending steps
-   Any blockers identified

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Gap Detector Prompt

```markdown
Identify gaps between the plan and implementation.

**Original Plan:**
${PLAN_CONTENT}

**Implementation Evidence:**
${IMPLEMENTATION_SUMMARY}

**Task:**
Find:
1. Planned items not yet started
2. Partially implemented items (what's missing)
3. Planned features that were skipped
4. Implicit requirements that weren't addressed

**Return:**

-   List of gaps with severity (Critical/Important/Minor)
-   For each gap: what's missing and why it matters
-   Suggested priority for addressing gaps

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Intent & Quality Validator Prompt

```markdown
Validate that the implementation serves the plan's INTENT, not just completes its tasks.

**Original Plan:**
${PLAN_CONTENT}

**Core Intent (extracted from plan):**
${CORE_INTENT}

**Implementation (git diff or file contents):**
${IMPLEMENTATION_DETAILS}

**Task:**
Check:
1. **Intent Alignment (CRITICAL):**
   - Does the implementation achieve the WHY, not just the WHAT?
   - Would the original requester say "yes, this is what I meant"?
   - Are there technically-correct-but-missing-the-point implementations?
2. **Goal Achievement:**
   - Does the implementation achieve the plan's stated goals?
   - Are there deviations that better serve the intent? (acceptable)
   - Are there deviations that drift from the intent? (problematic)
3. **Quality:**
   - Is the quality appropriate (tests, error handling, docs)?
   - Are there shortcuts that undermine the intent?
4. **Sub-agent Work (if applicable):**
   - Did sub-agents understand the intent?
   - Are there signs of sub-agents completing tasks without understanding context?

**Return:**

-   **Intent alignment:** High/Medium/Low with explanation
-   Alignment assessment: High/Medium/Low
-   List of deviations:
    -   Intent-serving deviations (good): [list]
    -   Intent-drifting deviations (concerning): [list]
-   Quality concerns if any
-   Recommendations for improvements

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Test Coverage Reviewer Prompt

```markdown
Review test coverage and verification status.

**Plan's Verification Requirements:**
${VERIFICATION_STEPS}

**Test Files Changed:**
${TEST_FILES}

**Test Run Results (if available):**
${TEST_RESULTS}

**Task:**
Check:
1. Which verification steps from the plan have been completed?
2. Are there tests for all new/changed functionality?
3. Do tests pass?
4. What verification is still pending?

**Return:**

-   Verification completion status per step
-   Test coverage assessment
-   Pass/fail status for completed tests
-   List of pending verification with priority

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

---

## Usage Examples

```bash
# Thorough review (default)
/plan-implementation-review

# Quick progress check
/plan-implementation-review --quick

# Explicit plan file
/plan-implementation-review path/to/plan.md

# Quick check with explicit path
/plan-implementation-review --quick path/to/plan.md
```

---

## Integration with Other Commands

- **Before implementation:** Run `/plan-review` to validate the plan
- **During implementation:** Run `/plan-implementation-review` periodically
- **After implementation:** Run full test suite and documentation review

---

## Cache Location

Review results are cached for tracking progress over time:

```
node_modules/.cache/plan-implementation-reviews/
├── {plan-name}-{timestamp}.json    # Raw agent findings
├── {plan-name}-progress.json       # Progress tracking over time
├── {plan-name}-report.md           # Generated report
└── metadata.json                   # Review session metadata
```

---

## Workflow Integration

### During Active Development

```bash
# Initial plan review
/plan-review path/to/plan.md

# ... work on implementation ...

# Quick progress check
/plan-implementation-review --quick

# ... continue implementation ...

# Comprehensive check before PR
/plan-implementation-review --thorough
```

### For PR Review

```bash
# Verify implementation completeness
/plan-implementation-review path/to/plan.md

# Check any deviations are documented
# Ensure verification steps are complete
```
