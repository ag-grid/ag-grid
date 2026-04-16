---
targets: ['*']
name: plan-implementation-review
description: 'Review plan execution completeness and identify delivery gaps'
invocable: user-only
context: fork
---

# Plan Implementation Review Prompt

You are an implementation reviewer. Review how complete plan execution is by tracking progress, identifying gaps, and validating quality.

## Input Requirements

User provides one of:

- Explicit plan file path: `/plan-implementation-review path/to/plan.md`
- Auto-detect from context: `/plan-implementation-review` (looks for recent plans)

Optional flags:

- `--quick` - Fast progress check (2 agents)
- `--thorough` - Comprehensive review (default, 4 agents)

## Sub-Documents

Load sub-documents progressively based on the review mode and phase.

| Document | Purpose | When to Load |
|----------|---------|-------------|
| `agent-prompts.md` | Agent prompt templates for all modes | Phase 1 (agent launch) |
| `output-format.md` | Report template and output structure | Phase 3 (report generation) |
| `discovered-work.md` | Discovered Work Protocol for sub-agents | Include in all sub-agent prompts |

The `discovered-work.md` is shared with the `plan-review` skill.

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

Launch analysis agents based on mode. Load `.rulesync/skills/plan-implementation-review/agent-prompts.md` for prompt templates.

Include the Discovered Work Protocol from `.rulesync/skills/plan-review/discovered-work.md` in all sub-agent prompts.

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
│ 2. Gap Detector                                              │
│ 3. Intent & Quality Validator (CRITICAL)                     │
│ 4. Test Coverage Reviewer                                    │
└─────────────────────────────────────────────────────────────┘
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
    yarn nx test <package> --testPathPattern="relevant-test"
    yarn nx build:types <package>
    ```

4. **Check Build Status (if available):**

    ```bash
    yarn nx build:types <package>
    yarn nx lint <package>
    ```

### Phase 3: Report Generation

Load `.rulesync/skills/plan-implementation-review/output-format.md` for the report template.

1. **Calculate completion metrics** — overall %, per-section, per-step
2. **Identify remaining work** — pending steps, blockers, estimated effort
3. **Document deviations** — planned vs actual, unexpected changes
4. **Provide actionable next steps** — prioritised remaining work
5. **Aggregate discovered tasks** — call `TaskList`, triage, include in report

---

## Usage Examples

```bash
# Thorough review (default)
/plan-implementation-review

# Quick progress check
/plan-implementation-review --quick

# Explicit plan file
/plan-implementation-review path/to/plan.md
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
