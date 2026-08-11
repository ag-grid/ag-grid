#!/usr/bin/env bash
# external/ag-shared/scripts/install-for-cloud/cloud-doctor.sh
#
# Readiness report for a Claude Code session — written for cloud sessions, but
# safe to run anywhere. Answers "is this session actually ready to work?" and,
# when it is not, which layer is missing: toolchain, dependencies, generated
# Claude Code config, or plugin-delivered skills.
#
# Ask Claude to run it in a cloud session:
#   bash external/ag-shared/scripts/install-for-cloud/cloud-doctor.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../../../.." && pwd)}"
if [[ -z "${AG_CLOUD_CACHE_DIR:-}" ]]; then
    # Matches install-for-cloud.sh: the shared path first, $HOME only as fallback.
    if [[ -d /opt/ag-cloud ]]; then
        AG_CLOUD_CACHE_DIR=/opt/ag-cloud
    else
        AG_CLOUD_CACHE_DIR="$HOME/.cache/ag-cloud"
    fi
fi

CANARY_SKILLS=(example dev-server debug-trace git-conventions jira)
FAILURES=0

ok() { echo "  ✓ $*"; }
bad() {
    echo "  ✗ $*"
    FAILURES=$((FAILURES + 1))
}
note() { echo "  · $*"; }

echo "=== Claude Code session readiness ==="
echo
echo "environment"
note "repo root:       ${REPO_ROOT}"
note "cloud session:   ${CLAUDE_CODE_REMOTE:-false}"
note "session id:      ${CLAUDE_CODE_REMOTE_SESSION_ID:-n/a}"
note "branch:          $(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if [[ "$PWD" != "$REPO_ROOT" ]]; then
    # With more than one repository attached, a cloud session starts in the parent
    # directory, so every relative path into the repo fails.
    note "cwd:             ${PWD} (not the repo root — use absolute paths or cd first)"
fi

echo
echo "toolchain"
wanted_node="$(tr -d 'v \t\n' <"$REPO_ROOT/.nvmrc" 2>/dev/null)"
have_node="$(node -v 2>/dev/null | tr -d 'v')"
if [[ -z "$have_node" ]]; then
    bad "node not on PATH"
elif [[ "$have_node" == "$wanted_node" ]]; then
    ok "node ${have_node} (matches .nvmrc)"
else
    bad "node ${have_node} but .nvmrc wants ${wanted_node:-?}"
    # Usually PATH order rather than a missing runtime: the cloud image ships its
    # own node ahead of the pinned one.
    pinned_bin="$(head -1 "$AG_CLOUD_CACHE_DIR/node-bin-path" 2>/dev/null || true)"
    if [[ -n "$pinned_bin" && -x "$pinned_bin/node" ]]; then
        note "  pinned node is installed — export PATH=\"${pinned_bin}:\$PATH\""
    fi
fi
if command -v yarn &>/dev/null; then ok "yarn $(yarn -v 2>/dev/null)"; else bad "yarn not on PATH"; fi
if command -v nx &>/dev/null; then ok "nx on PATH"; else note "nx not global — use \`yarn nx\`"; fi
if command -v gh &>/dev/null; then
    ok "gh $(gh --version 2>/dev/null | head -1 | awk '{print $3}')"
else
    note "gh not installed (built-in GitHub tools still work)"
fi

echo
echo "dependencies"
if [[ -d "$REPO_ROOT/node_modules" ]]; then
    if [[ -f "$AG_CLOUD_CACHE_DIR/unscripted" ]]; then
        # Passes the integrity check but has no patches and no built plugins: the
        # setup script had to skip postinstall to fit its 5 minute cap.
        bad "node_modules restored from an unscripted cache — patches and plugin builds still pending"
    elif (cd "$REPO_ROOT" && yarn check --integrity &>/dev/null); then
        ok "node_modules present and in sync with yarn.lock"
    else
        bad "node_modules present but stale — an install is pending"
    fi
else
    bad "node_modules missing"
fi
# The environment build's own log, mirrored here by cloud-setup.sh because the
# platform discards it once the build ends. This is the only way to see why a
# build produced nothing.
if [[ -f "$AG_CLOUD_CACHE_DIR/setup.log" ]]; then
    note "setup log: $AG_CLOUD_CACHE_DIR/setup.log ($(tail -1 "$AG_CLOUD_CACHE_DIR/setup.log" 2>/dev/null | cut -c1-90))"
else
    note "no setup log at $AG_CLOUD_CACHE_DIR/setup.log — the setup script never reached its first log line"
