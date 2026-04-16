---
name: design-review
description: >-
  Review design documents using a multi-agent expert panel. Use when reviewing architecture docs,
  design proposals, data model designs, feasibility assessments, or technical RFCs. Also use when
  the user says "review this design", "get feedback on this doc", "launch a review panel",
  "stress-test this design", or wants expert opinions on a design document before implementation.
  Covers internal design docs, ag-shared design decisions, and PRD-adjacent technical documents.
disable-model-invocation: true
context: fork
---

# Design Document Review

Review design documents using a parallel multi-agent expert panel. The panel composition adapts to
the document's domain and scope, and always includes a Tech Lead, Product Manager, and Devil's
Advocate. The user reviews all feedback before any changes are incorporated into the document.

## Input Requirements

User provides one of:

- Explicit doc path: `/design-review path/to/design-doc.md`
- Auto-detect from context: `/design-review` (looks for recently discussed design docs)

Optional flags:

- `--quick` — Reduced panel (4 agents: TL + PM + 1 domain expert + DA)
- `--thorough` — Full panel (default, 6-8 agents)
- `--no-devils-advocate` — Skip the Devil's Advocate pass
- `--incorporate` — After review, apply user-approved feedback to the document
- `--diagrams` — Include a Diagrams Reviewer to assess visual aids (Mermaid, etc.)

## Sub-Documents

Load sub-documents progressively based on the review phase.

| Document | Purpose | When to Load |
|----------|---------|-------------|
| `agent-prompts.md` | Agent prompt templates for all review roles | Phase 2 (Agent Launch) |
| `agents/devils-advocate.md` | DA adversarial review instructions | Phase 2 (unless --no-devils-advocate) |
| `output-format.md` | Report template and synthesis structure | Phase 3 (Synthesis) |

## Execution Phases

### Phase 0: Document Analysis & Panel Composition

1. **Read the design document** in full. Extract:
   - **Title and scope** — what the document covers and what it excludes
   - **Domain** — the technical area (e.g., data modelling, rendering pipeline, API design,
     performance optimisation, interaction design, accessibility)
   - **Key decisions** — options evaluated, trade-offs discussed, recommendations made
   - **Constraints** — performance budgets, compatibility requirements, zero-dependency rules
   - **Open questions** — areas the author has flagged as unresolved

2. **Identify linked context.** Check for:
   - JIRA tickets referenced in the document (fetch summaries via MCP if available)
   - Related design docs in the same directory or referenced by path
   - PRD or requirements docs that this design implements
   - Existing code referenced by the document (read key files to ground the review)

