# Design Review Output Format

Use this template to synthesise the final review report from all agent findings.

---

```markdown
# Design Review Report

## Summary

- **Document:** [path/to/design-doc.md]
- **Title:** [Document title]
- **Review Mode:** [Quick/Thorough]
- **Panel:** [List of agent roles that participated]
- **Overall Assessment:** [Strong / Needs Work / Major Concerns]

### Issue Counts

| Severity  | Count |
|-----------|-------|
| Critical  | X     |
| Important | Y     |
| Minor     | Z     |
| Praise    | P     |

### Key Strengths

> [1-3 bullet points summarising what the panel praised — helps the author understand
> what is working well and should not be changed during revisions]

### Key Concerns

> [1-3 bullet points summarising the most important issues across all reviewers]

---

## Requirements Coverage

### Stated Requirements

> [Numbered list extracted from the document's goals / problem statement]

### Coverage Assessment

| # | Requirement | Covered By | Status |
|---|-------------|------------|--------|
| 1 | [requirement] | Section N.N | Full / Partial / Missing |
| 2 | [requirement] | Section N.N | Full / Partial / Missing |

---

## Findings by Section

Organise all findings by the document section they relate to. Within each section, order by
severity (Critical first, then Important, Minor, Praise).

### Section N: [Section Title]

#### [Severity] — [Finding Title]

- **Raised by:** [Role name(s)] {note if multiple reviewers flagged the same issue}
- **Issue:** [Clear description of the concern]
- **Impact:** [Why this matters — what could go wrong]
- **Recommendation:** [Specific, actionable suggestion]

_{Repeat for each finding in this section}_

---

## Devil's Advocate Challenges

_{Separate section for DA findings, preserving the [DA] prefix}_

### [DA] [Challenge Title] — [Severity]

- **Section:** [Document section reference]
- **Challenge:** [What is being questioned]
- **What breaks:** [Concrete failure scenario]
- **Alternative:** [Suggested alternative or mitigation]

_{Or "The Devil's Advocate found no substantive issues — this is a strong signal the
design is robust."}_

---

## Open Questions

Questions raised by the review panel that the author should consider:

1. [Question from Role Name] — [The question]
2. [Question from Role Name] — [The question]

_{Include both questions from the agents and unresolved questions from the original document}_

---

## Recommendations

### Address Before Implementation (Critical + High-Impact Important)

1. **[Recommendation]**
   - Section: [where in doc]
   - Specific change: [what to modify]
   - Raised by: [which reviewer(s)]

### Address During Implementation (Remaining Important)

1. **[Recommendation]**
   - [Details]

### Optional Improvements (Minor)

1. **[Recommendation]**
   - [Details]

---

## Next Steps

The author should:

1. [ ] Review findings and decide which to accept, reject, or defer
2. [ ] Address critical issues before proceeding to implementation
3. [ ] Consider running `/design-review --quick` after revisions
4. [ ] Use `/plan-review` to validate the implementation plan once the design is finalised
```

---

## Synthesis Guidelines

When merging findings from multiple agents:

1. **Deduplication:** If two agents flag the same concern, merge into a single finding and
   note both roles in the "Raised by" field. Use the higher severity.

2. **Consensus signals:** If 3+ agents flag the same issue, add a "(consensus)" tag. This
   is a strong signal the author should prioritise addressing it.

3. **Contradictions:** If agents disagree (e.g., the Performance Engineer wants a simpler
   structure but the Data Model Reviewer wants a richer one), present both perspectives and
   let the author decide. Do not resolve contradictions silently.

4. **Praise aggregation:** Combine praise from multiple agents into the Key Strengths summary.
   Specific per-section praise still appears in the section findings.

5. **Severity calibration:**
   - **Critical** — the design has a fundamental flaw that would cause implementation failure
     or a production-severity bug. Must be resolved before proceeding.
   - **Important** — significant concern that should be addressed but does not block
     understanding or initial implementation.
   - **Minor** — improvement suggestion or style preference. Nice to address but not blocking.
   - **Praise** — something the design does well. Reinforces good patterns.
