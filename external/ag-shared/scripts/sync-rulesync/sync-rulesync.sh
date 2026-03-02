#!/usr/bin/env bash
#
# sync-rulesync.sh - Rulesync configuration synchronization
#
# Ensures rulesync patches and configuration are properly set up in consuming
# repositories. Creates symlinks to shared patches and verifies postinstall
# configuration.
#
# Usage:
#   ./sync-rulesync.sh           # Same as --check
#   ./sync-rulesync.sh --check   # Verify sync status (dry-run)
#   ./sync-rulesync.sh --apply   # Apply sync to current repo
#   ./sync-rulesync.sh --help    # Show help
#
# Exit codes:
#   0 - All checks passed (or successfully applied)
#   1 - Issues found (in --check mode)
#   2 - Failed to apply fixes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Shared patch location (relative to repo root)
SHARED_PATCHES_REL="external/ag-shared/prompts/patches"
PATCH_FILE="rulesync+7.0.0.patch"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track status
ISSUES=0
FIXED=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((ISSUES++)) || true
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((ISSUES++)) || true
}

log_fixed() {
    echo -e "${GREEN}[FIXED]${NC} $1"
    ((FIXED++)) || true
}

# Check if patches directory exists
check_patches_dir() {
    if [[ -d "$REPO_ROOT/patches" ]]; then
        log_success "patches/ directory exists"
        return 0
    else
        log_warn "patches/ directory missing"
        return 1
    fi
}

# Create patches directory
apply_patches_dir() {
    if [[ ! -d "$REPO_ROOT/patches" ]]; then
        mkdir -p "$REPO_ROOT/patches"
        log_fixed "Created patches/ directory"
    fi
}

# Check if patch symlink exists and points to correct location
check_patch_symlink() {
    local patch_path="$REPO_ROOT/patches/$PATCH_FILE"
    local expected_target="../$SHARED_PATCHES_REL/$PATCH_FILE"

    if [[ ! -e "$patch_path" ]]; then
        log_warn "Patch file missing: patches/$PATCH_FILE"
        return 1
    fi

    if [[ ! -L "$patch_path" ]]; then
        log_warn "Patch file is not a symlink: patches/$PATCH_FILE"
        return 1
    fi

    local actual_target
    actual_target=$(readlink "$patch_path")
    if [[ "$actual_target" != "$expected_target" ]]; then
        log_warn "Patch symlink points to wrong location"
        log_info "  Expected: $expected_target"
        log_info "  Actual: $actual_target"
        return 1
    fi

    log_success "Patch symlink correct: patches/$PATCH_FILE -> $expected_target"
    return 0
}

# Create or fix patch symlink
apply_patch_symlink() {
    local patch_path="$REPO_ROOT/patches/$PATCH_FILE"
    local expected_target="../$SHARED_PATCHES_REL/$PATCH_FILE"
    local shared_patch="$REPO_ROOT/$SHARED_PATCHES_REL/$PATCH_FILE"

    # Verify shared patch exists
    if [[ ! -f "$shared_patch" ]]; then
        log_error "Shared patch not found: $SHARED_PATCHES_REL/$PATCH_FILE"
        return 1
    fi

    # Remove existing file/symlink if it exists
    if [[ -e "$patch_path" ]] || [[ -L "$patch_path" ]]; then
        rm "$patch_path"
    fi

    # Create symlink
    ln -s "$expected_target" "$patch_path"
    log_fixed "Created symlink: patches/$PATCH_FILE -> $expected_target"
}

