---
targets: ['*']
name: debug
description: >-
  Hypothesis-driven debugging with transient console log instrumentation.
  Use when isolating the root cause of a bug, unexpected behaviour, or
  regression. Also use when the user says "debug this", "trace this",
  "why is this happening", "help me find the cause", "add some logging",
  "instrument this code", or describes behaviour that differs from what
  they expect. Covers the full cycle: hypothesise, instrument, execute,
  analyse logs, and clean up.
---

# Debug — Hypothesis-Driven Root Cause Isolation

A structured workflow for isolating bugs and unexpected behaviour through
transient console log instrumentation. The core idea: form a hypothesis
about *why* something is happening, add targeted logging to confirm or
refute it, observe the output, and iterate until the root cause is clear.

## Overview

```
Hypothesise → Instrument → Execute → Analyse → (repeat or conclude) → Clean up
```

Each iteration either confirms the root cause or narrows the search space.
Resist the urge to guess at fixes before the root cause is confirmed — the
logs will tell you where to look.

## Step 0: Establish a Debug Tag

Choose a tag to prefix all transient log lines so they are easy to find and
clean up:

- If a JIRA ticket is referenced in conversation (e.g. `AG-1234`, `CRT-56`),
  use it: `[AG-1234]`
- Otherwise generate a short unique tag: `[DBG-001]`

This tag is used in every `console.log` added during this session and is the
grep target for cleanup verification at the end.

**Store the tag** — you will reference it in every subsequent step.

## Step 1: Establish a Hypothesis

Before touching any code, articulate a clear hypothesis about what is causing
the bug. A good hypothesis is *falsifiable* — the logs you add in the next
step should be able to prove it wrong.

**If the conversation already contains a hypothesis**, summarise it back to
the user for confirmation before proceeding.

**If no hypothesis exists yet**, investigate:

1. Read the relevant source code around the reported symptom.
2. Check recent git history for the area (`git log --oneline -20 -- <path>`).
3. Look for related tests that might clarify intended behaviour.
4. Search for similar patterns elsewhere in the codebase.

Then propose a hypothesis to the user in this format:

```
**Hypothesis:** <what you think is happening and why>
**Prediction:** if this is correct, we should see <specific observable> in the logs
**Key locations:** <file:line references where instrumentation will go>
```

Wait for user confirmation before proceeding to instrumentation. The user may
refine or redirect the hypothesis — that is valuable signal, not wasted time.

## Step 2: Instrument with Transient Console Logs

Add `console.log` statements at strategic points to trace the suspected fault.
Every log line MUST use the debug tag from Step 0.

### Log format

```typescript
console.log(`[TAG] <description>`, relevantVariable1, relevantVariable2);
```

### What to instrument

Choose logging points that will either **confirm or refute** the hypothesis:

- **Control-flow decision points** — log which branch was taken and why:
  ```typescript
  console.log(`[AG-1234] shouldUpdate: condition=${condition}, result=${shouldUpdate}`);
  ```
- **Variable assignments at interesting moments** — values entering or leaving
  a function, state transitions:
  ```typescript
  console.log(`[AG-1234] processData entry`, { dataLength: data.length, options });
  ```
- **Boundary crossings** — where data passes between modules, classes, or
  async boundaries:
  ```typescript
  console.log(`[AG-1234] emitting event`, { type, payload });
  ```

### What NOT to instrument

- Hot loops (thousands of iterations) — these flood the output and obscure
  the signal. If you need loop visibility, log a summary after the loop or
  log only when a condition of interest is met.
- Deep framework internals unless the hypothesis specifically points there.

### Discipline

- Add the **minimum number of logs** needed to test the hypothesis. 3-8 log
  statements is typical for one iteration. More than 12 suggests the
  hypothesis is too broad — narrow it.
- Keep log descriptions meaningful to someone unfamiliar with the code.
  `"[AG-1234] applyOptions: merged theme"` is better than `"[AG-1234] here"`.

### Track what you added

Maintain a mental (or explicit) list of every file and line where you added
a log. You will need this for cleanup.

## Step 3: Execute

Run the bug's reproduction scenario to produce log output. Choose the method
that best fits the situation:

### Option A: Unit test (preferred when available)

