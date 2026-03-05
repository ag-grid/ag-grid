---
targets: ['*']
name: plan-review
description: 'Review plans for completeness, correctness, and verifiability'
invocable: user-only
---

# Plan Review Prompt

You are a plan reviewer. Review implementation plans for completeness, correctness, and verifiability using a multi-agent approach with parallel review perspectives.

## Input Requirements

User provides one of:

-   Explicit plan file path: `/plan-review path/to/plan.md`
-   Auto-detect from context: `/plan-review` (looks for recent plans)

Optional flags:

-   `--quick` - Fast review with fewer agents (2-3 vs 5-6)
-   `--thorough` - Comprehensive review (default)
-   `--external` - Include external tools (Codex/Gemini) if available

## Execution Phases

### Phase 0: Plan Detection & Mode Selection

1. **Detect plan file:**

    ```bash
    # If explicit path provided, use it
    # Otherwise, check common locations:
    # 1. ${CLAUDE_CONFIG_DIR:-~/.claude}/plans/ (recent files)
    # 2. Current conversation context
    # 3. node_modules/.cache/plans/

    # List recent plan files
    find "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plans node_modules/.cache/plans -name "*.md" -mtime -7 2>/dev/null | head -10
    ```

2. **Determine review mode:**

    | Flag                   | Mode     | Agents | Use Case                            |
    | ---------------------- | -------- | ------ | ----------------------------------- |
    | `--quick`              | Quick    | 2-3    | Fast feedback, simple plans         |
    | `--thorough` (default) | Thorough | 5-6    | Comprehensive review, complex plans |

3. **Extract original request/specification:**

    **Critical:** The original user request is the source of truth for coverage verification.

    - Search conversation context or plan metadata for the original user request or linked specification
    - If the plan embeds or references the original request, extract it
    - Otherwise, check the conversation history that preceded the plan
    - Decompose the original request into a **numbered requirements checklist** — discrete, verifiable asks
    - Each requirement should be atomic (one testable assertion per item)

    Store as `${ORIGINAL_REQUIREMENTS}` for use by review agents.

    If no original request can be located:
    - Flag as IMPORTANT: "Plan does not embed or reference the original request/specification"
    - Recommend the plan include a **Source Request** section quoting or summarising the original ask
    - **Fallback:** Derive `${ORIGINAL_REQUIREMENTS}` from the plan's stated goals/objectives instead — decompose them into the same numbered checklist format. Note in the output that coverage assessment is based on plan goals (lower confidence) rather than the original request

4. **Extract and validate intent:**

    **Critical:** Intent clarity is vital for successful execution. Extract:

    - **Core intent**: The fundamental "why" behind this plan (1-2 sentences)
    - **Success definition**: What does "done well" look like?
    - **Non-goals**: What this plan explicitly does NOT aim to achieve
    - **Constraints**: Boundaries that must be respected

    If intent is unclear or missing from the plan, flag as CRITICAL issue.

    **Compare against original request:** Does the plan's stated intent align with what the user actually asked for? Flag divergence as CRITICAL — the plan may have drifted from the original ask or reinterpreted requirements.

5. **Parse plan structure:**

    Extract from the plan file:

    - **Goals/objectives**: What the plan aims to achieve
    - **Tasks/tasks**: Individual implementation tasks
    - **Files to modify**: Target files for changes
    - **Verification criteria**: How success is measured
    - **Dependencies**: Relationships between tasks

6. **Build task dependency graph:**

    Analyse task dependencies:

    - Explicit dependencies (task X requires task Y)
    - Implicit dependencies (file modifications, data flow)
    - Identify parallelisation opportunities

### Phase 1: Parallel Review Agents

Launch specialised review agents based on mode.

#### Quick Mode (3 agents)