# Check for stale symlinks in .rulesync/ that point to non-existent targets
# Only checks symlinks pointing to external/ag-shared/ or external/prompts/
check_stale_rulesync_symlinks() {
    local rulesync_dir="$REPO_ROOT/.rulesync"
    local stale_count=0
    local stale_links=()

    if [[ ! -d "$rulesync_dir" ]]; then
        return 0
    fi

    # Check if external/prompts exists and is valid (not a broken symlink)
    local prompts_valid=false
    if [[ -d "$REPO_ROOT/external/prompts" ]] && [[ -e "$REPO_ROOT/external/prompts" ]]; then
        prompts_valid=true
    fi

    # Find all symlinks in .rulesync/ subdirectories
    while IFS= read -r -d '' symlink; do
        if [[ ! -L "$symlink" ]]; then
            continue
        fi

        local target
        target=$(readlink "$symlink")

        # Only check symlinks pointing to external/ag-shared/ or external/prompts/
        if [[ "$target" != *"external/ag-shared/"* ]] && [[ "$target" != *"external/prompts/"* ]]; then
            continue
        fi

        # For external/prompts/ symlinks, only flag as stale if external/prompts/ is valid
        if [[ "$target" == *"external/prompts/"* ]] && [[ "$prompts_valid" != "true" ]]; then
            continue
        fi

        # Check if target exists (resolve from symlink's directory)
        local symlink_dir
        symlink_dir=$(dirname "$symlink")
        if [[ ! -e "$symlink_dir/$target" ]]; then
            ((stale_count++)) || true
            local rel_path="${symlink#$REPO_ROOT/}"
            stale_links+=("$rel_path -> $target")
        fi
    done < <(find "$rulesync_dir" -type l -print0 2>/dev/null)

    if [[ $stale_count -gt 0 ]]; then
        log_warn "Found $stale_count stale symlink(s) in .rulesync/"
        for link in "${stale_links[@]}"; do
            log_info "  $link"
        done
        # Store for apply phase
        STALE_SYMLINKS=("${stale_links[@]}")
        return 1
    fi

    log_success "No stale symlinks in .rulesync/"
    return 0
}

# Remove stale symlinks from .rulesync/
apply_remove_stale_symlinks() {
    local rulesync_dir="$REPO_ROOT/.rulesync"

    if [[ ! -d "$rulesync_dir" ]]; then
        return 0
    fi

    # Check if external/prompts exists and is valid
    local prompts_valid=false
    if [[ -d "$REPO_ROOT/external/prompts" ]] && [[ -e "$REPO_ROOT/external/prompts" ]]; then
        prompts_valid=true
    fi

    local removed=0

    while IFS= read -r -d '' symlink; do
        if [[ ! -L "$symlink" ]]; then
            continue
        fi

        local target
        target=$(readlink "$symlink")

        # Only process symlinks pointing to external/ag-shared/ or external/prompts/
        if [[ "$target" != *"external/ag-shared/"* ]] && [[ "$target" != *"external/prompts/"* ]]; then
            continue
        fi

        # For external/prompts/ symlinks, only remove if external/prompts/ is valid
        if [[ "$target" == *"external/prompts/"* ]] && [[ "$prompts_valid" != "true" ]]; then
            continue
        fi

        # Check if target exists
        local symlink_dir
        symlink_dir=$(dirname "$symlink")
        if [[ ! -e "$symlink_dir/$target" ]]; then
            local rel_path="${symlink#$REPO_ROOT/}"
            rm "$symlink"
            log_fixed "Removed stale symlink: $rel_path"
            ((removed++)) || true
        fi
    done < <(find "$rulesync_dir" -type l -print0 2>/dev/null)

    return 0
}

# Check for missing symlinks in .rulesync/commands/ that should exist based on source files
# Skip files with _ prefix as they are internal helper files (e.g., _review-core.md)
check_missing_rulesync_symlinks() {
    local commands_dir="$REPO_ROOT/.rulesync/commands"
    local missing_count=0
    local missing_links=()

    if [[ ! -d "$commands_dir" ]]; then
        return 0
    fi

    # Check external/ag-shared/prompts/commands/ (required)
    local shared_commands="$REPO_ROOT/external/ag-shared/prompts/commands"
    if [[ -d "$shared_commands" ]]; then
        # Find all .md files in subdirectories (pattern: subdir/file.md -> subdir-file.md)
        while IFS= read -r -d '' source_file; do
            local rel_path="${source_file#$shared_commands/}"
            local dir_name=$(dirname "$rel_path")
            local file_name=$(basename "$rel_path")

            # Skip internal helper files (prefixed with _)
            if [[ "$file_name" == _* ]]; then
                continue
            fi

            # Compute expected symlink name: dir/file.md -> dir-file.md
            local symlink_name="${dir_name}-${file_name}"
            local symlink_path="$commands_dir/$symlink_name"
            local expected_target="../../external/ag-shared/prompts/commands/$rel_path"

            if [[ ! -e "$symlink_path" ]]; then
                ((missing_count++)) || true
                missing_links+=("$symlink_name -> $expected_target")
            fi
        done < <(find "$shared_commands" -mindepth 2 -name "*.md" -type f -print0 2>/dev/null)
    fi

    # Check external/prompts/commands/ (optional - only if it exists)
    local private_commands="$REPO_ROOT/external/prompts/commands"
    if [[ -d "$private_commands" ]] && [[ -e "$private_commands" ]]; then
        # Find all top-level .md files (pattern: file.md -> file.md)
        while IFS= read -r -d '' source_file; do
            local file_name=$(basename "$source_file")
            local symlink_path="$commands_dir/$file_name"
            local expected_target="../../external/prompts/commands/$file_name"

            if [[ ! -e "$symlink_path" ]]; then
                ((missing_count++)) || true
                missing_links+=("$file_name -> $expected_target")
            fi
        done < <(find "$private_commands" -maxdepth 1 -name "*.md" -type f -print0 2>/dev/null)
    fi

    if [[ $missing_count -gt 0 ]]; then
        log_warn "Found $missing_count missing symlink(s) in .rulesync/commands/"
        for link in "${missing_links[@]}"; do
            log_info "  $link"
        done
        # Store for apply phase
        MISSING_SYMLINKS=("${missing_links[@]}")
        return 1
    fi

    log_success "No missing symlinks in .rulesync/commands/"
    return 0
}

