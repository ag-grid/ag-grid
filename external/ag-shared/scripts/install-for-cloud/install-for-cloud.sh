#!/bin/bash
# external/ag-shared/scripts/install-for-cloud/install-for-cloud.sh
#
# Cloud-only bootstrap for environments where yarn/nx may not be installed.
# Called from the SessionStart hook.
#
# In most cases (yarn present + node_modules exists), exits immediately (~10ms).
# When bootstrapping is needed, installs yarn/nx globally then delegates to
# `yarn install`, which triggers preinstall-worktree.sh for COW cloning etc.

set -euo pipefail

export AG_SKIP_NATIVE_DEP_VERSION_CHECK=1
export PUPPETEER_SKIP_DOWNLOAD=true

# In a cloud session this hook's stdout has to be a single JSON document (see
# announce_deps_not_ready), so ordinary progress lines go to stderr there. They
# are still in the hook debug log; only the notice needs to reach the model.
STDOUT_RESERVED_FOR_JSON=0
if [[ "${CLAUDE_CODE_REMOTE:-}" == "true" || "${AG_CLOUD_INSTALL:-}" == "1" ]]; then
    STDOUT_RESERVED_FOR_JSON=1
fi

log_info() {
    if ((STDOUT_RESERVED_FOR_JSON == 1)); then
        echo "[install-for-cloud] $*" >&2
    else
        echo "[install-for-cloud] $*"
    fi
}
log_error() { echo "[install-for-cloud] ERROR: $*" >&2; }

# ---------------------------------------------------------------------------
# Work in the repository, not in whatever directory the session happens to start
# in. Everything below — the node_modules restore, the .claude generation, the
# readiness report — used relative paths, which silently made this hook a no-op in
# any session with more than one repository attached: the session's cwd is then
# the parent (/home/user), where there is no package.json, so the script took its
# "package.json not found" exit before doing anything. Measured in a cloud session
# with ag-charts + ag-dev-prompts attached: the whole hook did nothing and only
# the setup script's own work was visible.
#
# The script lives at <repo>/external/ag-shared/scripts/install-for-cloud/, so its
# own location identifies the repo without depending on cwd or on
# $CLAUDE_PROJECT_DIR (which is unset in those same multi-repo sessions).
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
if [[ ! -f "$REPO_ROOT/package.json" && -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    REPO_ROOT="$CLAUDE_PROJECT_DIR"
fi
if [[ -f "$REPO_ROOT/package.json" && "$PWD" != "$REPO_ROOT" ]]; then
    log_info "session cwd is ${PWD}; working in ${REPO_ROOT}"
    cd "$REPO_ROOT"
fi

# Cache seeded by cloud-setup.sh (the cloud environment's setup script). It lives
# outside the repo so it survives a re-cloned working tree, and outside $HOME
# because the setup script runs as root while the session runs as another user —
# so /opt/ag-cloud is the path both sides can agree on. The $HOME location stays
# as the fallback for local and worktree runs, where one user owns everything.
if [[ -z "${AG_CLOUD_CACHE_DIR:-}" ]]; then
    if [[ -d /opt/ag-cloud ]]; then
        AG_CLOUD_CACHE_DIR=/opt/ag-cloud
    else
        AG_CLOUD_CACHE_DIR="$HOME/.cache/ag-cloud"
    fi
fi

# ---------------------------------------------------------------------------
# Cloud session PATH — the setup script's environment does not carry over, so
# recover the node it pinned and export it for the rest of the session.
# ---------------------------------------------------------------------------

apply_cached_node_path() {
    local path_file="$AG_CLOUD_CACHE_DIR/node-bin-path"
    [[ -f "$path_file" ]] || return 0

    local bin
    bin="$(head -1 "$path_file")"
    [[ -d "$bin" ]] || return 0

    case ":$PATH:" in
    *":$bin:"*) ;;
    *) export PATH="$bin:$PATH" ;;
    esac

    if [[ -n "${CLAUDE_ENV_FILE:-}" ]]; then
        echo "export PATH=\"$bin:\$PATH\"" >>"$CLAUDE_ENV_FILE"
    fi

    # $CLAUDE_ENV_FILE alone was not enough: a cloud session measured node 22.22.2
    # from the image's /opt/node22/bin while the pinned 22.21.1 sat unused in
    # /opt/nvm. The shell the Bash tool spawns reads the profile, so write there
    # too — guarded, so repeated session starts do not stack copies.
    local marker="# ag-cloud pinned node"
    local rc
    for rc in "$HOME/.bashrc" "$HOME/.profile"; do
        [[ -e "$rc" ]] || continue
        grep -qF "$marker" "$rc" 2>/dev/null && continue
        printf '\n%s\nexport PATH="%s:$PATH"\n' "$marker" "$bin" >>"$rc" 2>/dev/null || true
    done
    log_info "node $(node -v 2>/dev/null || echo '?') from ${bin}"
}