```
┌─────────────────────────────────────────────────────────────┐
│                    QUICK MODE AGENTS                         │
├─────────────────────────────────────────────────────────────┤
│ 1. Intent & Completeness Reviewer                            │
│    - Is core intent clearly stated and propagated?          │
│    - Does plan intent match the original request intent?    │
│    - Are all original requirements covered by plan tasks?   │
│    - Are there original requirements with no plan task?     │
│    - Would sub-agents understand the WHY?                   │
│    - Edge cases: What could go wrong?                       │
├─────────────────────────────────────────────────────────────┤
│ 2. Verification Reviewer                                     │
│    - Testability: Can each task be verified?                │
│    - Success criteria: Are they measurable?                 │
│    - Evidence: How will completion be demonstrated?         │
├─────────────────────────────────────────────────────────────┤
│ 3. Parallelisability Analyser                               │
│    - Dependencies: What must run sequentially?              │
│    - Concurrency: What can run in parallel?                 │
│    - Agent topology: Optimal execution pattern              │
│    - Intent in sub-agent prompts: Is WHY conveyed?          │
└─────────────────────────────────────────────────────────────┘
```

#### Thorough Mode (6-7 agents)

```
┌─────────────────────────────────────────────────────────────┐
│                   THOROUGH MODE AGENTS                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Intent Reviewer (CRITICAL - runs first)                   │
│    - Is core intent clearly stated?                         │
│    - Does each task serve the intent?                       │
│    - Are sub-agent prompts conveying intent?                │
│    - Would a sub-agent understand WHY, not just WHAT?       │
├─────────────────────────────────────────────────────────────┤
│ 2. Completeness & Specification Coverage Reviewer              │
│    - Trace each original requirement → plan task(s)        │
│    - Identify uncovered or partially covered requirements   │
│    - Identify plan tasks with no traceability (scope creep) │
│    - Missing requirements and unaddressed edge cases        │
│    - Gaps in coverage                                       │
├─────────────────────────────────────────────────────────────┤
│ 3. Technical Reviewer                                        │
│    - Approach validation against codebase                   │
│    - API correctness                                        │
│    - Architecture alignment                                 │
├─────────────────────────────────────────────────────────────┤
│ 4. Verification Reviewer                                     │
│    - Testability of each task                               │
│    - Success criteria clarity                               │
│    - Evidence requirements                                  │
├─────────────────────────────────────────────────────────────┤
│ 5. Risk Reviewer                                             │
│    - Potential failure modes                                │
│    - Rollback strategies                                    │
│    - Impact assessment                                      │
├─────────────────────────────────────────────────────────────┤
│ 6. Parallelisability Analyser                               │
│    - Dependency detection                                   │
│    - Concurrency analysis                                   │
│    - Agent topology recommendation                          │
│    - Intent propagation in sub-agent prompts                │
├─────────────────────────────────────────────────────────────┤
│ 7. External Reviewer (optional, --external flag)            │
│    - Codex/Gemini independent perspective                   │
│    - Cross-validation of findings                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Discovered Work Protocol

Sub-agents executing review tasks may discover work outside their immediate scope.
This protocol ensures discovered work is captured without derailing focused review.

### When to Create a Task

Create a task using `TaskCreate` when you discover something:

-   **Significant**: Could affect plan success or requires dedicated investigation
-   **Out of scope**: Not part of your current review focus area
-   **Actionable**: Clear enough that another agent could pick it up

Do NOT create tasks for:

-   Minor observations (include in your findings instead)
-   Things you can quickly address within your scope
-   Vague concerns without actionable next steps

### How to Create a Task

Use `TaskCreate` with:

| Field         | Content                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| `subject`     | `[Category] Brief description` (e.g., "[Edge Case] Handle null input in parser") |
| `description` | What you discovered, why it matters, suggested approach                        |
| `activeForm`  | Present tense action (e.g., "Investigating null handling")                     |

### After Creating a Task

1. Note in your findings that you created a follow-up task
2. Continue with your focused review - don't investigate further
3. The orchestrating agent will triage discovered tasks

### Example

**Scenario**: You're the Technical Reviewer, focused on API correctness.
You notice a missing edge case (a Completeness concern).

**Action**:

```javascript
TaskCreate({
    subject: '[Completeness] Missing validation for empty array input',
    description:
        'While reviewing the parser API, I noticed there is no validation for empty array inputs. This could cause undefined behavior in the aggregation step. The Completeness review should verify this edge case is covered.',
    activeForm: 'Investigating empty array validation',
});
```

**Then**: Continue your Technical Review without investigating the completeness issue.

---

**Agent Launch Pattern:**

```javascript
// Launch agents in parallel using Task tool
Task({
    subagent_type: 'general-purpose',
    description: 'Completeness & specification coverage review',
    prompt: `Review this plan for completeness and specification coverage.

    ## Your Focus
    Verify the plan fully covers the original request. Check for missing
    requirements, uncovered specifications, edge cases, and gaps.

    ## Discovered Work Protocol
    If you discover significant issues OUTSIDE your focus area:
    - Use TaskCreate to propose a follow-up task
    - Include category, description, and suggested approach
    - Continue with your focused review - don't investigate further
    - Only create tasks for significant discoveries, not minor observations

    ## Original Requirements (source of truth)
    ${ORIGINAL_REQUIREMENTS}

    ## Plan Content
    ${planContent}

    ## Check for:
    1. For EACH original requirement, which plan task(s) address it? (build traceability)
    2. Are there original requirements with NO corresponding plan task? (CRITICAL gap)
    3. Are there original requirements only PARTIALLY addressed? (IMPORTANT gap)
    4. Are there plan tasks that don't trace to any original requirement? (potential scope creep)
    5. Are there intermediate tasks that would be needed but aren't listed?
    6. Are edge cases and error scenarios considered?

    ## Return findings as:
    - CRITICAL: [original requirements with no plan coverage]
    - IMPORTANT: [partially covered requirements, significant gaps]
    - MINOR: [nice-to-have additions, minor scope creep]

    ## Also return:
    A traceability table mapping each original requirement to plan task(s):
    | # | Original Requirement | Plan Task(s) | Coverage (Full/Partial/Missing) |

    **Discovered Work:**
    If you found significant issues outside your focus area, note that you
    created a follow-up task rather than investigating.`,
});
```

### Phase 2: Agentic Execution Analysis

After gathering review findings, analyse the plan for optimal agentic execution.

#### Agentic Patterns to Assess

| Pattern                    | Description                          | When to Recommend                 |
| -------------------------- | ------------------------------------ | --------------------------------- |
| **Simple Execution**       | Main agent executes directly         | Simple, low-risk tasks            |
| **Sub-agent Delegation**   | Launch dedicated sub-agent           | Complex tasks requiring focus     |
| **Sub-agent + Verify**     | Implementation + verification agent  | Tasks with testable outcomes      |
| **Iterate-until-verified** | Loop: implement → verify → fix       | Tasks with clear success criteria |
| **Parallel Fan-out**       | Launch N agents for independent work | Tasks with no dependencies        |
| **Orchestrated Pipeline**  | Chained agents with handoffs         | Sequential dependent tasks        |
| **Tree Execution**         | Parent spawns children, aggregates   | Divide-and-conquer tasks          |

#### Dependency Detection

Analyse for:

1. **File-level dependencies:**

    - Does task B modify files created by task A?
    - Are there shared files that require sequential access?

2. **Data-flow dependencies:**

    - Does task B need outputs from task A?
    - Are there intermediate results to pass between tasks?

3. **Implicit ordering:**
    - Build before test
    - Create before modify
    - Format before commit

#### Execution Graph Generation

```
Example output:

Task Dependencies:
  Task 1: None (can start immediately)
  Task 2: None (can start immediately)
  Task 3: Depends on Task 1, 2
  Task 4: Depends on Task 3
  Task 5: None (independent)

Parallel Groups:
  Group 1 (parallel): Tasks 1, 2, 5
  Group 2 (sequential after Group 1): Task 3
  Group 3 (sequential after Group 2): Task 4

Recommended Topology: Hybrid (parallel + sequential)
```

### Phase 3: Synthesis

Aggregate findings from all review agents.

1. **Categorise by severity:**

    - **Critical**: Blocks implementation, must fix before proceeding
    - **Important**: Significant issues that should be addressed
    - **Minor**: Nice-to-have improvements

2. **Consolidate duplicates:**

    - Merge similar findings from different reviewers
    - Note when multiple reviewers flagged the same issue

3. **Generate actionable recommendations:**

    - Specific changes to make
    - Priority order for addressing issues
    - Suggested plan revisions

4. **Build specification coverage analysis:**

    - Aggregate traceability findings from the Completeness & Specification Coverage Reviewer
    - Build the traceability matrix mapping each original requirement → plan task(s)
    - Calculate coverage metrics (full/partial/missing counts)
    - Flag any uncovered original requirements as CRITICAL blocking issues
    - Identify untraced plan tasks as potential scope creep
    - Include coverage summary in the output report

5. **Aggregate discovered tasks:**

    - Call `TaskList` to retrieve tasks created by sub-agents
    - For each task:
        - Check if it duplicates a finding (consolidate if so)
        - Assess priority based on plan impact
        - Determine if it blocks implementation
        - Decide: include in plan, defer, or dismiss
    - Include task summary in the output report

### Phase 4: Interactive Resolution (Optional)

If issues found, present to user for iterative refinement:

1. Show findings summary
2. Offer to help revise specific sections
3. Re-run targeted review after changes

---

## Output Format

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
│ Start │
├─────────────────────────────────────────┤
│ Parallel: Tasks 1, 2, 3 │
│ └─> Each spawns verification agent │
├─────────────────────────────────────────┤
│ Wait: All Group 1 verification complete │
├─────────────────────────────────────────┤
│ Sequential: Tasks 4, 5 │
│ └─> With iterate-until-verified │
├─────────────────────────────────────────┤
│ Final: Task 6 (consolidation) │
└─────────────────────────────────────────┘

```