# Create missing symlinks in .rulesync/commands/
# Skip files with _ prefix as they are internal helper files (e.g., _review-core.md)
apply_create_missing_symlinks() {
    local commands_dir="$REPO_ROOT/.rulesync/commands"

    if [[ ! -d "$commands_dir" ]]; then
        mkdir -p "$commands_dir"
    fi

    local created=0

    # Check external/ag-shared/prompts/commands/ (required)
    local shared_commands="$REPO_ROOT/external/ag-shared/prompts/commands"
    if [[ -d "$shared_commands" ]]; then
        while IFS= read -r -d '' source_file; do
            local rel_path="${source_file#$shared_commands/}"
            local dir_name=$(dirname "$rel_path")
            local file_name=$(basename "$rel_path")

            # Skip internal helper files (prefixed with _)
            if [[ "$file_name" == _* ]]; then
                continue
            fi

            local symlink_name="${dir_name}-${file_name}"
            local symlink_path="$commands_dir/$symlink_name"
            local expected_target="../../external/ag-shared/prompts/commands/$rel_path"

            if [[ ! -e "$symlink_path" ]]; then
                ln -s "$expected_target" "$symlink_path"
                log_fixed "Created symlink: .rulesync/commands/$symlink_name"
                ((created++)) || true
            fi
        done < <(find "$shared_commands" -mindepth 2 -name "*.md" -type f -print0 2>/dev/null)
    fi

    # Check external/prompts/commands/ (optional)
    local private_commands="$REPO_ROOT/external/prompts/commands"
    if [[ -d "$private_commands" ]] && [[ -e "$private_commands" ]]; then
        while IFS= read -r -d '' source_file; do
            local file_name=$(basename "$source_file")
            local symlink_path="$commands_dir/$file_name"
            local expected_target="../../external/prompts/commands/$file_name"

            if [[ ! -e "$symlink_path" ]]; then
                ln -s "$expected_target" "$symlink_path"
                log_fixed "Created symlink: .rulesync/commands/$file_name"
                ((created++)) || true
            fi
        done < <(find "$private_commands" -maxdepth 1 -name "*.md" -type f -print0 2>/dev/null)
    fi

    return 0
}

# Check for missing skill directories in .rulesync/skills/ that should exist based on source
# Skills are directories containing a SKILL.md file
check_missing_rulesync_skills() {
    local skills_dir="$REPO_ROOT/.rulesync/skills"
    local missing_count=0
    local missing_links=()

    # Check external/ag-shared/prompts/skills/ (required)
    local shared_skills="$REPO_ROOT/external/ag-shared/prompts/skills"
    if [[ -d "$shared_skills" ]]; then
        # Find all skill directories (contain SKILL.md)
        while IFS= read -r -d '' skill_file; do
            local skill_dir
            skill_dir=$(dirname "$skill_file")
            local skill_name
            skill_name=$(basename "$skill_dir")
            local target_path="$skills_dir/$skill_name"
            local expected_target="../../external/ag-shared/prompts/skills/$skill_name"

            if [[ ! -e "$target_path" ]]; then
                ((missing_count++)) || true
                missing_links+=("$skill_name -> $expected_target")
            fi
        done < <(find "$shared_skills" -name "SKILL.md" -type f -print0 2>/dev/null)
    fi

    # Check external/prompts/skills/ (optional - only if it exists)
    local private_skills="$REPO_ROOT/external/prompts/skills"
    if [[ -d "$private_skills" ]] && [[ -e "$private_skills" ]]; then
        while IFS= read -r -d '' skill_file; do
            local skill_dir
            skill_dir=$(dirname "$skill_file")
            local skill_name
            skill_name=$(basename "$skill_dir")
            local target_path="$skills_dir/$skill_name"
            local expected_target="../../external/prompts/skills/$skill_name"

            if [[ ! -e "$target_path" ]]; then
                ((missing_count++)) || true
                missing_links+=("$skill_name -> $expected_target")
            fi
        done < <(find "$private_skills" -name "SKILL.md" -type f -print0 2>/dev/null)
    fi

    if [[ $missing_count -gt 0 ]]; then
        log_warn "Found $missing_count missing skill(s) in .rulesync/skills/"
        for link in "${missing_links[@]}"; do
            log_info "  $link"
        done
        return 1
    fi

    log_success "No missing skills in .rulesync/skills/"
    return 0
}