# ---------------------------------------------------------------------------
# node_modules restore — put the cached tree in place when the lockfile still
# matches, turning a multi-minute install into seconds. A lockfile mismatch
# falls through to a real install.
#
# Strategy matters at this size: a real ag-charts node_modules is ~2.3 GB over
# ~200k files, where even a hardlink copy costs over a minute. So:
#   1. reflink copy   — instant on a COW filesystem, cache kept
#   2. move           — instant on the same filesystem, cache consumed, so a
#                       detached re-seed rebuilds it for the next session
#   3. hardlink copy  — metadata only, but minutes at this file count
#   4. plain copy     — last resort
# ---------------------------------------------------------------------------

# Device id of a path — used to keep the move path off a cross-filesystem `mv`,
# which silently degrades to a full copy.
device_of() {
    stat -c %d "$1" 2>/dev/null || stat -f %d "$1" 2>/dev/null
}

same_filesystem() {
    local a b
    a="$(device_of "$1")"
    b="$(device_of "$2")"
    [[ -n "$a" && "$a" == "$b" ]]
}

reseed_cache_detached() {
    local cached="$1"
    [[ -d node_modules ]] || return 0
    # Rebuild the cache out of band: the session is already usable, and the next
    # session needs the cache back. Detached so the hook does not wait on it.
    # Each copy attempt clears staging first: a `cp -al` that creates the
    # directory and then fails leaves it behind, and the plain `cp -a` fallback
    # would treat it as a destination container and produce
    # <staging>/node_modules — a cache whose top level is a single directory.
    nohup bash -c "
        staging='${cached}.staging.\$\$'
        rm -rf \"\$staging\"
        cp -al '$PWD/node_modules' \"\$staging\" 2>/dev/null || {
            rm -rf \"\$staging\"
            cp -a '$PWD/node_modules' \"\$staging\" 2>/dev/null || { rm -rf \"\$staging\"; exit 0; }
        }
        rm -rf '$cached'
        mv \"\$staging\" '$cached'
    " >/dev/null 2>&1 &
    disown 2>/dev/null || true
    log_info "cache re-seed running in the background"
}

