---
targets: ['*']
name: reflect
description: 'Analyse the current conversation to identify where agentic configuration (rules, skills, sub-agents, commands) caused friction, and recommend specific improvements. Use this skill when the user says "reflect", "what went wrong", "what could be better", "improve the prompts", or after a long or friction-heavy session. Also use when the user asks to review how skills or rules performed during the conversation.'
invocable: user-only
---

# Reflect — Agentic Configuration Improvement

Analyse the current conversation to find where agentic configuration caused friction, wasted context, or produced wrong results. Output a structured report with actionable recommendations, then optionally apply improvements.

## Arguments

Parse optional flags from the invocation:

-   `--focus skills|rules|agents|commands|all` — narrow analysis scope (default: `all`)
-   Free text — describe a specific pain point if the conversation doesn't make it obvious

Examples: `/reflect`, `/reflect --focus skills`, `/reflect the jira skill kept loading when I was just editing code`

---

## Phase 1: Conversation Mining

Scan the conversation history above this skill invocation. For each friction signal, record the **evidence** (what happened), the **config source** (which rule, skill, or agent was involved), and the **impact** (wasted tokens, wrong output, user correction needed, time lost).

### What to look for

#### User Corrections

The user explicitly corrected the agent's approach or output — "no", "wrong", "don't do that", "use X instead", "I said...". The agent made assumptions a rule should have prevented, or lacked knowledge a rule should have provided.

**Likely root cause**: Rule gap, rule ambiguity, or rule not loaded for the relevant file pattern.

#### Skill Misfires

A skill was invoked but didn't match the user's intent. A skill was invoked multiple times for the same task (retry signal). A skill loaded but its guidance was ignored or contradicted by the agent. The user had to manually name a skill that should have auto-triggered, or a skill auto-triggered when it shouldn't have.

**Likely root cause**: Skill description too broad or too narrow, missing trigger phrases, wrong `invocable` setting, or skill body missing key guidance.

#### Rule Gaps

The agent lacked knowledge that a rule should have provided. The agent violated a convention that exists in a rule but the rule wasn't loaded because the glob pattern didn't match the files being edited. The agent had to ask the user for information that's already documented somewhere.

**Likely root cause**: Missing rule, wrong glob pattern, rule content incomplete or outdated.

#### Sub-agent Focus Issues

A sub-agent produced off-topic or low-quality output. A sub-agent lacked necessary tools or permissions. A sub-agent duplicated work already done by the main agent or another sub-agent.

**Likely root cause**: Agent description too vague, wrong tool list, insufficient context in the agent prompt.

#### Context Waste

Large rules loaded that were irrelevant to the task. Skills auto-triggered when they shouldn't have. Redundant information loaded from overlapping rules. The conversation burned significant tokens on a dead-end approach that better guidance would have prevented.

**Likely root cause**: Overly broad globs, missing `invocable: user-only`, rule overlap, or missing early-exit guidance.

#### Permission and Configuration Issues

Tool calls denied that should have been allowed. MCP servers unavailable when needed. Hooks blocked a legitimate workflow. Commands that were manually approved repeatedly that could be pre-allowed.

**Likely root cause**: `.claude-settings.json` gaps, MCP config issues, hook logic too strict.

**Permission recommendations**: When recommending new permissions, assess the risk level:

-   **Low risk** (recommend adding): Read-only commands (`gh run view`, `gh workflow list`, `ls`, `cat`), build/test commands already part of the standard workflow (`yarn nx test`, `yarn nx lint`), and commands that were approved multiple times during the conversation.
-   **Medium risk** (recommend with caveat): Commands that modify local state but are reversible (`git checkout`, `yarn install`), or commands scoped to specific tools/patterns.
-   **High risk** (flag but don't recommend auto-adding): Commands with broad write access (`rm`, `git push`), wildcard patterns that could match destructive operations, or commands that interact with external services beyond read access.

Only recommend adding permissions that were actually used or denied during the conversation — do not speculatively suggest permissions.

#### Missing Capabilities

The user needed a workflow that no skill or command covers. The agent had to improvise a multi-step process that should be codified. A repeatable task with no existing automation.

**Likely root cause**: Missing skill or command.

### How to mine

1. Read through the conversation chronologically
2. Flag every instance where the user redirected, corrected, or expressed frustration
3. Flag every skill invocation and whether it helped or hindered
4. Flag every sub-agent spawn and whether its output was used
5. Note any repeated manual steps that could be automated
6. If the user provided free text describing a pain point, start there

---

## Phase 2: Configuration Audit

For each friction signal, trace it to the responsible configuration file.

### Load the inventory

Read `.rulesync/README.md` to understand what's available. Then, only for signals that need deeper investigation, read the specific config files involved.

Do not read all config files upfront — only the ones relevant to identified friction.

### Classify each finding

For each friction signal, determine:

| Field              | Description                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Category**       | `skill-misfire`, `rule-gap`, `rule-overload`, `agent-focus`, `context-waste`, `permission-gap`, or `missing-capability` |
| **Severity**       | `high` (blocked work or significant rework), `medium` (friction but worked around), `low` (minor annoyance)             |
| **Config file**    | Exact path to the responsible file, or "N/A — new file needed"                                                          |
| **Evidence**       | Brief description of what happened in the conversation                                                                  |
| **Recommendation** | Specific change: text to add/remove/modify, glob to adjust, frontmatter to change, or new file to create                |

---

## Phase 3: Report

Present findings using this structure:

```markdown
# Reflection Report

**Conversation focus**: {brief description of what the session was about}
**Analysis scope**: {all | skills | rules | agents | commands}
**Findings**: {N} issue(s) across {M} categories

---

## High Severity

### H1: {Short title}

**Category**: {category}
**Evidence**: {what happened}
**Config**: `{file path}`
**Problem**: {why the current config caused this}
**Recommendation**: {specific change — be concrete enough to act on}

---

## Medium Severity

### M1: {Short title}

{Same structure}

---

## Low Severity

### L1: {Short title}

{Same structure}

---

## Recommended Changes

| #   | File                            | Change                     | Severity | Risk |
| --- | ------------------------------- | -------------------------- | -------- | ---- |
| 1   | `.rulesync/rules/foo.md`        | Add section on X           | High     | —    |
| 2   | `.rulesync/skills/bar/SKILL.md` | Narrow description trigger | Medium   | —    |
| 3   | `.claude-settings.json`         | Add `Bash(gh run view:*)`  | Low      | Low  |

_For permission changes, the Risk column indicates how dangerous the permission is to grant (Low/Medium/High). See Phase 1 § Permission and Configuration Issues for risk classification criteria._

## New Capabilities Needed

{List any missing skills, commands, or rules that should be created, with a one-paragraph spec for each}
```

If no friction was found, say so — a clean conversation is valuable signal too.

---

## Phase 4: Offer Next Steps

After presenting the report, ask the user what they'd like to do:

1. **Apply changes** — implement the recommended config changes directly (follow `.rulesync/` conventions from the `/rulesync` skill)
2. **Persist learnings** — feed high-severity findings into `/remember` (Project Memory Path) as rule/skill updates
3. **Create new skills** — if new capabilities were identified and `/skill-creator` is available, use it to draft them
4. **Create tasks** — log findings as tasks for later action
5. **Done** — report only, no further action

Use AskUserQuestion with these options. Wait for the user's response.

### Applying changes

For each approved change:

1. Read the target file
2. Apply the modification
3. Follow `.rulesync/` conventions:
    - Never target `.claude/` directly — it's generated output
    - Never modify `CLAUDE.md`, `AGENTS.md`, or `root: true` files
    - Cross-repo reusable content → `external/ag-shared/prompts/`
    - Product-specific content → `external/prompts/`
    - Repo-specific content → `.rulesync/` directly
4. After all changes, regenerate and verify:
    ```bash
    ./external/ag-shared/scripts/setup-prompts/setup-prompts.sh
    ./external/ag-shared/scripts/setup-prompts/verify-rulesync.sh
    ```

### Creating new skills

If the report identified missing capabilities and the user chose option 3:

1. For each new skill spec from the "New Capabilities Needed" section
2. Invoke `/skill-creator` with the spec as context
3. The skill-creator handles drafting, testing, and iteration

---

## Anti-patterns

-   **Do not invent problems** — only report friction that actually occurred in the conversation or that the user described. No hypothetical issues.
-   **Do not auto-apply changes** — always present the report first and wait for explicit approval.
-   **Do not load all config files upfront** — only read files relevant to identified friction signals.
-   **Do not critique prompt writing style** — focus on functional issues (misfires, gaps, waste), not aesthetics or formatting preferences.
-   **Do not duplicate `/validate-prompts`** — that skill checks structural path hygiene. This skill checks functional effectiveness.
-   **Do not duplicate `/optimise-context`** — that command audits token budget. This skill audits conversation-level friction.

## Relationship to Other Skills

| Skill               | Boundary                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| `/remember`         | Reflect identifies _what_ to improve; Remember persists the learnings        |
| `/validate-prompts` | Validates structural correctness; Reflect validates functional effectiveness |
| `/optimise-context` | Optimises token budget; Reflect optimises guidance quality                   |
| `/rulesync`         | Provides the conventions Reflect follows when applying changes               |
| `/skill-creator`    | Drafts new skills that Reflect identifies as missing capabilities            |
