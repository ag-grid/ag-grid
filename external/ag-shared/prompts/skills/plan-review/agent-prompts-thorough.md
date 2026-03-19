# Thorough Mode Agent Prompts

Use these prompt templates when launching review agents in thorough mode (default).

---

## Agent 1: Intent Reviewer (CRITICAL — runs first)

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

---

## Agent 2: Completeness & Specification Coverage Reviewer

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

---

## Agent 3: Technical Reviewer

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

---

## Agent 4: Verification Reviewer

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

---

## Agent 5: Risk Reviewer

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

---

## Agent 6: Parallelisability Analyser

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

## Agent 7: Devil's Advocate (Default)

Runs by default unless `--no-devils-advocate` is passed. Read the full agent instructions from `agents/devils-advocate.md`.

```markdown
You are a Devil's Advocate reviewer for this implementation plan. The standard review agents have
already covered intent, completeness, technical correctness, verification, risk, and parallelisability.
Your job is to challenge, question, and stress-test what they missed.

Read and follow the full instructions in the co-located `agents/devils-advocate.md` file for your
adversarial mandate and focus areas.

**Original Requirements (source of truth):**
${ORIGINAL_REQUIREMENTS}

**Plan:**
${PLAN_CONTENT}

**Standard Review Findings (for context — challenge these too):**
${STANDARD_FINDINGS}

**Your adversarial focus:**

1. **Challenge the approach:** Is this the right plan? Is there a fundamentally simpler way?
2. **Stress-test assumptions:** What if key assumptions are wrong? What breaks?
3. **Question task necessity:** For each task — if removed, would the plan still succeed?
4. **Probe execution gaps:** What goes wrong during execution that the plan ignores?
5. **Challenge the ordering:** Should risky tasks run first to fail fast?
6. **Play the adversary:** What is the single most likely point of failure?

**Return findings prefixed with [DA] using severity levels:**

-   CRITICAL: [plan will likely fail or miss the goal]
-   IMPORTANT: [significant risk the standard review missed]
-   MINOR: [worthwhile challenge but not blocking]

**Important:** If the plan is solid, say so. Do not manufacture findings.
```