fi
if [[ -d "$AG_CLOUD_CACHE_DIR/node_modules" ]]; then
    if [[ -f "$AG_CLOUD_CACHE_DIR/unscripted" ]]; then
        note "cloud cache seeded but unscripted ($AG_CLOUD_CACHE_DIR)"
    else
        ok "cloud cache seeded and scripted ($AG_CLOUD_CACHE_DIR)"
    fi
else
    note "no cloud cache — a re-cloned tree would need a full install"
fi

echo
echo "claude code config"
if [[ -f "$REPO_ROOT/.claude/settings.json" ]]; then
    ok ".claude/settings.json (hooks, permissions, plugins)"
else
    bad ".claude/settings.json missing — no hooks, no plugins, no skills"
fi
if [[ -f "$REPO_ROOT/CLAUDE.md" ]]; then ok "CLAUDE.md"; else bad "CLAUDE.md missing"; fi
rules_count=$(find "$REPO_ROOT/.claude/rules" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
if [[ "$rules_count" -gt 0 ]]; then
    ok ".claude/rules (${rules_count} generated rules)"
else
    note ".claude/rules empty — rulesync has not run in this tree"
fi
# The repo's own skills, as distinct from the plugin-delivered ones below. They are
# gitignored rulesync output, so a cloud clone has none until something generates
# them, and Claude Code enumerates skills at launch — too late to fix in-session.
local_skills=$(find "$REPO_ROOT/.claude/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
if [[ "$local_skills" -gt 0 ]]; then
    ok ".claude/skills (${local_skills} repo-local skills)"
else
    bad ".claude/skills empty — the repo's own skills are missing"
fi

echo
echo "plugin marketplaces"
# A clone under marketplaces/ is inert unless it is also registered: one session
# had openai-codex fully cloned on disk and absent from the registry, so no plugin
# from it existed as far as Claude Code was concerned.
registry="$HOME/.claude/plugins/known_marketplaces.json"
for market in ag-dev openai-codex; do
    dir="$HOME/.claude/plugins/marketplaces/$market"
    if grep -q "\"${market}\"" "$registry" 2>/dev/null; then
        ok "${market} registered"
    elif [[ -d "$dir" ]]; then
        bad "${market} cloned but NOT registered (claude plugin marketplace add …)"
    else
        bad "${market} not installed"
    fi
done

echo
echo "skills (canary set)"
# Search every place a skill can come from. A marketplace registered from a local
# directory keeps its plugins where they are rather than copying them into
# plugins/cache, so looking only at the cache reported all five canary skills
# missing in a session that could use every one of them.
#
# Only existing directories go in: `find` exits non-zero on a missing root, and
# with `pipefail` that failure propagates through `| grep -q .` and reads as "no
# match". A cloud clone has no .claude/skills, which is exactly how a session with
# all five skills installed reported all five missing.
skill_roots=()
for candidate in "$HOME/.claude/plugins/marketplaces" "$HOME/.claude/plugins/cache" \
    "$REPO_ROOT/.claude/skills"; do
    [[ -d "$candidate" ]] && skill_roots+=("$candidate")
done
while read -r location; do
    [[ -n "$location" && -d "$location" ]] && skill_roots+=("$location")
done < <(node -e '
    const fs = require("fs");
    try {
        const r = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
        for (const m of Object.values(r)) if (m.installLocation) console.log(m.installLocation);
    } catch {}
' "$registry" 2>/dev/null)

# On disk only. Claude Code enumerates plugin skills at launch, so a skill
# installed mid-session shows here and is still not usable until a new session —
# ask Claude what it can actually see if this passes and skills still do not work.
for skill in "${CANARY_SKILLS[@]}"; do
    if ((${#skill_roots[@]} == 0)); then
        bad "$skill missing (nowhere to look — no plugin cache and no generated skills)"
        continue
    fi
    if [[ -n "$(find "${skill_roots[@]}" -maxdepth 8 -type d -name "$skill" 2>/dev/null)" ]]; then
        ok "$skill"
    else
        bad "$skill missing"
    fi
done

echo
if ((FAILURES == 0)); then
    echo "READY — no gaps found."
else
    echo "NOT READY — ${FAILURES} gap(s) above."
    echo "Dependency gaps: bash ${SCRIPT_DIR}/finish-setup.sh"
    echo "Marketplace or skill gaps: the environment's setup script must register"
    echo "them before launch — see external/ag-shared/docs/claude-code-cloud-sessions.md."
    echo "Locally: run \`yarn\` from the repo root."
fi
exit 0
