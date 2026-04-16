#!/usr/bin/env bash
#
# verify-rulesync.sh - Rulesync integrity verification
#
# Verifies that rulesync does not inject malicious content when generating
# AI tool configurations. Compares generated output against source files
# to detect any content modifications or unexpected file additions.
#
# Usage:
#   ./verify-rulesync.sh [repo-root] [target]
#   ./verify-rulesync.sh .          claudecode
#   ./verify-rulesync.sh .          codexcli
#
# Exit codes:
#   0 - All verifications passed
#   1 - Unexpected files detected (potential injection)
#   2 - Content mismatch detected (content modified)
#   3 - Missing expected files
#   4 - Rulesync execution failed
#   5 - Pre-flight check failed

set -euo pipefail

# Configuration
REPO_ROOT="${1:-.}"
TARGET="${2:-claudecode}"

# Resolve to absolute path
REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create temp directory and ensure cleanup on exit
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Track verification state
ERRORS=0
WARNINGS=0

# =============================================================================
# Utility Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((ERRORS++)) || true
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++)) || true
}

# Strip YAML frontmatter from markdown file, return only content body
# Handles files with or without frontmatter
# Uses macOS-compatible awk (avoids ! operator in conditions)
strip_frontmatter() {
    local file="$1"
    # Check if file starts with frontmatter
    if head -1 "$file" | grep -q '^---[[:space:]]*$'; then
        # File has frontmatter - skip it
        # NR==1 matches opening ---, then look for closing ---
        awk 'NR==1 && /^---/ { start=1; next } start==1 && end==0 && /^---/ { end=NR; next } end > 0 { print }' "$file"
    else
        # No frontmatter - return entire file
        cat "$file"
    fi
}