### Agentic Pattern Recommendations

| Task | Recommended Pattern | Rationale |
|------|-------------------|-----------|
| Task 1 | Sub-agent + Verify | Complex, benefits from dedicated verification |
| Task 2 | Simple execution | Straightforward, no sub-agent needed |
| Task 3 | Iterate-until-verified | Has testable success criteria, should loop |
| Task 4 | Parallel Fan-out | Multiple independent sub-tasks |
| Task 5 | Orchestrated Pipeline | Sequential dependent operations |

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

---

## External Tool Integration

### Codex Integration (if available and --external flag)

```bash
# Check if codex CLI available
if command -v codex &> /dev/null; then
    codex --approval-mode full-auto "Review this implementation plan for technical correctness and completeness. Identify any gaps, risks, or issues:

${PLAN_CONTENT}

Focus on:
1. Technical feasibility
2. Missing tasks
3. Potential risks
4. Verification gaps"
fi
```

### Gemini Integration (if available and --external flag)

```bash
# Check if gemini CLI available
if command -v gemini &> /dev/null; then
    gemini "Analyse this implementation plan for gaps and risks. Provide an independent review:

${PLAN_CONTENT}

Consider:
1. Are all requirements addressed?
2. What could go wrong?
3. How will success be verified?"
fi
```

**Fallback:** If external tools unavailable, use additional Claude sub-agents with different review personas.

---

## Review Agent Prompts

### Intent & Completeness Reviewer Prompt (Quick Mode)

