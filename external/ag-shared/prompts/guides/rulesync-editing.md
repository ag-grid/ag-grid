---
globs:
  - '.rulesync/**/*'
  - '.claude/**/*'
  - '.cursor/**/*'
  - '.github/copilot*'
  - '.codex/**/*'
  - '.gemini/**/*'
  - '.opencode/**/*'
  - 'AGENTS.md'
  - 'CLAUDE.md'
alwaysApply: false
---

# Agentic Tooling Configuration

`.rulesync/` is the canonical source for all AI agent rules, skills, and commands. Tool-specific directories (`.claude/`, `.cursor/`, `.github/copilot*`, `.codex/`, `.gemini/`, `.opencode/`, `AGENTS.md`, `CLAUDE.md`) are **generated outputs** — do not edit them directly. Make changes in `.rulesync/` and run `setup-prompts.sh` to propagate.

**Before editing agentic tooling config**, load the `/rulesync` skill for the full configuration reference (frontmatter syntax, symlink conventions, skill structure, and verification steps).
