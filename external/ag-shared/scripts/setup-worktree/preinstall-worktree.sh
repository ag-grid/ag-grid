#!/bin/bash
# external/ag-shared/scripts/setup-worktree/preinstall-worktree.sh
#
# Yarn preinstall hook for worktree and cloud environments.
# Detects the environment and prepares for yarn install:
#   - Fixes broken symlinks in git worktrees
#   - COW-clones node_modules from the main repo (APFS cp -cR, rsync fallback)
#   - COW-clones .nx cache
#   - Creates .yarnrc for engine check bypass in cloud
#
# In local (non-worktree, non-cloud) checkouts, exits immediately (<20ms).

set -euo pipefail

# Recursion guard — if we're already inside a preinstall triggered by this
# script (e.g. install-for-cloud.sh calling yarn install), skip.
if [[ "${AG_PREINSTALL_ACTIVE:-}" == "1" ]]; then
    exit 0
fi
export AG_PREINSTALL_ACTIVE=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

log_info() { echo "[preinstall-worktree] $*"; }
log_error() { echo "[preinstall-worktree] ERROR: $*" >&2; }

# ---------------------------------------------------------------------------
# Environment detection
# ---------------------------------------------------------------------------

detect_mode() {
    # Cloud environment (remote Claude Code, explicit flag)
    if [[ "${CLAUDE_CODE_REMOTE:-}" == "true" ]] || [[ "${AG_CLOUD_INSTALL:-}" == "1" ]]; then
        echo "cloud"; return
    fi

    # Worktree detection: .git is a file, not a directory
    if [[ -f "$REPO_ROOT/.git" ]]; then
        echo "worktree"; return
    fi

    echo "local"
}

# ---------------------------------------------------------------------------
# COW source resolution — find the main repo to clone node_modules from
# ---------------------------------------------------------------------------

