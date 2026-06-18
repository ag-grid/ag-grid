# claude-hooks

Helper scripts for the Claude Code formatting hooks, referenced from
`external/ag-shared/.claude-settings.template.json` and rendered into each
checkout's `.claude/settings.json` by `setup-prompts/setup-prompts.sh`.

These replace the previous per-edit `PostToolUse` formatter (which ran
`nx format` after *every* edit — ~2.4–3.8s of yarn+nx startup each, serialised
into the agent loop, and which mutated files outside the model's view). The
new design tracks edits cheaply, formats once at turn end, and gates commits.

| Script | Hook event | Role |
|---|---|---|
| `track-edit.sh` | `PostToolUse` (`Edit\|MultiEdit\|Write`) | Append the edited file path to a per-session list. Fast; never fails the tool. |
| `format-tracked.sh` | `Stop` | Batch-format the tracked files once, clear the list on success. Surfaces genuine failures as the standard non-blocking hook-error notice. |
| `precommit-check.sh` | `PreToolUse` (`Bash`) | Read-only gate: deny a `git commit` whose staged files aren't formatted, with a fix command. Never mutates files. |
| `_common.sh` | — | Shared helpers (sourced): session temp path, formattable-extension filter, stale-dir sweep. |

## Design notes

- **Session temp:** no Claude env var exposes a session scratch dir, so state
  lives at `${TMPDIR:-/tmp}/claude-session-<session_id>/edited-files.list`,
  keyed by the `session_id` on hook stdin. `_common.sh` sweeps dirs >7 days old.
- **No mid-turn staleness:** edits are only *tracked* during a turn; formatting
  happens at `Stop` (after the model yields) and is *checked* (never applied) at
  commit time — nothing rewrites files mid-edit.
- **Commit detection** is done inside `precommit-check.sh` (not via the hook
  `if` field) so chained `git add … && git commit …` commands are matched.
- **Benign `no files matching`:** files nx can't map to a project (e.g. root
  configs) are treated as already-OK rather than surfaced as errors — this
  removes the dominant historical failure class.
- **Canonical formatter:** uses `nx format` / `nx format:check` so output
  matches the rest of the toolchain (CI, manual `yarn nx format`).

## Testing

Pipe synthetic hook JSON into a script, e.g.:

```bash
echo '{"session_id":"t1","cwd":"'"$PWD"'","tool_input":{"file_path":"'"$PWD"'/packages/ag-charts-community/src/main.ts"}}' \
  | ./track-edit.sh
echo '{"session_id":"t1","cwd":"'"$PWD"'"}' | ./format-tracked.sh
echo '{"cwd":"'"$PWD"'","tool_input":{"command":"git commit -m wip"}}' | ./precommit-check.sh
```
