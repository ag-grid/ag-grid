# Quick Mode Agent Prompts

Use these prompt templates when launching review agents in quick mode (--quick).

---

## Agent 1: Intent & Completeness Reviewer

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

---

## Agent 2: Verification Reviewer

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

## Agent 3: Parallelisability Analyser

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

## Agent 4: Devil's Advocate (Default)

Runs by default unless `--no-devils-advocate` is passed. Read the full agent instructions from `agents/devils-advocate.md`.

```markdown
You are a Devil's Advocate reviewer for this implementation plan. The standard review agents have
already covered intent, completeness, verification, and parallelisability. Your job is to challenge,
question, and stress-test what they missed.

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

---

## Launch Pattern

```javascript
// Launch all 3-4 agents in parallel using Agent tool
Agent({
    subagent_type: 'general-purpose',
    description: 'Intent & completeness review',
    prompt: `[Agent 1 prompt with ${ORIGINAL_REQUIREMENTS} and ${PLAN_CONTENT} substituted]`,
});

Agent({
    subagent_type: 'general-purpose',
    description: 'Verification review',
    prompt: `[Agent 2 prompt with ${PLAN_CONTENT} substituted]`,
});

Agent({
    subagent_type: 'general-purpose',
    description: 'Parallelisability analysis',
    prompt: `[Agent 3 prompt with ${PLAN_CONTENT} substituted]`,
});

// Only if --no-devils-advocate is NOT set:
Agent({
    subagent_type: 'general-purpose',
    description: "Devil's Advocate review",
    prompt: `[Agent 4 prompt with ${ORIGINAL_REQUIREMENTS}, ${PLAN_CONTENT}, and ${STANDARD_FINDINGS} substituted]`,
});
```