```markdown
Review this plan for intent clarity, completeness, and specification coverage. This is a combined
review for quick mode — cover both intent propagation AND original request coverage.

**Original Requirements (source of truth):**
${ORIGINAL_REQUIREMENTS}

**Plan:**
${PLAN_CONTENT}

**Check for:**

1. **Intent:** Is there a clear statement of WHY this plan exists? Does each task connect to the core intent?
2. **Sub-agent prompts:** Would sub-agents understand the broader context and WHY?
3. **Specification coverage:** For EACH original requirement, which plan task(s) address it?
   - Flag requirements with NO plan coverage as CRITICAL
   - Flag requirements with only PARTIAL coverage as IMPORTANT
   - Flag plan tasks that don't trace to any original requirement as MINOR (scope creep)
4. **Edge cases:** Are error scenarios and boundary conditions considered?
5. **Non-goals:** Are boundaries clear so agents don't over-solve?

**Return findings as:**

-   CRITICAL: [uncovered requirements; intent missing or would cause misunderstanding]
-   IMPORTANT: [partially covered requirements; intent unclear]
-   MINOR: [scope creep; intent improvements]

**Also return a traceability table:**

| # | Original Requirement | Plan Task(s) | Coverage |
|---|---------------------|--------------|----------|
| 1 | [requirement text]  | [task refs]  | Full/Partial/Missing |

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Intent Reviewer Prompt (Thorough Mode)

```markdown
Review this plan for intent clarity and propagation. Your goal is to ensure the "why" is understood and conveyed throughout.

**Plan:**
${PLAN_CONTENT}

**Check for:**

1. **Intent Statement:** Is there a clear, concise statement of WHY this plan exists? (Not just what it does, but why it matters)
2. **Intent in Tasks:** Does each task connect back to the core intent? Can an implementer understand why each task is necessary?
3. **Sub-agent Prompts:** If the plan includes agentic patterns or sub-agent delegation:
    - Do sub-agent prompts include the core intent?
    - Would a sub-agent understand the broader context?
    - Is there enough "why" for the sub-agent to make good judgement calls?
4. **Success Definition:** Is "done well" defined in terms of intent, not just task completion?
5. **Non-goals:** Are boundaries clear so agents don't over-solve or drift from intent?

**Return findings as:**

-   CRITICAL: [intent missing or would cause sub-agents to misunderstand the goal]
-   IMPORTANT: [intent unclear or inconsistently applied]
-   MINOR: [intent improvements for clarity]

For each finding, provide:

-   What is missing or unclear
-   Example of how this could cause execution to drift
-   Suggested improvement with specific wording

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Completeness & Specification Coverage Reviewer Prompt

```markdown
Review this plan for completeness and specification coverage. Your primary goal is to verify
the plan fully addresses the original request, and your secondary goal is to identify missing elements.

**Original Requirements (source of truth):**
${ORIGINAL_REQUIREMENTS}

**Plan:**
${PLAN_CONTENT}

**Check for:**

1. **Specification coverage (PRIMARY):**
   - For EACH original requirement, identify which plan task(s) address it
   - Flag requirements with NO plan coverage as CRITICAL
   - Flag requirements with only PARTIAL coverage as IMPORTANT
   - Flag plan tasks that don't trace to any original requirement as MINOR (scope creep)
2. Are there intermediate tasks that would be needed but aren't listed?
3. Are edge cases and error scenarios considered?
4. Are there implicit assumptions that should be made explicit?
5. Does the plan cover cleanup/rollback if something fails?

**Return findings as:**

-   CRITICAL: [original requirements with no plan coverage; missing essential elements]
-   IMPORTANT: [partially covered requirements; significant gaps]
-   MINOR: [nice-to-have additions; untraced plan tasks]

For each finding, provide:

-   What is missing or uncovered
-   Which original requirement is affected (by number)
-   Why it matters
-   Suggested addition

**Also return a traceability table:**

| # | Original Requirement | Plan Task(s) | Coverage |
|---|---------------------|--------------|----------|
| 1 | [requirement text]  | [task refs]  | Full/Partial/Missing |

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Technical Reviewer Prompt

```markdown
Review this plan for technical correctness. Your goal is to validate the approach.

**Plan:**
${PLAN_CONTENT}