```bash
yarn nx test <package> --testPathPattern='<test-file>' --testNamePattern='<test-name>'
```

Jest captures `console.log` output in the terminal. If the test does not
exist yet, consider writing a minimal reproduction test — it will be useful
beyond this debugging session.

### Option B: E2E test

```bash
yarn nx test:e2e <e2e-package> --testPathPattern='<test-file>'
```

Console output appears in the Playwright terminal output. For browser-side
logs, check Playwright's console capture.

### Option C: Claude-in-Chrome MCP (when available)

If the Claude-in-Chrome MCP is connected, navigate to the relevant page or
example and exercise the interaction that triggers the bug. Then read browser
console messages to gather log output.

### Option D: Manual user reproduction

If the bug requires complex interaction, non-trivial setup, or is environment-
specific, ask the user to reproduce it:

```
I've added logging at the key decision points. Could you reproduce the issue
and paste back the console output? Look for lines starting with `[TAG]`.
```

Provide clear instructions:
- Which page/example to open
- What interaction to perform
- Where to find the console output (browser DevTools → Console tab, filter
  by the tag)

Then **wait** for the user to return with the output before proceeding.

## Step 4: Analyse the Logs

Read the log output and compare it against the hypothesis prediction from
Step 1.

### The hypothesis was confirmed

The logs match the prediction — you now know the root cause. Proceed to
Step 5 (cleanup), then explain the finding and propose a fix.

### The hypothesis was partially confirmed

Some predictions matched, others did not. Identify what was unexpected and
form a **refined hypothesis** that accounts for the new observations. Return
to Step 1 with this updated understanding.

### The hypothesis was refuted

The logs clearly contradict the prediction. This is still progress — you have
eliminated a possibility. Examine what the logs *do* show:

- Is there an unexpected code path being taken?
- Are values different from what was assumed?
- Is the timing/ordering different from expected?

Form a new hypothesis based on these observations and return to Step 1.

### Insufficient data

The logs do not provide enough information to confirm or refute. Identify the
gap and add targeted logging in that area. Return to Step 2 without changing
the hypothesis.

## Step 5: Clean Up All Transient Logs

**This step is mandatory.** Every `console.log` added during this session must
be removed before any fix is proposed or committed.

1. **Remove all log statements** you added (every line containing the debug tag).

2. **Verify cleanup** by grepping for the tag:
   ```bash
   grep -r '[TAG]' --include='*.ts' --include='*.tsx' --include='*.js' .
   ```
   Replace `[TAG]` with the actual tag (e.g. `[AG-1234]` or `[DBG-001]`).

3. **If any matches remain**, remove them. Do not proceed until the grep
   returns zero matches.

4. **Confirm to the user** that all transient logging has been removed.

## Step 6: Report Findings

Summarise the debugging session:

```markdown
## Debug Summary

**Tag:** [TAG]
**Symptom:** <what the user observed>
**Root cause:** <what is actually happening and why>
**Evidence:** <key log observations that confirmed the root cause>
**Suggested fix:** <brief description of the recommended change>
```

If the root cause is still uncertain after multiple iterations, be honest
about what was narrowed down and what remains unknown. Suggest next steps
(e.g., a different debugging approach, involving another team member, or
checking a specific external system).

## Guidelines

### Iteration budget

Most bugs resolve within 2-3 iterations. If you reach 5 iterations without
convergence, pause and reassess:

- Is the hypothesis space too large? Try to reproduce in a minimal test case.
- Are you logging the right layer? Maybe the bug originates upstream.
- Would `git bisect` be more effective at this point? Suggest `/git-bisect`.

### Working with the user

- Always explain *what* you are logging and *why* before adding instrumentation.
- Share the hypothesis explicitly — the user may have domain knowledge that
  immediately confirms or redirects it.
- If the user provides log output, read it carefully before asking for more.
  Respect their time.

### What this skill is NOT for

- **Performance profiling** — use browser DevTools Performance tab or
  dedicated benchmarks instead.
- **Finding which commit introduced a bug** — use `/git-bisect` for that.
- **Fixing the bug** — this skill isolates the root cause. The fix is a
  separate step that may involve the user's judgement on the right approach.
