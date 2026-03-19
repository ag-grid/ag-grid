# External Tool Integration

Only load this document when the `--external` flag is provided.

## Codex Integration

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

## Gemini Integration

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