# Create missing skill symlinks in .rulesync/skills/
apply_create_missing_skills() {
    local skills_dir="$REPO_ROOT/.rulesync/skills"

    if [[ ! -d "$skills_dir" ]]; then
        mkdir -p "$skills_dir"
    fi

    local created=0

    # Check external/ag-shared/prompts/skills/ (required)
    local shared_skills="$REPO_ROOT/external/ag-shared/prompts/skills"
    if [[ -d "$shared_skills" ]]; then
        while IFS= read -r -d '' skill_file; do
            local skill_dir
            skill_dir=$(dirname "$skill_file")
            local skill_name
            skill_name=$(basename "$skill_dir")
            local target_path="$skills_dir/$skill_name"
            local expected_target="../../external/ag-shared/prompts/skills/$skill_name"

            if [[ ! -e "$target_path" ]]; then
                ln -sfn "$expected_target" "$target_path"
                log_fixed "Created skill symlink: .rulesync/skills/$skill_name"
                ((created++)) || true
            fi
        done < <(find "$shared_skills" -name "SKILL.md" -type f -print0 2>/dev/null)
    fi

    # Check external/prompts/skills/ (optional)
    local private_skills="$REPO_ROOT/external/prompts/skills"
    if [[ -d "$private_skills" ]] && [[ -e "$private_skills" ]]; then
        while IFS= read -r -d '' skill_file; do
            local skill_dir
            skill_dir=$(dirname "$skill_file")
            local skill_name
            skill_name=$(basename "$skill_dir")
            local target_path="$skills_dir/$skill_name"
            local expected_target="../../external/prompts/skills/$skill_name"

            if [[ ! -e "$target_path" ]]; then
                ln -sfn "$expected_target" "$target_path"
                log_fixed "Created skill symlink: .rulesync/skills/$skill_name"
                ((created++)) || true
            fi
        done < <(find "$private_skills" -name "SKILL.md" -type f -print0 2>/dev/null)
    fi

    return 0
}

# Regenerate AGENTS.md using rulesync
regenerate_agents_md() {
    log_info "Regenerating AGENTS.md..."

    cd "$REPO_ROOT"

    # Run rulesync to regenerate AGENTS.md using the dedicated agentsmd target
    local output
    local exit_code=0
    output=$(npx rulesync generate \
        --targets=agentsmd \
        --features=rules \
        --delete 2>&1) || exit_code=$?

    if [[ $exit_code -eq 0 ]]; then
        log_fixed "Regenerated AGENTS.md"
        return 0
    else
        log_error "Failed to regenerate AGENTS.md"
        log_info "  $output"
        return 1
    fi
}