restore_node_modules_from_cache() {
    local cached="$AG_CLOUD_CACHE_DIR/node_modules"
    local hash_file="$AG_CLOUD_CACHE_DIR/yarn.lock.sha256"

    [[ -d "$cached" ]] || return 1
    [[ ! -d node_modules ]] || return 1
    [[ -f yarn.lock && -f "$hash_file" ]] || return 1

    local want have
    if command -v sha256sum &>/dev/null; then
        want="$(sha256sum yarn.lock | awk '{print $1}')"
    else
        want="$(shasum -a 256 yarn.lock | awk '{print $1}')"
    fi
    have="$(head -1 "$hash_file")"
    if [[ "$want" != "$have" ]]; then
        log_info "cached node_modules is for a different yarn.lock, ignoring it"
        return 1
    fi

    log_info "restoring node_modules from ${cached}"
    local start=$SECONDS
    local staging="node_modules.restoring.$$"
    rm -rf "$staging"

    if cp -a --reflink=always "$cached" "$staging" 2>/dev/null; then
        mv "$staging" node_modules
        log_info "node_modules restored by reflink in $((SECONDS - start))s"
        return 0
    fi
    rm -rf "$staging"

    if same_filesystem "$cached" "$PWD" && mv "$cached" "$staging" 2>/dev/null; then
        mv "$staging" node_modules
        log_info "node_modules restored by move in $((SECONDS - start))s"
        # Skip the re-seed when the tree is unscripted: the background install is
        # about to run and refreshes the cache itself, and two jobs writing the
        # same cache directory is pure waste.
        if [[ ! -f "$AG_CLOUD_CACHE_DIR/unscripted" ]]; then
            reseed_cache_detached "$cached"
        fi
        return 0
    fi

    # Clear staging between attempts: `cp -al` can create the directory and then
    # fail part way (a cross-device link, a permission error), and `cp -a` onto an
    # existing directory copies *into* it, giving node_modules/node_modules — a
    # tree the fast path below accepts as present while nothing resolves.
    if cp -al "$cached" "$staging" 2>/dev/null; then
        mv "$staging" node_modules
        log_info "node_modules restored by hardlink copy in $((SECONDS - start))s"
        return 0
    fi
    rm -rf "$staging"
    if cp -a "$cached" "$staging" 2>/dev/null; then
        mv "$staging" node_modules
        log_info "node_modules restored by copy in $((SECONDS - start))s"
        return 0
    fi

    rm -rf "$staging"
    log_info "could not restore from cache, falling back to install"
    return 1
}

# ---------------------------------------------------------------------------
# The repo's gitignored Claude Code config — .claude/rules and the repo's own
# .claude/skills. postinstall generates them; a clone carries only
# .claude/settings.json, and cloud-setup.sh installs with --ignore-scripts, so a
# session can arrive with node_modules in place and none of them present.
#
# Generation needs node_modules but not the network, and measures ~3s, which is
# affordable in a hook that the session waits on. It is deliberately NOT done in
# the environment setup script: there, the rulesync fetch for the private prompts
# repository blocked on a git credential prompt and cost a whole environment
# build. Here the same hang would cost one session, and the guards below mean it
# cannot happen at all.
#
# Skills are enumerated at launch, so whether a session surfaces skills generated
# by its own hook depends on Claude Code's startup order — check by asking, not by
# looking at the directory.
# ---------------------------------------------------------------------------

generate_claude_config_if_missing() {
    [[ -d node_modules ]] || return 0
    [[ -d .claude/rules || -d .claude/skills ]] && return 0
    node -e 'process.exit(require("./package.json").scripts["postinstall:setup-prompts"] ? 0 : 1)' 2>/dev/null || return 0

    local start=$SECONDS
    # No prompting, no inherited stdin, and a hard ceiling. Same invocation as
    # postinstall otherwise, so the rendered settings.json matches the committed
    # one and the session's working tree stays clean.
    export GIT_TERMINAL_PROMPT=0
    export GIT_ASKPASS=/bin/true
    if command -v timeout &>/dev/null; then
        timeout 90s yarn run postinstall:setup-prompts </dev/null >/dev/null 2>&1 || true
    else
        yarn run postinstall:setup-prompts </dev/null >/dev/null 2>&1 || true
    fi
    if [[ -d .claude/rules || -d .claude/skills ]]; then
        log_info "generated .claude rules and skills in $((SECONDS - start))s"
    else
        log_info "could not generate .claude rules or skills — repo-local skills will be missing"
    fi
}

# ---------------------------------------------------------------------------
# Telling the session what is missing — cloud sessions only.
#
# Two constraints shape this, both measured rather than assumed:
#
#   - Claude Code waits for SessionStart hooks before processing the first
#     message, so a blocking `yarn install` here freezes the session. One cloud
#     session sat silent for 9+ minutes and never answered.
#   - A detached install does not survive either. An earlier revision ran the
#     install under `nohup … &`; the next session found `started` and a half-written
#     install.log stopping mid-fetch, no process, and a leftover lock directory that
#     then convinced every later hook that "an install is already running". The
#     session's process tree does not outlive the session.
#
# So the hook does no installing at all. It reports what is missing and hands the
# session a foreground command to run, which is work Claude does inside a Bash call
# the session actually waits on.
#
# Local and worktree runs keep the original blocking behaviour: there is a human
# watching a terminal there, and no session to starve.
# ---------------------------------------------------------------------------