# Resolve symlink to actual file path
resolve_symlink() {
    local path="$1"
    if [[ -L "$path" ]]; then
        # Use readlink -f on Linux, or manual resolution on macOS
        if readlink -f "$path" 2>/dev/null; then
            return
        fi
        # macOS fallback
        local dir
        dir=$(dirname "$path")
        local link
        link=$(readlink "$path")
        if [[ "$link" == /* ]]; then
            echo "$link"
        else
            echo "$(cd "$dir" && cd "$(dirname "$link")" && pwd)/$(basename "$link")"
        fi
    else
        echo "$path"
    fi
}

# Compute SHA256 hash of content after stripping frontmatter
content_hash() {
    local file="$1"
    strip_frontmatter "$file" | shasum -a 256 | cut -d' ' -f1
}

# Normalise whitespace for comparison
# - Trim trailing whitespace from each line
# - Normalise line endings
# - Remove leading blank lines
# - Remove trailing blank lines (macOS compatible)
normalise_content() {
    sed 's/[[:space:]]*$//' | tr -d '\r' | sed '/./,$!d' | awk 'NF {p=1} p' | tac 2>/dev/null | awk 'NF {p=1} p' | tac 2>/dev/null || cat
}

# =============================================================================
# Target-specific Configuration
# =============================================================================

get_output_dir() {
    case "$TARGET" in
        claudecode)
            echo ".claude"
            ;;
        codexcli)
            echo ".codex"
            ;;
        *)
            echo ".claude"
            ;;
    esac
}

get_rules_output_dir() {
    case "$TARGET" in
        claudecode)
            echo "rules"
            ;;
        codexcli)
            echo "memories"
            ;;
        *)
            echo "rules"
            ;;
    esac
}

get_root_rule_name() {
    case "$TARGET" in
        claudecode)
            echo "CLAUDE.md"
            ;;
        codexcli)
            echo "AGENTS.md"
            ;;
        *)
            echo "CLAUDE.md"
            ;;
    esac
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

preflight_checks() {
    log_info "Running pre-flight checks..."

    # Check .rulesync directory exists
    if [[ ! -d "$REPO_ROOT/.rulesync" ]]; then
        log_error ".rulesync directory not found at $REPO_ROOT/.rulesync"
        exit 5
    fi

    # Check rulesync is available
    if ! command -v npx &>/dev/null; then
        log_error "npx not found - please install Node.js"
        exit 5
    fi

    log_success "Pre-flight checks passed"
}

# =============================================================================
# Generate to Temp Directory
# =============================================================================

generate_to_temp() {
    log_info "Setting up temp directory for setup-prompts.sh..."
    log_info "Target: $TARGET"
    log_info "Temp dir: $TEMP_DIR"

    cd "$TEMP_DIR"

    # Initialize git repo (required for stash/restore_agents_md in setup-prompts.sh)
    git init --quiet

    # Copy .rulesync/ to temp directory
    log_info "Copying .rulesync/ to temp directory..."
    cp -R "$REPO_ROOT/.rulesync" "$TEMP_DIR/.rulesync"

    # Resolve symlinks in the copied .rulesync to actual file content
    # This is needed because symlinks point to relative paths that won't work in temp
    # Handles both top-level files and files in subdirectories (e.g., rules/data-engine/)
    while IFS= read -r -d '' f; do
        if [[ -L "$f" ]]; then
            local target
            target=$(resolve_symlink "$REPO_ROOT/.rulesync/${f#$TEMP_DIR/.rulesync/}")
            rm "$f"
            cp "$target" "$f"
        fi
    done < <(find "$TEMP_DIR/.rulesync/commands" "$TEMP_DIR/.rulesync/subagents" "$TEMP_DIR/.rulesync/rules" -name "*.md" -print0 2>/dev/null) || true

    # Copy original AGENTS.md from repo (the expected final state)
    if [[ -f "$REPO_ROOT/AGENTS.md" ]]; then
        cp "$REPO_ROOT/AGENTS.md" "$TEMP_DIR/AGENTS.md"
    else
        touch "$TEMP_DIR/AGENTS.md"
    fi
    git add AGENTS.md
    # Use inline config for git identity to avoid relying on global config (may be unset in CI)
    git -c user.name="verify-rulesync" -c user.email="verify@localhost" commit -m "initial" --quiet

    # Symlink node_modules for rulesync binary
    ln -s "$REPO_ROOT/node_modules" "$TEMP_DIR/node_modules"

    # Symlink external directory for script dependencies
    ln -s "$REPO_ROOT/external" "$TEMP_DIR/external"

    # Run setup-prompts.sh with specific target and postinstall flag
    # Use SETUP_PROMPTS_REPO_ROOT to override the repo root to our temp directory
    # This will: 1) run rulesync, 2) reset AGENTS.md to committed state (for codexcli)
    if ! SETUP_PROMPTS_REPO_ROOT="$TEMP_DIR" "$REPO_ROOT/external/ag-shared/scripts/setup-prompts/setup-prompts.sh" \
        --targets="$TARGET" --postinstall 2>&1; then
        log_error "setup-prompts.sh execution failed"
        exit 4
    fi

    cd "$REPO_ROOT"
    log_success "setup-prompts.sh completed successfully"
}

# =============================================================================
# Build Expected File Inventory
# =============================================================================

build_expected_inventory() {
    log_info "Building expected file inventory from .rulesync/..."

    local output_dir
    output_dir=$(get_output_dir)
    local rules_dir
    rules_dir=$(get_rules_output_dir)
    local root_rule
    root_rule=$(get_root_rule_name)

    # Array to hold expected files (relative to output_dir)
    EXPECTED_FILES=()

    # Find root rule (has root: true in frontmatter)
    local root_rule_source=""
    for rule_file in "$REPO_ROOT/.rulesync/rules/"*.md; do
        if [[ -f "$rule_file" ]] && grep -q "^root:[[:space:]]*true" "$rule_file"; then
            root_rule_source="$rule_file"
            # Root rule becomes CLAUDE.md or AGENTS.md
            if [[ "$TARGET" == "claudecode" ]]; then
                # CLAUDE.md is at repo root, not inside .claude/
                EXPECTED_FILES+=("../$root_rule")
            else
                # For codexcli, root goes to repo root as AGENTS.md
                EXPECTED_FILES+=("../$root_rule")
            fi
            break
        fi
    done

    # Non-root rules go to rules/ or memories/
    for rule_file in "$REPO_ROOT/.rulesync/rules/"*.md; do
        if [[ -f "$rule_file" ]] && [[ "$rule_file" != "$root_rule_source" ]]; then
            local basename
            basename=$(basename "$rule_file")
            EXPECTED_FILES+=("$rules_dir/$basename")
        fi
    done

    # Rules in subdirectories (e.g., rules/data-engine/*.md)
    while IFS= read -r -d '' rule_file; do
        local rel_path="${rule_file#$REPO_ROOT/.rulesync/rules/}"
        EXPECTED_FILES+=("$rules_dir/$rel_path")
    done < <(find "$REPO_ROOT/.rulesync/rules" -mindepth 2 -type f -name "*.md" -print0 2>/dev/null)

    # Commands (claudecode only - goes to commands/)
    # Skip files with _ prefix as they are internal helper files (e.g., _review-core.md)
    if [[ "$TARGET" == "claudecode" ]] && [[ -d "$REPO_ROOT/.rulesync/commands" ]]; then
        for cmd_file in "$REPO_ROOT/.rulesync/commands/"*.md; do
            if [[ -f "$cmd_file" ]]; then
                local basename
                basename=$(basename "$cmd_file")
                # Skip internal helper files (prefixed with _)
                if [[ "$basename" == _* ]]; then
                    continue
                fi
                EXPECTED_FILES+=("commands/$basename")
            fi
        done
    fi

    # Subagents (claudecode only - goes to agents/)
    if [[ "$TARGET" == "claudecode" ]] && [[ -d "$REPO_ROOT/.rulesync/subagents" ]]; then
        for agent_file in "$REPO_ROOT/.rulesync/subagents/"*.md; do
            if [[ -f "$agent_file" ]]; then
                local basename
                basename=$(basename "$agent_file")
                EXPECTED_FILES+=("agents/$basename")
            fi
        done
    fi

    # Skills (claudecode only - goes to skills/<name>/SKILL.md plus helper files)
    if [[ "$TARGET" == "claudecode" ]] && [[ -d "$REPO_ROOT/.rulesync/skills" ]]; then
        for skill_dir in "$REPO_ROOT/.rulesync/skills/"*/; do
            if [[ -d "$skill_dir" ]]; then
                local dirname
                dirname=$(basename "$skill_dir")
                EXPECTED_FILES+=("skills/$dirname/SKILL.md")
                # Include all non-SKILL.md markdown files (helpers, templates, guides)
                for helper_file in "$skill_dir"*.md; do
                    if [[ -f "$helper_file" && "$(basename "$helper_file")" != "SKILL.md" ]]; then
                        local helper_basename
                        helper_basename=$(basename "$helper_file")
                        EXPECTED_FILES+=("skills/$dirname/$helper_basename")
                    fi
                done
                # Include co-located shell scripts (e.g., context-path.sh)
                for helper_file in "$skill_dir"*.sh; do
                    if [[ -f "$helper_file" ]]; then
                        local helper_basename
                        helper_basename=$(basename "$helper_file")
                        EXPECTED_FILES+=("skills/$dirname/$helper_basename")
                    fi
                done
                # Include files in subdirectories (e.g., assets/)
                while IFS= read -r -d '' sub_file; do
                    local rel_path="${sub_file#$skill_dir}"
                    EXPECTED_FILES+=("skills/$dirname/$rel_path")
                done < <(find "$skill_dir" -mindepth 2 -type f -print0 2>/dev/null)
            fi
        done
    fi

    log_info "Expected ${#EXPECTED_FILES[@]} files in output"
}

# =============================================================================
# Inventory Verification
# =============================================================================

verify_inventory() {
    log_info "Verifying file inventory..."

    local output_dir
    output_dir=$(get_output_dir)
    local temp_output="$TEMP_DIR/$output_dir"

    # Check temp output exists
    if [[ ! -d "$temp_output" ]]; then
        log_error "Output directory not created: $temp_output"
        return 1
    fi

    # Get actual files in output
    local actual_files=()
    while IFS= read -r -d '' file; do
        # Get path relative to output dir
        local rel_path="${file#$temp_output/}"
        actual_files+=("$rel_path")
    done < <(find "$temp_output" -type f -print0 2>/dev/null)

    # Check for root rule in parent directory (repo root, not inside output dir)
    if [[ "$TARGET" == "claudecode" ]] && [[ -f "$TEMP_DIR/CLAUDE.md" ]]; then
        actual_files+=("../CLAUDE.md")
    fi
    if [[ "$TARGET" == "codexcli" ]] && [[ -f "$TEMP_DIR/AGENTS.md" ]]; then
        actual_files+=("../AGENTS.md")
    fi

    log_info "Found ${#actual_files[@]} files in output"

    # Check for unexpected files
    for actual in "${actual_files[@]}"; do
        local found=false
        for expected in "${EXPECTED_FILES[@]}"; do
            if [[ "$actual" == "$expected" ]]; then
                found=true
                break
            fi
        done
        if [[ "$found" == "false" ]]; then
            # Allow certain files that are legitimate additions
            case "$actual" in
                settings.json|settings.local.json|.aiignore|mcp.json)
                    log_info "Allowed additional file: $actual"
                    ;;
                *)
                    log_error "Unexpected file in output: $actual (potential injection)"
                    ;;
            esac
        fi
    done

    # Check for missing files
    for expected in "${EXPECTED_FILES[@]}"; do
        local found=false
        for actual in "${actual_files[@]}"; do
            if [[ "$actual" == "$expected" ]]; then
                found=true
                break
            fi
        done
        if [[ "$found" == "false" ]]; then
            log_warn "Expected file not found: $expected"
        fi
    done

    if [[ $ERRORS -gt 0 ]]; then
        return 1
    fi

    log_success "Inventory verification passed"
    return 0
}