**Check for:**

1. Is the technical approach sound for this codebase?
2. Are the APIs/patterns referenced correct?
3. Does this align with existing architecture?
4. Are there better approaches that should be considered?
5. Are there technical risks or constraints not addressed?

**Return findings as:**

-   CRITICAL: [fundamental technical errors]
-   IMPORTANT: [significant technical concerns]
-   MINOR: [alternative approaches worth considering]

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Verification Reviewer Prompt

```markdown
Review this plan for verifiability. Your goal is to ensure each task can be validated.

**Plan:**
${PLAN_CONTENT}

**Check for:**

1. Does each task have clear success criteria?
2. Can each task be independently verified?
3. Are there automated tests that will validate the changes?
4. How will we know when the plan is complete?
5. Are there observable outcomes for each task?

**Return findings as:**

-   CRITICAL: [tasks that cannot be verified]
-   IMPORTANT: [weak or unclear verification]
-   MINOR: [verification improvements]

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Risk Reviewer Prompt

```markdown
Review this plan for risks and failure modes. Your goal is to identify what could go wrong.

**Plan:**
${PLAN_CONTENT}

**Check for:**

1. What are the potential failure modes?
2. What happens if a task fails partway through?
3. Are there rollback strategies?
4. What are the dependencies that could break?
5. Are there timing or ordering risks?

**Return findings as:**

-   CRITICAL: [high-impact risks with no mitigation]
-   IMPORTANT: [significant risks that need addressing]
-   MINOR: [low-impact risks to be aware of]

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

### Parallelisability Analyser Prompt

```markdown
Analyse this plan for agentic execution optimisation. Your goal is to identify the optimal execution topology AND ensure intent propagates to all sub-agents.

**Plan:**
${PLAN_CONTENT}

**Analyse:**

1. **Dependencies:** Which tasks depend on other tasks?
2. **Parallelisation:** Which tasks can run concurrently?
3. **Agent patterns:** What execution pattern suits each task?

    - Simple execution (main agent)
    - Sub-agent delegation
    - Sub-agent + verification
    - Iterate-until-verified
    - Parallel fan-out
    - Orchestrated pipeline

4. **Intent Propagation (CRITICAL):**
   For each task that involves sub-agent delegation:
    - Does the proposed sub-agent prompt include the core intent?
    - Would the sub-agent understand WHY this task matters?
    - Is there enough context for the sub-agent to make good decisions?
    - Flag any prompts that only describe WHAT without WHY

**Return:**

1. Dependency graph (which tasks must complete before others)
2. Parallel groups (tasks that can run concurrently)
3. Recommended pattern for each task with rationale
4. Overall topology recommendation (Sequential/Parallel/Tree/Hybrid)
5. Estimated parallelisation potential (percentage)
6. **Intent propagation assessment:** For each sub-agent task, rate intent clarity (Clear/Partial/Missing) and suggest improvements

**Discovered Work:**

If you find significant issues outside your focus area, use TaskCreate to propose
a follow-up task rather than investigating. Note in your findings that you
created a task, then continue with your focused review.
```

---

## Usage Examples

```bash
# Thorough review (default)
/plan-review

# Quick review for faster feedback
/plan-review --quick

# Explicit plan file
/plan-review path/to/plan.md

# Quick review with explicit path
/plan-review --quick path/to/plan.md

# Include external tools if available
/plan-review --external

# Full options
/plan-review --thorough --external path/to/complex-plan.md
```

---

## Integration with Other Commands

-   **Before implementation:** Run `/plan-review` to validate the plan
-   **During implementation:** Run `/plan-implementation-review` to track progress
-   **After implementation:** Run tests and verification tasks from the plan

---

## Cache Location

Review results are cached for resumability:

```
node_modules/.cache/plan-reviews/
├── {plan-name}-{timestamp}.json    # Raw agent findings
├── {plan-name}-report.md           # Generated report
└── metadata.json                   # Review session metadata
```