deps_state_dir() { echo "${AG_CLOUD_CACHE_DIR}/deps"; }

# A lock is only real while its writer lives. Left behind by a killed session it
# is indistinguishable from a running install, which is exactly how one
# environment wedged into permanently "installing".
clear_stale_lock() {
    local state
    state="$(deps_state_dir)"
    [[ -d "$state/lock" ]] || return 0

    local pid
    pid="$(head -1 "$state/lock/pid" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
        return 0
    fi
    rm -rf "$state/lock"
    log_info "cleared a stale install lock (no live writer)"
}

announce_deps_not_ready() {
    local reason="node_modules is missing or does not match yarn.lock, and no usable cache was found"
    if [[ -f "$AG_CLOUD_CACHE_DIR/unscripted" ]]; then
        reason="the cached node_modules was seeded without postinstall, so patches and plugin builds are still pending"
    fi

    # Absolute paths: with more than one repository attached the session's working
    # directory is the parent (/home/user), not the repo, so relative paths fail.
    local notice
    notice="Dependencies are NOT ready in this cloud session.

Reason: ${reason}.

Until an install completes, builds, tests, lint and any 'yarn nx' command will
fail or behave oddly. Reading and editing files is fine.

Run this before any build/test/lint command — once per session, ~150s:
  bash ${REPO_ROOT}/external/ag-shared/scripts/install-for-cloud/finish-setup.sh

If another session is already installing, wait for it instead:
  bash ${REPO_ROOT}/external/ag-shared/scripts/install-for-cloud/wait-for-deps.sh"

    # The documented SessionStart channel, not bare stdout. The docs say stdout
    # from a SessionStart hook becomes context, but two cloud sessions reported
    # receiving none of it while the same hook's environment changes had clearly
    # applied — so in the cloud harness this notice was being written to nobody.
    # `hookSpecificOutput.additionalContext` is the explicit contract, and it is
    # only parsed when stdout is a single JSON document, so nothing else may print.
    if [[ "$IN_CLOUD_SESSION" == "1" ]] && command -v node &>/dev/null; then
        JSON_NOTICE="$notice"
        export JSON_NOTICE
        node -e '
            process.stdout.write(JSON.stringify({
                hookSpecificOutput: {
                    hookEventName: "SessionStart",
                    additionalContext: process.env.JSON_NOTICE,
                },
            }));
        ' 2>/dev/null && return 0
    fi

    printf '[install-for-cloud] %s\n' "$notice"
}

# ---------------------------------------------------------------------------
# Environment detection — same signals as before
# ---------------------------------------------------------------------------

is_claude_worktree() {
    local check_path="${CLAUDE_PROJECT_DIR:-$PWD}"
    [[ "$check_path" == *".claude-worktrees"* ]]
}

RUN_MODE="skip"
if [[ "${AG_CLOUD_INSTALL:-}" == "1" ]]; then
    log_info "AG_CLOUD_INSTALL set, initializing environment"
    RUN_MODE="full"
elif [[ "${AG_CLOUD_INSTALL:-}" == "0" ]]; then
    log_info "Disabled by AG_CLOUD_INSTALL, skipping environment initialization"
    exit 0
elif [[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]]; then
    log_info "CLAUDE_CODE_REMOTE set, initializing environment"
    RUN_MODE="full"
elif is_claude_worktree; then
    log_info "Claude Code worktree detected"
    RUN_MODE="full"
else
    log_info "No cloud/worktree environment detected, skipping initialization"
    log_info "CLAUDE_PROJECT_DIR: ${CLAUDE_PROJECT_DIR:-}"
    log_info "PWD: $PWD"
    exit 0
fi

# ---------------------------------------------------------------------------
# Cloud sessions: recover the pinned node and the cached dependency tree that
# cloud-setup.sh left behind, before deciding whether an install is needed.
# ---------------------------------------------------------------------------

