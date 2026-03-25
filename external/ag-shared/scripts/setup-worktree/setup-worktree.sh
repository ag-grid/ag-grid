#!/bin/bash
# external/ag-shared/scripts/setup-worktree/setup-worktree.sh
# Generic worktree setup for AG projects
#
# Fixes symlinks that break in git worktrees due to relative path resolution.
# Detects project name from git remote to find the correct prompts repo.

set -euo pipefail

log_info() { echo "[setup-worktree] $*"; }
log_error() { echo "[setup-worktree] ERROR: $*" >&2; }

# Detect project name from git remote origin
detect_project_name() {
    local remote_url
    remote_url=$(git remote get-url origin 2>/dev/null || echo "")

    if [[ -z "$remote_url" ]]; then
        echo "ag-grid"  # fallback
        return
    fi

    # Extract repo name from URL (handles both SSH and HTTPS)
    echo "$remote_url" | sed -E 's|.*[:/]([^/]+)\.git$|\1|; s|.*[:/]([^/]+)$|\1|'
}

# Get the main repo root (handles worktrees)
get_main_repo_root() {
    local git_dir
    git_dir=$(git rev-parse --git-dir)

    if [[ -f "$git_dir" ]]; then
        # Worktree: .git is a file containing "gitdir: /path/to/main/.git/worktrees/name"
        local gitdir_path
        gitdir_path=$(sed 's/gitdir: //' "$git_dir")
        # Navigate up from .git/worktrees/name to main repo
        dirname "$(dirname "$(dirname "$gitdir_path")")"
    else
        # Regular repo
        dirname "$git_dir"
    fi
}

# Fix prompts symlink in worktrees
fix_prompts_symlink() {
    local project_name="$1"
    local prompts_dir_name="${project_name}-prompts"
    local main_repo
    main_repo=$(get_main_repo_root)
    local prompts_dir="$main_repo/../$prompts_dir_name"

    if [[ ! -d "$prompts_dir" ]]; then
        log_info "$prompts_dir_name not found at $prompts_dir, skipping symlink fix"
        return 0
    fi

    # Create symlink in worktree parent so relative paths work
    local real_prompts parent_link
    real_prompts=$(cd "$prompts_dir" && pwd)
    parent_link="$(dirname "$(pwd)")/$prompts_dir_name"

    if [[ ! -e "$parent_link" ]] || [[ "$(readlink "$parent_link" 2>/dev/null)" != "$real_prompts" ]]; then
        log_info "Creating parent symlink: $parent_link -> $real_prompts"
        ln -sf "$real_prompts" "$parent_link"
    fi

    # Fix external/prompts symlink if it exists and is broken
    if [[ -L "external/prompts" ]] && [[ ! -e "external/prompts" ]]; then
        log_info "Fixing external/prompts symlink"
        rm -f "external/prompts"
        ln -sf "../../$prompts_dir_name" "external/prompts"
    fi
}

main() {
    # Verify we're in a git worktree (.git is a file, not a directory)
    if [[ ! -f .git ]]; then
        log_error "Not in a git worktree (.git is not a file)"
        exit 1
    fi

    local project_name
    project_name=$(detect_project_name)
    log_info "Detected project: $project_name"

    # Fix prompts symlink
    fix_prompts_symlink "$project_name" || log_error "Failed to fix prompts symlink, continuing anyway"

    # Run install if available
    if [[ -f "./external/ag-shared/scripts/install-for-cloud/install-for-cloud.sh" ]]; then
        export AG_CLOUD_INSTALL=1
        exec ./external/ag-shared/scripts/install-for-cloud/install-for-cloud.sh
    else
        log_info "Running yarn install"
        yarn install --prefer-offline
    fi
}

main "$@"
