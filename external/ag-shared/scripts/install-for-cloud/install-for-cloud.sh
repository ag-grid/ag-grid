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

log_info() { echo "[install-for-cloud] $*"; }
log_error() { echo "[install-for-cloud] ERROR: $*" >&2; }

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
    log_info "node_modules present but integrity check failed, running yarn install"
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
