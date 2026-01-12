#!/bin/bash

# Exit on any error, undefined variable, or pipe failure
set -euo pipefail

export AG_SKIP_NATIVE_DEP_VERSION_CHECK=1
export PUPPETEER_SKIP_DOWNLOAD=true

# Helper function to log info messages to stdout
log_info() {
    echo "[install-for-cloud] $*"
}

# Helper function to log error messages to stderr
log_error() {
    echo "[install-for-cloud] ERROR: $*" >&2
}

# Check if running in a Claude Code worktree (Claude Desktop)
# Uses CLAUDE_PROJECT_DIR (set by Claude Code hooks) or PWD for detection
is_claude_worktree() {
    local check_path="${CLAUDE_PROJECT_DIR:-$PWD}"
    [[ "$check_path" == *".claude-worktrees"* ]]
}

# Derive the root worktree path from current directory
# e.g., /path/to/repo/.claude-worktrees/branch-name -> /path/to/repo
get_root_worktree_path() {
    local check_path="${CLAUDE_PROJECT_DIR:-$PWD}"
    if [[ -n "${ROOT_WORKTREE_PATH:-}" ]]; then
        echo "$ROOT_WORKTREE_PATH"
    elif [[ "$check_path" == *".claude-worktrees"* ]]; then
        echo "${check_path%%/.claude-worktrees/*}"
    else
        echo "$check_path"
    fi
}

# Determine run mode
RUN_MODE="skip"
if [ "${AG_CLOUD_INSTALL:-}" == "1" ]; then
    log_info "AG_CLOUD_INSTALL set, initializing environment"
    RUN_MODE="full"
elif [ "${AG_CLOUD_INSTALL:-}" == "0" ]; then
    log_info "Disabled by AG_CLOUD_INSTALL, skipping environment initialization"
    exit 0
elif [ "${CLAUDE_CODE_REMOTE:-}" == "true" ]; then
    log_info "CLAUDE_CODE_REMOTE set, initializing environment"
    RUN_MODE="full"
elif is_claude_worktree; then
    log_info "Claude Code worktree detected, symlinking nx cache only"
    RUN_MODE="full"
else
    log_info "No cloud/worktree environment detected, skipping initialization"
    log_info "CLAUDE_PROJECT_DIR: $CLAUDE_PROJECT_DIR"
    log_info "PWD: $PWD"
    exit 0
fi

# Ensure we're in the project directory
if [ ! -f package.json ]; then
    log_error "package.json not found in current directory"
    exit 2
fi

# Function to install nx globally
install_nx() {
    if command -v nx &> /dev/null; then
        log_info "nx is already installed, skipping install"
        return 0
    fi

    log_info "Installing nx globally"

    # Check if node is available
    if ! command -v node &> /dev/null; then
        log_error "node is not available"
        return 2
    fi

    # Install Nx globally with the version from package.json
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
    return 0
}

opt_enable_direnv() {
    if ! command -v direnv &> /dev/null; then
        log_info "direnv is not installed, skipping enablement"
        return 0
    fi

    if direnv allow; then
        log_info "direnv enabled successfully"
        return 0
    else
        log_error "Failed to enable direnv"
        return 2
    fi
}

# Function to install yarn and initial dependencies
install_yarn() {
    # Create .yarnrc to ignore engine checks
    cat >.yarnrc <<EOF
--install.ignore-engines true
--run.ignore-engines true
EOF

    if command -v yarn &> /dev/null; then
        log_info "yarn is already installed, skipping install"
        return 0
    fi

    log_info "Installing yarn@1 and initial dependencies"

    # Install yarn v1 globally
    if ! npm i -g --force yarn@1; then
        log_error "Failed to install yarn@1 globally"
        return 2
    fi

    log_info "yarn@1 installed successfully"
}

symlink_nx_cache() {
    if [ -d .nx ]; then
        log_info "nx cache directory already exists, skipping"
        return 0
    fi

    local root_path
    root_path=$(get_root_worktree_path)

    if [ ! -d "${root_path}/.nx" ]; then
        log_info "Root worktree .nx directory not found at ${root_path}"
        return 0
    fi

    mkdir -p .nx
    if [ -d "${root_path}/.nx/cache" ]; then
        log_info "Symlinking nx cache from ${root_path}"
        ln -sf "${root_path}/.nx/cache" .nx/cache
    fi
    if [ -d "${root_path}/.nx/workspace-data" ]; then
        log_info "Copying nx workspace data from ${root_path}"
        cp -r "${root_path}/.nx/workspace-data" .nx/workspace-data
    fi
}

# Try to symlink node_modules from root worktree if lockfiles match
# Returns 0 if symlink was created, 1 if fallback to install needed
try_symlink_node_modules() {
    if ! is_claude_worktree; then
        return 1
    fi

    local root_path
    root_path=$(get_root_worktree_path)

    if [ ! -d "${root_path}/node_modules" ]; then
        log_info "Root worktree node_modules not found, falling back to install"
        return 1
    fi

    if [ ! -f "${root_path}/yarn.lock" ]; then
        log_info "Root worktree yarn.lock not found, falling back to install"
        return 1
    fi

    if ! diff -q "${root_path}/yarn.lock" ./yarn.lock &>/dev/null; then
        log_info "yarn.lock differs from root worktree, falling back to install"
        return 1
    fi

    log_info "yarn.lock matches root worktree, symlinking node_modules"
    if ln -s "${root_path}/node_modules" ./node_modules; then
        log_info "Successfully symlinked node_modules from ${root_path}"
        return 0
    else
        log_error "Failed to symlink node_modules"
        return 1
    fi
}

# Function to install/update dependencies when node_modules exists
install_dependencies() {
    log_info "Checking dependency integrity"

    # Check if dependencies are already installed and valid
    if yarn check --integrity 2>/dev/null; then
        log_info "Dependencies already installed and valid, running postinstall"
        if ! yarn postinstall; then
            log_error "postinstall script failed"
            return 2
        fi
    else
        log_info "Installing/updating dependencies"
        if ! yarn install --ci; then
            log_error "Failed to install dependencies"
            return 2
        fi
        log_info "Dependencies installed successfully"
    fi

    return 0
}

# Main installation logic
main() {
    log_info "Starting installation process (mode: ${RUN_MODE})"

    # Full mode: install dependencies, yarn, nx, etc.
    if [ -d node_modules ]; then
        log_info "node_modules directory exists, checking dependencies"
        if ! install_dependencies; then
            exit 2
        fi
    elif try_symlink_node_modules; then
        # Successfully symlinked node_modules from root worktree
        log_info "Using symlinked node_modules, skipping install"
    else
        log_info "node_modules directory not found, performing fresh install"
        if ! install_yarn; then
            exit 2
        fi
        if ! install_nx; then
            exit 2
        fi

        if ! install_dependencies; then
            exit 2
        fi
    fi

    if ! opt_enable_direnv; then
        exit 2
    fi

    if ! symlink_nx_cache; then
        exit 2
    fi

    # Verify nx is available after installation
    if command -v nx &> /dev/null; then
        log_info "Installation completed successfully - nx is available"
    else
        log_info "Installation completed - nx may require shell restart to be available in PATH"
    fi

    exit 0
}

# Run main function
main