3. **Compose the expert panel.** The panel always includes three fixed roles:

   | Role | Always | Purpose |
   |------|--------|---------|
   | Tech Lead | Yes | Architectural coherence, engineering trade-offs, maintainability |
   | Product Manager | Yes | User value, requirements coverage, scope alignment |
   | Devil's Advocate | Yes (default) | Stress-test assumptions, challenge the approach |

   Then **derive 2-4 domain expert roles from the document's content.** Each role should map to
   a distinct area of expertise that the document demands scrutiny in. The goal is to cover the
   key concerns the document raises, not to fill slots from a predefined list.

   **How to derive roles:**
   - Identify the 3-5 most important technical concerns in the document (these often correspond
     to evaluation criteria, constraints, or sections where options are compared)
   - For each concern, ask: "what kind of specialist would catch mistakes here?"
   - Name each role descriptively so the agent understands its focus (e.g., "Memory Layout &
     GC Pressure Reviewer" rather than just "Performance Reviewer")
   - Avoid redundancy with the fixed roles — TL already covers architecture, PM covers
     requirements. Domain experts should go deeper into specific technical areas.
   - In `--quick` mode, select only the single most critical domain expert

   **Example derivations:**

   | Document About | Derived Roles |
   |----------------|---------------|
   | Selection data model with 100K data perf target | Hot-Path Performance Analyst, Data Structure & Identity Reviewer, Aggregation Compatibility Reviewer |
   | Bundle size reduction | Tree-Shaking & Module Boundary Reviewer, Build Tooling Specialist, API Surface Compatibility Reviewer |
   | Server-side rendering | Node.js Runtime Compatibility Reviewer, Framework Lifecycle Specialist, Hydration & State Transfer Reviewer |
   | Accessibility redesign | Assistive Technology Specialist, Keyboard Navigation Reviewer, ARIA Semantics Reviewer |

   If the `--diagrams` flag is passed, also include a Diagrams & Visual Aids Reviewer.

4. **Summarise the panel to the user** before launching agents:

   ```
   Panel for "Selection Data Model Design":
     1. Tech Lead
     2. Product Manager
     3. Performance Engineer (perf budgets, hot-path analysis)
     4. Data Model Reviewer (identity mapping, aggregation compat)
     5. Devil's Advocate
   Launching 5 agents in parallel...
   ```

   Proceed unless the user objects or asks for changes.

### Phase 1: Extract Review Criteria

Before launching agents, extract structured criteria from the document:

1. **Requirements** — decompose the document's stated goals into a numbered checklist of
   discrete, verifiable requirements (similar to plan-review's original requirements extraction)
2. **Evaluation dimensions** — identify the criteria the document itself uses to evaluate options
   (e.g., memory usage, mutation cost, query latency, API surface)
3. **Constraints** — hard limits that any solution must satisfy
4. **Open questions** — questions the author explicitly flagged

Store these as `${REQUIREMENTS}`, `${EVALUATION_DIMENSIONS}`, `${CONSTRAINTS}`, and
`${OPEN_QUESTIONS}` for injection into agent prompts.

### Phase 2: Parallel Agent Launch

Read `agent-prompts.md` for the prompt templates. For each agent in the panel:

1. Construct the prompt by filling the template with:
   - `${DOCUMENT_CONTENT}` — the full design document
   - `${REQUIREMENTS}` — from Phase 1
   - `${EVALUATION_DIMENSIONS}` — from Phase 1
   - `${CONSTRAINTS}` — from Phase 1
   - `${OPEN_QUESTIONS}` — from Phase 1
   - `${LINKED_CONTEXT}` — summaries of JIRA tickets, related docs, relevant code
   - `${ROLE_FOCUS}` — the specific focus areas for this agent's role

2. Launch all agents in parallel using the Agent tool. Each agent should:
   - Read relevant source code sections referenced by the document
   - Evaluate the design against their domain expertise
   - Return structured findings with severity levels

3. **Devil's Advocate** runs in the same parallel batch (not sequentially). The DA receives the
   same document and criteria but with adversarial instructions from `agents/devils-advocate.md`.

### Phase 3: Synthesis & Presentation

Once all agents complete, load `output-format.md` and synthesise:

1. **Categorise findings** by severity: Critical / Important / Minor / Praise
   - Include a **Praise** category — if agents highlight strengths, surface them. This helps
     the author understand what is working well, not just what needs fixing.

2. **Consolidate duplicates** — merge findings from different agents that flag the same issue.
   Note which roles flagged each issue (consensus across multiple reviewers strengthens a finding).

3. **Group by document section** — organise findings by the section of the design doc they relate
   to, making it easy for the author to address them in order.

4. **Present the full report to the user.** Do NOT automatically modify the design document.
   The user decides which findings to act on.

### Phase 4: Interactive Resolution

After presenting the report:

1. **Wait for user direction.** The user may:
   - Ask clarifying questions about specific findings
   - Dismiss findings they disagree with
   - Ask for deeper analysis on a specific concern
   - Request the panel (or a subset) to discuss a contentious point
   - Say "incorporate all" or "incorporate critical and important"
   - Provide their own resolution for specific findings

2. **If `--incorporate` was passed or user requests incorporation:**
   - For each approved finding, propose a specific edit to the design document
   - Show the edit to the user before applying (unless they said "incorporate all")
   - Apply edits one section at a time, re-reading the document between edits to avoid conflicts
   - After all edits, present a summary of changes made

3. **If the user wants a follow-up review** after incorporation:
   - Re-run with `--quick` mode focusing on the modified sections
   - Only launch agents whose domain was affected by the changes

## Agent Output Contract

All review agents return findings in this structure:

```markdown
## [Role Name] Review

### Findings

#### CRITICAL
- **[Finding title]** (Section N.N)
  [Explanation of the issue and its impact]
  **Recommendation:** [Specific suggested change]

#### IMPORTANT
- **[Finding title]** (Section N.N)
  [Explanation]
  **Recommendation:** [Suggested change]

#### MINOR
- **[Finding title]** (Section N.N)
  [Brief explanation and optional suggestion]

#### PRAISE
- **[Strength title]** (Section N.N)
  [What works well and why]

### Summary
[1-2 sentence assessment from this reviewer's perspective]

### Open Questions
[New questions raised by this review, if any]
```

## Usage Examples

```bash
# Full review of a design doc
/design-review external/docs/design-decisions/charts/AG-5158-data-point-selection/selection-data-model.md

# Quick review (fewer agents)
/design-review path/to/doc.md --quick

# Review and incorporate feedback
/design-review path/to/doc.md --incorporate

# Skip Devil's Advocate
/design-review path/to/doc.md --no-devils-advocate

# Include diagram review
/design-review path/to/doc.md --diagrams
```

## Integration with Other Skills

- **Before design review:** Use `/jira` to understand ticket context and requirements
- **After design review:** Use `/plan-review` to validate any implementation plan derived from the design
- **For design doc creation:** Consider using a structured template before running review
