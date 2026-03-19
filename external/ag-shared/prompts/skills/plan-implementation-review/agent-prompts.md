# Implementation Review Agent Prompts

Use these prompt templates when launching review agents.

---

## Agent 1: Progress Auditor (Quick + Thorough)

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

---

## Agent 2: Gap Detector (Thorough only)

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

---

## Agent 3: Intent & Quality Validator (Thorough only)

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

---

## Agent 4: Test Coverage Reviewer (Quick: Verification Checker / Thorough: full)

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