# =============================================================================
# Content Verification
# =============================================================================

verify_content() {
    log_info "Verifying content integrity..."

    local output_dir
    output_dir=$(get_output_dir)
    local rules_dir
    rules_dir=$(get_rules_output_dir)
    local temp_output="$TEMP_DIR/$output_dir"

    local content_errors=0

    # Verify rules content
    for rule_file in "$REPO_ROOT/.rulesync/rules/"*.md; do
        if [[ ! -f "$rule_file" ]]; then
            continue
        fi

        local basename
        basename=$(basename "$rule_file")
        local source_file
        source_file=$(resolve_symlink "$rule_file")
        local is_root_rule=false

        # Determine output path
        local output_file
        if grep -q "^root:[[:space:]]*true" "$rule_file"; then
            is_root_rule=true
            if [[ "$TARGET" == "claudecode" ]]; then
                # CLAUDE.md is at repo root, not inside .claude/
                output_file="$TEMP_DIR/CLAUDE.md"
            else
                output_file="$TEMP_DIR/AGENTS.md"
            fi
        else
            output_file="$temp_output/$rules_dir/$basename"
        fi

        if [[ -f "$output_file" ]]; then
            if [[ "$is_root_rule" == "true" ]]; then
                if [[ "$TARGET" == "codexcli" ]]; then
                    # codexcli: verify AGENTS.md was properly reset by stash/restore
                    if [[ -f "$REPO_ROOT/AGENTS.md" ]]; then
                        local original_content
                        local output_content
                        original_content=$(cat "$REPO_ROOT/AGENTS.md" | normalise_content)
                        output_content=$(cat "$output_file" | normalise_content)

                        if [[ "$original_content" != "$output_content" ]]; then
                            log_error "AGENTS.md was not properly reset by setup-prompts.sh"
                            log_info "  Expected: matches $REPO_ROOT/AGENTS.md"
                            log_info "  Actual: modified content (possibly TOON header not removed)"
                            diff <(echo "$original_content") <(echo "$output_content") | head -20 || true
                            ((content_errors++)) || true
                        else
                            log_success "AGENTS.md verified: properly reset to original state"
                        fi
                    else
                        log_success "AGENTS.md verified: no original to compare (expected empty)"
                    fi
                else
                    # claudecode: verify CLAUDE.md content matches source rule
                    local source_content
                    local output_content
                    source_content=$(strip_frontmatter "$source_file" | normalise_content)
                    output_content=$(strip_frontmatter "$output_file" | normalise_content)

                    if [[ "$source_content" != "$output_content" ]]; then
                        log_error "Content mismatch: CLAUDE.md"
                        log_info "  Source: $source_file"
                        log_info "  Output: $output_file"
                        diff <(echo "$source_content") <(echo "$output_content") | head -20 || true
                        ((content_errors++)) || true
                    else
                        log_success "Content verified: CLAUDE.md"
                    fi
                fi
                continue
            fi

            # Compare content after stripping frontmatter
            local source_content
            local output_content
            source_content=$(strip_frontmatter "$source_file" | normalise_content)
            output_content=$(strip_frontmatter "$output_file" | normalise_content)

            if [[ "$source_content" != "$output_content" ]]; then
                log_error "Content mismatch: $basename"
                log_info "  Source: $source_file"
                log_info "  Output: $output_file"
                # Show diff summary
                diff <(echo "$source_content") <(echo "$output_content") | head -20 || true
                ((content_errors++)) || true
            else
                log_success "Content verified: $basename"
            fi
        fi
    done

    # Verify rules in subdirectories (e.g., rules/data-engine/*.md)
    while IFS= read -r -d '' rule_file; do
        local rel_path="${rule_file#$REPO_ROOT/.rulesync/rules/}"
        local source_file
        source_file=$(resolve_symlink "$rule_file")
        local output_file="$temp_output/$rules_dir/$rel_path"

        if [[ -f "$output_file" ]]; then
            local source_content
            local output_content
            source_content=$(strip_frontmatter "$source_file" | normalise_content)
            output_content=$(strip_frontmatter "$output_file" | normalise_content)

            if [[ "$source_content" != "$output_content" ]]; then
                log_error "Content mismatch: $rules_dir/$rel_path"
                log_info "  Source: $source_file"
                log_info "  Output: $output_file"
                diff <(echo "$source_content") <(echo "$output_content") | head -20 || true
                ((content_errors++)) || true
            else
                log_success "Content verified: $rel_path"
            fi
        fi
    done < <(find "$REPO_ROOT/.rulesync/rules" -mindepth 2 -type f -name "*.md" -print0 2>/dev/null)

    # Verify commands content (claudecode only)
    # Skip files with _ prefix as they are internal helper files (e.g., _review-core.md)
    if [[ "$TARGET" == "claudecode" ]] && [[ -d "$REPO_ROOT/.rulesync/commands" ]]; then
        for cmd_file in "$REPO_ROOT/.rulesync/commands/"*.md; do
            if [[ ! -f "$cmd_file" ]]; then
                continue
            fi

            local basename
            basename=$(basename "$cmd_file")
            # Skip internal helper files (prefixed with _)
            if [[ "$basename" == _* ]]; then
                continue
            fi
            local source_file
            source_file=$(resolve_symlink "$cmd_file")
            local output_file="$temp_output/commands/$basename"

            if [[ -f "$output_file" ]]; then
                local source_content
                local output_content
                source_content=$(strip_frontmatter "$source_file" | normalise_content)
                output_content=$(strip_frontmatter "$output_file" | normalise_content)

                if [[ "$source_content" != "$output_content" ]]; then
                    log_error "Content mismatch: commands/$basename"
                    log_info "  Source: $source_file"
                    log_info "  Output: $output_file"
                    diff <(echo "$source_content") <(echo "$output_content") | head -20 || true
                    ((content_errors++)) || true
                else
                    log_success "Content verified: commands/$basename"
                fi
            fi
        done
    fi

    # Verify subagents content (claudecode only)
    if [[ "$TARGET" == "claudecode" ]] && [[ -d "$REPO_ROOT/.rulesync/subagents" ]]; then
        for agent_file in "$REPO_ROOT/.rulesync/subagents/"*.md; do
            if [[ ! -f "$agent_file" ]]; then
                continue
            fi

            local basename
            basename=$(basename "$agent_file")
            local source_file
            source_file=$(resolve_symlink "$agent_file")
            local output_file="$temp_output/agents/$basename"

            if [[ -f "$output_file" ]]; then
                local source_content
                local output_content
                source_content=$(strip_frontmatter "$source_file" | normalise_content)
                output_content=$(strip_frontmatter "$output_file" | normalise_content)

                if [[ "$source_content" != "$output_content" ]]; then
                    log_error "Content mismatch: agents/$basename"
                    log_info "  Source: $source_file"
                    log_info "  Output: $output_file"
                    diff <(echo "$source_content") <(echo "$output_content") | head -20 || true
                    ((content_errors++)) || true
                else
                    log_success "Content verified: agents/$basename"
                fi
            fi
        done
    fi

    # Verify skills content (claudecode only)
    if [[ "$TARGET" == "claudecode" ]] && [[ -d "$REPO_ROOT/.rulesync/skills" ]]; then
        for skill_dir in "$REPO_ROOT/.rulesync/skills/"*/; do
            if [[ ! -d "$skill_dir" ]]; then
                continue
            fi

            local dirname
            dirname=$(basename "$skill_dir")
            local source_skill_dir
            source_skill_dir=$(resolve_symlink "$skill_dir")
            local source_file="$source_skill_dir/SKILL.md"
            local output_file="$temp_output/skills/$dirname/SKILL.md"

            if [[ -f "$source_file" && -f "$output_file" ]]; then
                local source_content
                local output_content
                source_content=$(strip_frontmatter "$source_file" | normalise_content)
                output_content=$(strip_frontmatter "$output_file" | normalise_content)

                if [[ "$source_content" != "$output_content" ]]; then
                    log_error "Content mismatch: skills/$dirname/SKILL.md"
                    log_info "  Source: $source_file"
                    log_info "  Output: $output_file"
                    diff <(echo "$source_content") <(echo "$output_content") | head -20 || true
                    ((content_errors++)) || true
                else
                    log_success "Content verified: skills/$dirname/SKILL.md"
                fi
            fi

            # Verify non-SKILL.md helper files (templates, guides, etc.)
            for helper_file in "$skill_dir"*.md; do
                if [[ -f "$helper_file" && "$(basename "$helper_file")" != "SKILL.md" ]]; then
                    local helper_basename
                    helper_basename=$(basename "$helper_file")
                    local helper_source
                    helper_source=$(resolve_symlink "$helper_file")
                    local helper_output="$temp_output/skills/$dirname/$helper_basename"

                    if [[ -f "$helper_output" ]]; then
                        local source_content
                        local output_content
                        source_content=$(strip_frontmatter "$helper_source" | normalise_content)
                        output_content=$(strip_frontmatter "$helper_output" | normalise_content)

                        if [[ "$source_content" != "$output_content" ]]; then
                            log_error "Content mismatch: skills/$dirname/$helper_basename"
                            log_info "  Source: $helper_source"
                            log_info "  Output: $helper_output"
                            diff <(echo "$source_content") <(echo "$output_content") | head -20 || true
                            ((content_errors++)) || true
                        else
                            log_success "Content verified: skills/$dirname/$helper_basename"
                        fi
                    fi
                fi
            done
        done
    fi

    if [[ $content_errors -gt 0 ]]; then
        return 2
    fi

    log_success "Content integrity verification passed"
    return 0
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo "========================================"
    echo "  Rulesync Integrity Verification"
    echo "========================================"
    echo ""
    echo "Repository: $REPO_ROOT"
    echo "Target: $TARGET"
    echo ""

    # Run verifications
    preflight_checks
    generate_to_temp
    build_expected_inventory

    local exit_code=0

    verify_inventory || exit_code=$?
    verify_content || exit_code=$?

    echo ""
    echo "========================================"
    if [[ $ERRORS -gt 0 ]]; then
        echo -e "  ${RED}VERIFICATION FAILED${NC}"
        echo "  Errors: $ERRORS"
        echo "  Warnings: $WARNINGS"
        echo "========================================"
        echo ""
        exit $exit_code
    else
        echo -e "  ${GREEN}VERIFICATION PASSED${NC}"
        if [[ $WARNINGS -gt 0 ]]; then
            echo "  Warnings: $WARNINGS"
        fi
        echo "========================================"
        echo ""
        exit 0
    fi
}

main "$@"