IN_CLOUD_SESSION=0
if [[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]] || [[ "${AG_CLOUD_INSTALL:-}" == "1" ]]; then
    IN_CLOUD_SESSION=1
    apply_cached_node_path
    clear_stale_lock
    if [[ -f package.json ]]; then
        restore_node_modules_from_cache || true
        generate_claude_config_if_missing
        # Whatever node_modules the session ended up with — restored just now, or
        # inherited from the environment snapshot. A tree built with
        # --ignore-scripts passes the integrity check but has no patches applied,
        # so the fast path below would otherwise call it ready.
        if [[ -d node_modules ]]; then
            if [[ -f "$AG_CLOUD_CACHE_DIR/unscripted" ]]; then
                log_info "node_modules is present but unscripted (no patches yet)"
                announce_deps_not_ready
                exit 0
            fi
        fi
    fi
fi

# ---------------------------------------------------------------------------
# Fast path — if yarn exists and node_modules is present, nothing to do.
# The preinstall-worktree.sh hook handles COW cloning and symlink fixes
# when yarn install is eventually triggered.
# ---------------------------------------------------------------------------

if command -v yarn &>/dev/null && [[ -d node_modules ]]; then
    # Verify lockfile hasn't changed since last install — Yarn 1 writes
    # node_modules/.yarn-integrity which embeds a lockfile hash.
    if yarn check --integrity &>/dev/null; then
        log_info "yarn and node_modules present and valid, skipping bootstrap"
        exit 0
    fi
    log_info "node_modules present but integrity check failed, install needed"
    if [[ "$IN_CLOUD_SESSION" == "1" ]]; then
        announce_deps_not_ready
        exit 0
    fi
    yarn install --prefer-offline
    exit $?
fi

# ---------------------------------------------------------------------------
# Ensure we're in the project directory
# ---------------------------------------------------------------------------

if [[ ! -f package.json ]]; then
    log_error "package.json not found in current directory"
    exit 2
fi

# ---------------------------------------------------------------------------
# Bootstrap: install yarn and nx globally if missing
# ---------------------------------------------------------------------------

install_yarn_if_missing() {
    # Create .yarnrc to ignore engine checks
    cat >.yarnrc <<EOF
--install.ignore-engines true
--run.ignore-engines true
EOF

    if command -v yarn &>/dev/null; then
        log_info "yarn is already installed"
        return 0
    fi

    log_info "Installing yarn@1 globally"
    if ! npm i -g --force yarn@1; then
        log_error "Failed to install yarn@1 globally"
        return 2
    fi
    log_info "yarn@1 installed successfully"
}

install_nx_if_missing() {
    if command -v nx &>/dev/null; then
        log_info "nx is already installed"
        return 0
    fi

    if ! command -v node &>/dev/null; then
        log_error "node is not available"
        return 2
    fi

    local nx_version
    nx_version=$(node -p "require('./package.json').devDependencies.nx" 2>/dev/null) || {
        log_error "Failed to extract nx version from package.json"
        return 2
    }

    log_info "Installing nx@${nx_version} globally"
    if ! yarn global add "nx@${nx_version}"; then
        log_error "Failed to install nx globally"
        return 2
    fi
    log_info "Successfully installed nx@${nx_version}"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
    log_info "Bootstrapping cloud environment"

    if ! install_yarn_if_missing; then
        exit 2
    fi

    if ! install_nx_if_missing; then
        exit 2
    fi

    # In a cloud session the install must not block the SessionStart hook.
    if [[ "$IN_CLOUD_SESSION" == "1" ]]; then
        announce_deps_not_ready
        exit 0
    fi

    # Delegate to yarn install — preinstall-worktree.sh handles COW cloning,
    # symlink fixes, and .nx cache. Postinstall handles patches, plugins, etc.
    log_info "Running yarn install (preinstall hook will handle COW cloning)"
    if ! yarn install --prefer-offline; then
        log_error "yarn install failed"
        exit 2
    fi

    # Verify nx is available
    if command -v nx &>/dev/null; then
        log_info "Bootstrap completed successfully — nx is available"
    else
        log_info "Bootstrap completed — nx may require shell restart to be available in PATH"
    fi

    exit 0
}

main