# Check if postinstall includes patch-package
check_postinstall() {
    local package_json="$REPO_ROOT/package.json"

    if [[ ! -f "$package_json" ]]; then
        log_error "package.json not found"
        return 1
    fi

    # Check for patch-package in postinstall chain
    # Handles both direct invocation and npm-run-all patterns (postinstall:patch)
    local postinstall_script
    local postinstall_patch_script
    postinstall_script=$(node -p "try { require('$package_json').scripts?.postinstall || '' } catch { '' }" 2>/dev/null || echo "")
    postinstall_patch_script=$(node -p "try { require('$package_json').scripts?.['postinstall:patch'] || '' } catch { '' }" 2>/dev/null || echo "")

    if [[ -z "$postinstall_script" ]]; then
        log_warn "No postinstall script found in package.json"
        log_info "  Add a postinstall script that runs 'patch-package'"
        return 1
    fi

    # Direct invocation: postinstall contains patch-package
    if [[ "$postinstall_script" == *"patch-package"* ]]; then
        log_success "package.json postinstall includes patch-package"
        return 0
    fi

    # Direct invocation: postinstall:patch contains apply-patches.sh
    if [[ "$postinstall_script" == *"apply-patches.sh"* ]]; then
        log_success "package.json postinstall uses apply-patches.sh"
        return 0
    fi

    # Indirect via npm-run-all: postinstall runs postinstall:* and postinstall:patch exists
    if [[ "$postinstall_script" == *"postinstall:*"* ]]; then
        # Check for direct patch-package in postinstall:patch
        if [[ "$postinstall_patch_script" == *"patch-package"* ]]; then
            log_success "package.json postinstall:patch includes patch-package"
            return 0
        fi
        # Check for apply-patches.sh script (calls patch-package internally)
        if [[ "$postinstall_patch_script" == *"apply-patches.sh"* ]]; then
            log_success "package.json postinstall:patch uses apply-patches.sh"
            return 0
        fi
    fi

    log_warn "postinstall script does not invoke patch-package"
    log_info "  Current postinstall: $postinstall_script"
    log_info "  Add 'patch-package' to your postinstall script"
    return 1
}

# Show help
show_help() {
    echo "Usage: sync-rulesync.sh [OPTIONS]"
    echo ""
    echo "Ensures rulesync patches are properly configured in this repository."
    echo ""
    echo "Options:"
    echo "  --check   Verify sync status without making changes (default)"
    echo "  --apply   Apply fixes for any issues found"
    echo "  --help    Show this help message"
    echo ""
    echo "What it checks/applies:"
    echo "  - patches/ directory exists"
    echo "  - patches/$PATCH_FILE symlink points to shared location"
    echo "  - package.json postinstall includes patch-package"
    echo "  - .rulesync/ has no stale symlinks to external/ag-shared/ or external/prompts/"
    echo "  - .rulesync/commands/ has all expected symlinks from external/ag-shared/prompts/commands/"
    echo "    and external/prompts/commands/ (if present)"
    echo "  - .rulesync/skills/ has all expected symlinks from external/ag-shared/prompts/skills/"
    echo "    and external/prompts/skills/ (if present)"
    echo "  - AGENTS.md is regenerated (--apply only)"
    echo ""
    echo "Shared patch location: $SHARED_PATCHES_REL/$PATCH_FILE"
}

# Main
main() {
    local mode="check"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check)
                mode="check"
                shift
                ;;
            --apply)
                mode="apply"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                show_help
                exit 1
                ;;
        esac
    done

    echo ""
    echo "========================================"
    echo "  Rulesync Configuration Sync"
    echo "========================================"
    echo ""
    echo "Repository: $REPO_ROOT"
    echo "Mode: $mode"
    echo ""

    case $mode in
        check)
            check_patches_dir || true
            check_patch_symlink || true
            check_postinstall || true
            check_stale_rulesync_symlinks || true
            check_missing_rulesync_symlinks || true
            check_missing_rulesync_skills || true
            ;;
        apply)
            # Check and fix patches directory
            if ! check_patches_dir; then
                apply_patches_dir
            fi

            # Check and fix patch symlink
            if ! check_patch_symlink; then
                apply_patch_symlink
            fi

            # Check postinstall (can only warn, not auto-fix)
            check_postinstall || true

            # Check and remove stale symlinks
            if ! check_stale_rulesync_symlinks; then
                apply_remove_stale_symlinks
            fi

            # Check and create missing symlinks
            if ! check_missing_rulesync_symlinks; then
                apply_create_missing_symlinks
            fi

            # Check and create missing skills
            if ! check_missing_rulesync_skills; then
                apply_create_missing_skills
            fi

            # Regenerate AGENTS.md to ensure it's up to date
            regenerate_agents_md || true
            ;;
    esac

    echo ""
    echo "========================================"
    if [[ $mode == "apply" ]] && [[ $FIXED -gt 0 ]]; then
        echo -e "  ${GREEN}Applied $FIXED fix(es)${NC}"
    fi
    if [[ $ISSUES -gt 0 ]]; then
        echo -e "  ${YELLOW}$ISSUES issue(s) found${NC}"
        if [[ $mode == "check" ]]; then
            echo "  Run with --apply to fix"
        fi
        echo "========================================"
        exit 1
    else
        echo -e "  ${GREEN}All checks passed${NC}"
        echo "========================================"
        exit 0
    fi
}

main "$@"