get_cow_source() {
    # NOTE: this function returns a path via stdout, so all log_info calls
    # must redirect to stderr to avoid corrupting the captured value.

    # Explicit override (set by claude-worktree-create.sh)
    if [[ -n "${ROOT_WORKTREE_PATH:-}" ]] && [[ -d "${ROOT_WORKTREE_PATH}/node_modules" ]]; then
        log_info "COW source: ROOT_WORKTREE_PATH=${ROOT_WORKTREE_PATH}" >&2
        echo "$ROOT_WORKTREE_PATH"; return
    fi

    # Claude Code worktree: derive from .claude-worktrees path
    local check_path="${CLAUDE_PROJECT_DIR:-$PWD}"
    if [[ "$check_path" == *".claude-worktrees"* ]]; then
        local root="${check_path%%/.claude-worktrees/*}"
        if [[ -d "$root/node_modules" ]]; then
            log_info "COW source: .claude-worktrees root=${root}" >&2
            echo "$root"; return
        fi
    fi

    # Git worktree: parse .git file to find main repo
    if [[ -f "$REPO_ROOT/.git" ]]; then
        local gitdir_path
        gitdir_path=$(sed 's/gitdir: //' "$REPO_ROOT/.git")

        # gitdir points to <main-repo>/.git/worktrees/<name>
        # Resolve relative paths against REPO_ROOT
        if [[ "$gitdir_path" != /* ]]; then
            gitdir_path="$REPO_ROOT/$gitdir_path"
        fi

        local main_repo
        main_repo=$(dirname "$(dirname "$(dirname "$gitdir_path")")")

        if [[ -d "$main_repo/node_modules" ]]; then
            log_info "COW source: main repo=${main_repo}" >&2
            echo "$main_repo"; return
        fi
        log_info "Main repo ${main_repo} has no node_modules, skipping COW" >&2
    fi

    log_info "No COW source found" >&2
    echo ""
}

# ---------------------------------------------------------------------------
# Broken symlink fix for worktrees
# ---------------------------------------------------------------------------
#
# Relative symlinks in external/ (e.g. ../../ag-grid-documentation) resolve from
# the main repo's parent directory. In a worktree at a different filesystem
# path, these break because ../../ points to the wrong parent.
#
# Fix: for each broken symlink in external/, resolve the real target via the
# main repo, then create a sibling symlink in the worktree's parent directory
# so the same relative path resolves correctly.

get_main_repo_root() {
    if [[ -f "$REPO_ROOT/.git" ]]; then
        # Worktree: .git is a file containing "gitdir: /path/to/main/.git/worktrees/name"
        local gitdir_path
        gitdir_path=$(sed 's/gitdir: //' "$REPO_ROOT/.git")
        if [[ "$gitdir_path" != /* ]]; then
            gitdir_path="$REPO_ROOT/$gitdir_path"
        fi
        # Navigate up from .git/worktrees/name to main repo
        dirname "$(dirname "$(dirname "$gitdir_path")")"
    else
        echo "$REPO_ROOT"
    fi
}

fix_broken_external_symlinks() {
    local main_repo
    main_repo=$(get_main_repo_root)

    # Nothing to fix if we are the main repo
    if [[ "$main_repo" == "$REPO_ROOT" ]]; then
        return 0
    fi

    local worktree_parent
    worktree_parent="$(dirname "$REPO_ROOT")"

    local main_parent
    main_parent="$(dirname "$main_repo")"

    # Scan external/ for broken symlinks
    local link
    for link in "$REPO_ROOT/external/"*; do
        # Skip non-symlinks
        [[ -L "$link" ]] || continue
        # Skip symlinks that already resolve
        [[ ! -e "$link" ]] || continue

        local link_target
        link_target=$(readlink "$link")
        local link_name
        link_name=$(basename "$link")

        # Resolve the real target via the main repo
        local main_link="$main_repo/external/$link_name"
        if [[ ! -e "$main_link" ]]; then
            log_info "Broken symlink $link_name: target does not exist in main repo either, skipping"
            continue
        fi

        local real_target
        real_target=$(cd "$main_repo/external" && cd "$(dirname "$link_target")" && pwd)/$(basename "$link_target")
        # Strip trailing slash for directories
        real_target="${real_target%/}"

        if [[ ! -e "$real_target" ]]; then
            log_info "Broken symlink $link_name: resolved target $real_target does not exist, skipping"
            continue
        fi

        # The relative symlink is e.g. ../../some-dir — extract the target directory name
        # that needs to exist as a sibling of the worktree
        local relative_dir
        relative_dir=$(basename "$real_target")

        # If the symlink has intermediate path components (e.g. ../../ag-grid-documentation/docs/),
        # we need the first component after ../../
        local first_component
        first_component=$(echo "$link_target" | sed -E 's|^\.\./\.\./||; s|/.*||')

        local real_first_component_path="$main_parent/$first_component"
        if [[ ! -e "$real_first_component_path" ]]; then
            log_info "Broken symlink $link_name: source $real_first_component_path does not exist, skipping"
            continue
        fi

        real_first_component_path=$(cd "$real_first_component_path" && pwd)

        local parent_link="$worktree_parent/$first_component"
        if [[ -e "$parent_link" ]] && [[ ! -L "$parent_link" ]]; then
            # Real directory/file exists — do not replace it with a symlink
            log_info "Skipping $parent_link: exists as a real path (not a symlink)"
        elif [[ ! -e "$parent_link" ]] || [[ "$(readlink "$parent_link" 2>/dev/null)" != "$real_first_component_path" ]]; then
            log_info "Creating parent symlink: $parent_link -> $real_first_component_path"
            ln -sf "$real_first_component_path" "$parent_link"
        fi

        # Verify the original symlink now resolves
        if [[ -e "$link" ]]; then
            log_info "Fixed broken symlink: external/$link_name"
        else
            log_info "Parent symlink created but external/$link_name still broken, skipping"
        fi
    done
}

# ---------------------------------------------------------------------------
# COW clone helpers (from install-for-cloud.sh)
# ---------------------------------------------------------------------------

clone_directory() {
    local src="$1" dest="$2"
    if cp -cR "${src}/" "${dest}/" 2>/dev/null; then
        return 0
    fi
    if rsync -a "${src}/" "${dest}/"; then
        return 0
    fi
    return 1
}

try_cow_clone_node_modules() {
    local source="$1"

    # Already have node_modules? Skip.
    if [[ -d "$REPO_ROOT/node_modules" ]]; then
        log_info "node_modules/ already exists, skipping COW clone"
        return 0
    fi

    # Verify source has node_modules and matching lockfile
    if [[ ! -d "$source/node_modules" ]]; then
        log_info "Source ${source}/node_modules not found, skipping COW clone"
        return 1
    fi
    if [[ ! -f "$source/yarn.lock" ]]; then
        log_info "Source ${source}/yarn.lock not found, skipping COW clone"
        return 1
    fi
    if ! diff -q "$source/yarn.lock" "$REPO_ROOT/yarn.lock" &>/dev/null; then
        log_info "yarn.lock differs from source, skipping COW clone"
        return 1
    fi

    log_info "COW-cloning node_modules from $source"
    if clone_directory "$source/node_modules" "$REPO_ROOT/node_modules"; then
        log_info "Successfully cloned node_modules"
    else
        log_error "Failed to clone node_modules"
        rm -rf "$REPO_ROOT/node_modules"
        return 1
    fi

    # Clone nested workspace node_modules (Yarn 1 nohoist/version conflicts)
    local nested
    while IFS= read -r nested; do
        local rel_path="${nested#${source}/}"
        if [[ ! -d "$REPO_ROOT/${rel_path}" ]]; then
            mkdir -p "$(dirname "$REPO_ROOT/${rel_path}")"
            if clone_directory "${nested}" "$REPO_ROOT/${rel_path}"; then
                log_info "Cloned nested ${rel_path}"
            else
                log_info "Failed to clone nested ${rel_path}, skipping"
            fi
        fi
    done < <(find "${source}" -name "node_modules" -type d \
        -not -path "${source}/node_modules/*" \
        -not -path "${source}/node_modules" \
        -maxdepth 3 2>/dev/null)

    return 0
}

try_cow_clone_nx_cache() {
    local source="$1"

    if [[ -d "$REPO_ROOT/.nx" ]]; then
        log_info ".nx cache already exists, skipping"
        return 0
    fi

    if [[ ! -d "$source/.nx" ]]; then
        return 0
    fi

    log_info "COW-cloning .nx cache from $source"
    if clone_directory "$source/.nx" "$REPO_ROOT/.nx"; then
        log_info "Successfully cloned .nx cache"
    else
        log_info "Failed to clone .nx cache, continuing without it"
        rm -rf "$REPO_ROOT/.nx"
    fi
}

# ---------------------------------------------------------------------------
# Cloud-specific setup
# ---------------------------------------------------------------------------

create_yarnrc() {
    cat >"$REPO_ROOT/.yarnrc" <<EOF
--install.ignore-engines true
--run.ignore-engines true
EOF
    log_info "Created .yarnrc with engine bypass"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
    local mode
    mode=$(detect_mode)

    log_info "Mode: ${mode} (REPO_ROOT=${REPO_ROOT})"

    case "$mode" in
        local)
            exit 0
            ;;
        worktree)
            fix_broken_external_symlinks || log_error "Failed to fix external symlinks, continuing"

            local source
            source=$(get_cow_source)
            if [[ -n "$source" ]]; then
                try_cow_clone_node_modules "$source" || true
                try_cow_clone_nx_cache "$source"
            fi
            ;;
        cloud)
            create_yarnrc

            # Cloud mode may also be a worktree (e.g. CLAUDE_CODE_REMOTE=true
            # in a remote environment). Fix symlinks if so.
            if [[ -f "$REPO_ROOT/.git" ]]; then
                fix_broken_external_symlinks || log_error "Failed to fix external symlinks, continuing"
            fi

            local source
            source=$(get_cow_source)
            if [[ -n "$source" ]]; then
                try_cow_clone_node_modules "$source" || true
                try_cow_clone_nx_cache "$source"
            fi
            ;;
    esac

    log_info "Preinstall setup complete"
}

main
