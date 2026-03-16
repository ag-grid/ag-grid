#!/usr/bin/env bash
#
# setup-prompts.sh - Dynamic tool detection and rulesync configuration
#
# This script detects installed AI coding tools and generates configuration
# only for those that are present, using rulesync as the underlying engine.
#
# Usage:
#   ./setup-prompts.sh           # Auto-detect and generate
#   ./setup-prompts.sh --all     # Generate for all supported tools
#   ./setup-prompts.sh --list    # List detected tools
#   ./setup-prompts.sh --help    # Show help
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Allow REPO_ROOT override via environment variable (useful for testing)
REPO_ROOT="${SETUP_PROMPTS_REPO_ROOT:-$(cd "$SCRIPT_DIR/../../../.." && pwd)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the main repo root (handles worktrees)
# In a worktree, .git is a file containing "gitdir: /path/to/main/.git/worktrees/name"
get_main_repo_root() {
    local git_path="$REPO_ROOT/.git"

    if [[ -f "$git_path" ]]; then
        # We're in a worktree - parse the gitdir to find main repo
        local gitdir
        gitdir=$(cat "$git_path" | sed 's/gitdir: //')
        # gitdir is like /path/to/main/.git/worktrees/name
        # Go up twice to get /path/to/main/.git, then dirname for main repo
        local main_git_dir
        main_git_dir=$(dirname "$(dirname "$gitdir")")
        dirname "$main_git_dir"
    else
        # Normal checkout - current directory is the repo root
        echo "$REPO_ROOT"
    fi
}

# Detect if we're in a worktree
is_worktree() {
    [[ -f "$REPO_ROOT/.git" ]]
}

# Detect CI environment
is_ci() {
    [[ -n "${CI:-}" || -n "${GITHUB_ACTIONS:-}" || -n "${JENKINS_URL:-}" || -n "${BUILDKITE:-}" || -n "${CIRCLECI:-}" || -n "${TRAVIS:-}" ]]
}

# Detect if running in interactive terminal
is_interactive() {
    [[ -t 0 ]]
}

# Check if user has access to the prompts repo
has_repo_access() {
    git ls-remote "$PROMPTS_REPO" HEAD >/dev/null 2>&1
}

# Prompt user with yes/no (returns 0 for yes, 1 for no)
prompt_yes_no() {
    local message="$1"
    if ! is_interactive; then
        return 1  # Non-interactive: default to no
    fi
    read -p "$message [Y/n] " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Nn]$ ]]
}

# Configuration for prompts repository
PROMPTS_REPO="${AG_PROMPTS_REPO:-git@github.com:ag-grid/ag-charts-prompts.git}"
PROMPTS_DIR_NAME="${AG_PROMPTS_DIR_NAME:-ag-charts-prompts}"
MAIN_REPO_ROOT=$(get_main_repo_root)
PROMPTS_DIR="$MAIN_REPO_ROOT/../$PROMPTS_DIR_NAME"

# Tool detection functions
# Each function returns 0 if tool is detected, 1 otherwise

detect_claudecode() {
    # Always enable — Claude Code is the primary agentic tool across all AG repos.
    # Generating its config is cheap and avoids issues in environments where the
    # binary isn't on $PATH (CI, containers, remote dev boxes).
    return 0
}

detect_cursor() {
    command -v cursor &>/dev/null && return 0
    [[ -d "/Applications/Cursor.app" ]] && return 0
    [[ -d "$HOME/.cursor" ]] && return 0
    return 1
}

detect_copilot() {
    command -v code &>/dev/null && return 0
    [[ -d "/Applications/Visual Studio Code.app" ]] && return 0
    return 1
}

detect_codexcli() {
    command -v codex &>/dev/null && return 0
    return 1
}

detect_geminicli() {
    command -v gemini &>/dev/null && return 0
    return 1
}

detect_opencode() {
    command -v opencode &>/dev/null && return 0
    [[ -f "$HOME/.opencode/config.json" ]] && return 0
    return 1
}

detect_antigravity() {
    command -v antigravity &>/dev/null && return 0
    command -v ag &>/dev/null && return 0
    [[ -d "$HOME/.config/antigravity" ]] && return 0
    return 1
}

detect_cline() {
    local vscode_ext="$HOME/.vscode/extensions"
    [[ -d "$vscode_ext" ]] && ls "$vscode_ext" 2>/dev/null | grep -q "saoudrizwan.claude-dev" && return 0
    return 1
}

detect_windsurf() {
    command -v windsurf &>/dev/null && return 0
    [[ -d "/Applications/Windsurf.app" ]] && return 0
    return 1
}

detect_roo() {
    command -v roo &>/dev/null && return 0
    local vscode_ext="$HOME/.vscode/extensions"
    [[ -d "$vscode_ext" ]] && ls "$vscode_ext" 2>/dev/null | grep -q "roo" && return 0
    return 1
}

detect_kilo() {
    command -v kilo &>/dev/null && return 0
    return 1
}

detect_warp() {
    command -v warp &>/dev/null && return 0
    [[ -d "/Applications/Warp.app" ]] && return 0
    return 1
}

detect_junie() {
    [[ -d "$HOME/.config/JetBrains" ]] && return 0
    [[ -d "$HOME/Library/Application Support/JetBrains" ]] && return 0
    return 1
}

detect_augmentcode() {
    command -v augment &>/dev/null && return 0
    return 1
}

detect_qwencode() {
    command -v qwen &>/dev/null && return 0
    return 1
}

detect_kiro() {
    command -v kiro &>/dev/null && return 0
    return 1
}

# Tool configurations (bash 3 compatible - no associative arrays)
# Format: tool_id:display_name:detector_function
TOOLS="
claudecode:Claude Code:detect_claudecode
cursor:Cursor:detect_cursor
copilot:GitHub Copilot:detect_copilot
codexcli:Codex CLI:detect_codexcli
geminicli:Gemini CLI:detect_geminicli
opencode:OpenCode:detect_opencode
antigravity:Google Antigravity:detect_antigravity
cline:Cline:detect_cline
windsurf:Windsurf:detect_windsurf
roo:Roo Code:detect_roo
kilo:Kilo Code:detect_kilo
warp:Warp:detect_warp
junie:JetBrains Junie:detect_junie
augmentcode:AugmentCode:detect_augmentcode
qwencode:Qwen Code:detect_qwencode
kiro:Kiro IDE:detect_kiro
"

# Tools excluded from auto-detection (modify AGENTS.md or have other side effects)
# Use --targets=agentsmd explicitly if needed
EXCLUDED_TOOLS="agentsmd"

# Determine the expected branch for symlinked repos based on the outer repo's branch.
# Only "latest" and release branches (bX.Y.Z) are expected to match; topic branches default to "latest".
get_expected_symlink_branch() {
    local outer_branch
    outer_branch=$(git -C "$REPO_ROOT" branch --show-current 2>/dev/null || echo "")
    case "$outer_branch" in
        latest|b[0-9]*.*)
            echo "$outer_branch"
            ;;
        *)
            echo "latest"
            ;;
    esac
}

# Check if a symlinked repo is on the expected branch and offer to switch if not.
# Arguments: $1 = repo path, $2 = display name, $3 = expected branch
check_symlinked_repo_branch() {
    local repo_path="$1"
    local display_name="$2"
    local expected_branch="$3"

    local current_branch
    current_branch=$(git -C "$repo_path" branch --show-current 2>/dev/null || echo "")

    # Nothing to do if already on the expected branch (or we cannot determine current branch)
    if [[ -z "$current_branch" || "$current_branch" == "$expected_branch" ]]; then
        return 0
    fi

    # Check for uncommitted changes
    local is_dirty="false"
    if ! git -C "$repo_path" diff --quiet 2>/dev/null || ! git -C "$repo_path" diff --cached --quiet 2>/dev/null; then
        is_dirty="true"
    fi

    if [[ "$is_dirty" == "true" ]]; then
        echo -e "${YELLOW}$display_name is on branch '$current_branch' (expected '$expected_branch') with local changes${NC}"
        if is_interactive && prompt_yes_no "Stash changes and checkout $expected_branch?"; then
            (
                cd "$repo_path"
                git stash --quiet
                if git checkout "$expected_branch" --quiet 2>/dev/null; then
                    echo -e "${GREEN}✓${NC} Switched $display_name to '$expected_branch'"
                else
                    echo -e "${YELLOW}Warning: Failed to checkout '$expected_branch' in $display_name${NC}"
                fi
                git stash pop --quiet 2>/dev/null || true
            )
        else
            echo -e "${YELLOW}Warning: $display_name remains on branch '$current_branch'${NC}"
        fi
    else
        echo -e "${YELLOW}$display_name is on branch '$current_branch' (expected '$expected_branch')${NC}"
        if is_interactive && prompt_yes_no "Checkout $expected_branch?"; then
            if git -C "$repo_path" checkout "$expected_branch" --quiet 2>/dev/null; then
                echo -e "${GREEN}✓${NC} Switched $display_name to '$expected_branch'"
            else
                echo -e "${YELLOW}Warning: Failed to checkout '$expected_branch' in $display_name${NC}"
            fi
        else
            echo -e "${YELLOW}Warning: $display_name remains on branch '$current_branch'${NC}"
        fi
    fi
}

# Check if prompts checkout is behind remote
is_prompts_behind() {
    (
        cd "$PROMPTS_DIR"
        git fetch origin --quiet 2>/dev/null || return 1
        local LOCAL=$(git rev-parse HEAD)
        local REMOTE=$(git rev-parse origin/latest 2>/dev/null || git rev-parse origin/main 2>/dev/null || echo "")
        [[ -n "$REMOTE" && "$LOCAL" != "$REMOTE" ]]
    ) 2>/dev/null
}

# Setup worktree symlink for prompts
# In worktrees, create a symlink in the parent directory pointing to the real prompts
# This allows the version-controlled relative symlink (external/prompts) to work
setup_worktree_prompts_symlink() {
    if is_worktree; then
        local worktree_parent
        worktree_parent=$(dirname "$REPO_ROOT")
        local parent_prompts_link="$worktree_parent/$PROMPTS_DIR_NAME"
        local real_prompts
        real_prompts=$(cd "$PROMPTS_DIR" && pwd)

        if [[ ! -e "$parent_prompts_link" ]]; then
            ln -sf "$real_prompts" "$parent_prompts_link" || true
        elif [[ -L "$parent_prompts_link" ]]; then
            local current_target
            current_target=$(readlink "$parent_prompts_link")
            if [[ "$current_target" != "$real_prompts" ]]; then
                ln -sf "$real_prompts" "$parent_prompts_link" || true
            fi
        fi
    fi
}

# Check and setup prompts repository
# Returns 0 if prompts are available or not needed, 1 if needed but not available
setup_prompts_repo() {
    # Only run if this repo has an external/prompts symlink (e.g., ag-charts)
    # Other repos (e.g., ag-grid) don't use this mechanism
    if [[ ! -L "$REPO_ROOT/external/prompts" ]]; then
        return 0
    fi

    # Skip in CI - prompts are optional
    if is_ci; then
        return 0
    fi

    # Check if prompts directory exists
    if [[ -d "$PROMPTS_DIR" ]]; then
        # Prompts exist - check if we should update
        if is_prompts_behind; then
            echo -e "${YELLOW}$PROMPTS_DIR_NAME is out of date.${NC}"
            if is_interactive && prompt_yes_no "Update now?"; then
                echo "Updating $PROMPTS_DIR_NAME..."
                if ! (cd "$PROMPTS_DIR" && git pull --ff-only); then
                    echo -e "${YELLOW}Warning: Failed to update $PROMPTS_DIR_NAME, continuing with current version${NC}"
                fi
            fi
        fi

        # Check if prompts repo is on the expected branch
        if is_interactive; then
            local expected_branch
            expected_branch=$(get_expected_symlink_branch)
            check_symlinked_repo_branch "$PROMPTS_DIR" "$PROMPTS_DIR_NAME" "$expected_branch"
        fi

        # Setup worktree symlink if needed
        setup_worktree_prompts_symlink
        return 0
    fi

    # Prompts directory doesn't exist
    if is_interactive; then
        # Interactive: offer to clone
        if has_repo_access; then
            echo -e "${YELLOW}$PROMPTS_DIR_NAME not found at $PROMPTS_DIR${NC}"
            if prompt_yes_no "Clone it now?"; then
                echo "Cloning $PROMPTS_DIR_NAME..."
                if git clone "$PROMPTS_REPO" "$PROMPTS_DIR"; then
                    setup_worktree_prompts_symlink
                    return 0
                else
                    echo -e "${YELLOW}Warning: Failed to clone $PROMPTS_DIR_NAME${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}No access to $PROMPTS_DIR_NAME repository${NC}"
        fi
    else
        # Non-interactive: just warn
        echo -e "${YELLOW}Warning: $PROMPTS_DIR_NAME not found - rulesync may not have completely setup tooling${NC}"
    fi

    return 1
}

# Detect all installed tools
detect_tools() {
    local detected=""

    while IFS=: read -r tool_id display_name detector; do
        [[ -z "$tool_id" ]] && continue
        # Skip excluded tools
        if [[ " $EXCLUDED_TOOLS " == *" $tool_id "* ]]; then
            continue
        fi
        if $detector 2>/dev/null; then
            if [[ -z "$detected" ]]; then
                detected="$tool_id"
            else
                detected="$detected,$tool_id"
            fi
        fi
    done <<< "$TOOLS"

    echo "$detected"
}

# Print detected tools (verbose mode)
print_detected_tools_verbose() {
    echo -e "${BLUE}Detecting installed AI coding tools...${NC}"
    echo ""

    while IFS=: read -r tool_id display_name detector; do
        [[ -z "$tool_id" ]] && continue
        # Skip excluded tools
        if [[ " $EXCLUDED_TOOLS " == *" $tool_id "* ]]; then
            continue
        fi
        if $detector 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} $display_name ($tool_id)"
        else
            echo -e "  ${YELLOW}○${NC} $display_name ($tool_id) - not detected"
        fi
    done <<< "$TOOLS"

    echo ""
}

# Print detected tools (compact mode - default)
print_detected_tools_compact() {
    local detected_names=""

    while IFS=: read -r tool_id display_name detector; do
        [[ -z "$tool_id" ]] && continue
        # Skip excluded tools
        if [[ " $EXCLUDED_TOOLS " == *" $tool_id "* ]]; then
            continue
        fi
        if $detector 2>/dev/null; then
            if [[ -z "$detected_names" ]]; then
                detected_names="$display_name"
            else
                detected_names="$detected_names, $display_name"
            fi
        fi
    done <<< "$TOOLS"

    if [[ -n "$detected_names" ]]; then
        echo -e "${GREEN}✓${NC} Detected: $detected_names"
    fi
}

# Symlink additional config files not handled by rulesync
copy_extra_configs() {
    local verbose="$1"
    local targets="$2"

    # Symlink Cursor worktrees config if source exists and cursor is a target
    local worktrees_src="external/ag-shared/prompts/.cursor-worktrees.json"
    local worktrees_dest="$REPO_ROOT/.cursor/worktrees.json"

    if [[ -f "$REPO_ROOT/$worktrees_src" ]] && [[ -d "$REPO_ROOT/.cursor" ]]; then
        ln -sf "../$worktrees_src" "$worktrees_dest"
        if [[ "$verbose" == "true" ]]; then
            echo -e "${GREEN}✓${NC} Symlinked Cursor worktrees config"
        fi
    fi

    # Symlink Claude Code settings if source exists and claudecode is a target
    local claude_settings_src="external/ag-shared/prompts/.claude-settings.json"
    local claude_settings_dest="$REPO_ROOT/.claude/settings.json"

    if [[ -f "$REPO_ROOT/$claude_settings_src" ]] && [[ "$targets" == *"claudecode"* || "$targets" == "*" ]]; then
        mkdir -p "$REPO_ROOT/.claude"
        ln -sf "../$claude_settings_src" "$claude_settings_dest"
        if [[ "$verbose" == "true" ]]; then
            echo -e "${GREEN}✓${NC} Symlinked Claude Code settings"
        fi
    fi
}

# Stash AGENTS.md changes before rulesync runs
# This preserves user edits that would otherwise be overwritten
stash_agents_md() {
    AGENTS_MD_STASH_FILE=""
    local agents_file="$REPO_ROOT/AGENTS.md"

    if [[ -f "$agents_file" ]] && git -C "$REPO_ROOT" ls-files --error-unmatch "AGENTS.md" &>/dev/null 2>&1; then
        if ! git -C "$REPO_ROOT" diff --quiet "AGENTS.md" 2>/dev/null; then
            # AGENTS.md has local changes - stash them
            AGENTS_MD_STASH_FILE=$(mktemp)
            git -C "$REPO_ROOT" diff "AGENTS.md" > "$AGENTS_MD_STASH_FILE"
        fi
    fi
}

# Reset AGENTS.md and restore any stashed user changes
# This removes rulesync noise while preserving intentional user edits
restore_agents_md() {
    local verbose="$1"
    local agents_file="$REPO_ROOT/AGENTS.md"

    if [[ -f "$agents_file" ]] && git -C "$REPO_ROOT" ls-files --error-unmatch "AGENTS.md" &>/dev/null 2>&1; then
        # Reset to HEAD (removes all changes including rulesync noise)
        if ! git -C "$REPO_ROOT" diff --quiet "AGENTS.md" 2>/dev/null; then
            git -C "$REPO_ROOT" checkout -- "AGENTS.md" 2>/dev/null || true
        fi

        # Restore stashed user changes if any
        if [[ -n "$AGENTS_MD_STASH_FILE" && -f "$AGENTS_MD_STASH_FILE" && -s "$AGENTS_MD_STASH_FILE" ]]; then
            if git -C "$REPO_ROOT" apply --check "$AGENTS_MD_STASH_FILE" 2>/dev/null; then
                git -C "$REPO_ROOT" apply "$AGENTS_MD_STASH_FILE" 2>/dev/null
                if [[ "$verbose" == "true" ]]; then
                    echo -e "${GREEN}✓${NC} Restored local AGENTS.md changes"
                fi
            else
                # Patch doesn't apply cleanly - save for manual recovery
                local backup_file="$REPO_ROOT/.agents-md-stash.patch"
                cp "$AGENTS_MD_STASH_FILE" "$backup_file"
                echo -e "${YELLOW}!${NC} Could not cleanly restore AGENTS.md changes"
                echo -e "${YELLOW}!${NC} Your changes saved to: $backup_file"
            fi
            rm -f "$AGENTS_MD_STASH_FILE"
            AGENTS_MD_STASH_FILE=""
        elif [[ "$verbose" == "true" ]]; then
            echo -e "${GREEN}✓${NC} Reset AGENTS.md to clean state"
        fi
    fi

    # Cleanup stash file if still exists
    [[ -n "$AGENTS_MD_STASH_FILE" && -f "$AGENTS_MD_STASH_FILE" ]] && rm -f "$AGENTS_MD_STASH_FILE" || true
}

# Get rulesync command - prefer patched versions over npx (which downloads fresh unpatched)
# Priority: RULESYNC_BIN env var > local node_modules > npx fallback
get_rulesync_cmd() {
    if [[ -n "${RULESYNC_BIN:-}" && -x "$RULESYNC_BIN" ]]; then
        echo "$RULESYNC_BIN"
    elif [[ -x "$REPO_ROOT/node_modules/.bin/rulesync" ]]; then
        echo "$REPO_ROOT/node_modules/.bin/rulesync"
    else
        echo "npx rulesync"
    fi
}

# Strip the TOON rules block from AGENTS.md
# Rulesync's OpenCode target prepends a TOON-format rules index to AGENTS.md.
# This adds noise for other tools that read AGENTS.md (Codex, Gemini, etc.)
# and is redundant — OpenCode loads rules from .opencode/memories/ directly.
strip_agents_md_toon() {
    local verbose="$1"
    local agents_file="$REPO_ROOT/AGENTS.md"

    [[ -f "$agents_file" ]] || return 0

    # Check if file starts with the TOON preamble
    if head -1 "$agents_file" | grep -q "TOON format"; then
        # Find the first markdown heading (# or ##) after the TOON block
        local first_heading_line
        first_heading_line=$(grep -n '^#' "$agents_file" | head -1 | cut -d: -f1)

        if [[ -n "$first_heading_line" ]]; then
            # Remove everything before the first heading
            tail -n +"$first_heading_line" "$agents_file" > "$agents_file.tmp"
            mv "$agents_file.tmp" "$agents_file"
            if [[ "$verbose" == "true" ]]; then
                echo -e "${GREEN}✓${NC} Stripped TOON rules block from AGENTS.md"
            fi
        fi
    fi
}

# Generate rulesync configuration
generate_config() {
    local targets="$1"
    local verbose="$2"

    cd "$REPO_ROOT"

    if [[ "$verbose" == "true" ]]; then
        echo -e "${BLUE}Generating configurations for: ${NC}$targets"
        echo ""
    fi

    # Prefer local rulesync (with patches applied) over npx (downloads fresh unpatched version)
    local rulesync_cmd
    rulesync_cmd=$(get_rulesync_cmd)

    # Run rulesync and capture output + exit code
    local output
    local exit_code=0
    output=$($rulesync_cmd generate \
        --targets="$targets" \
        --features="rules,ignore,mcp,commands,subagents,skills" \
        --delete 2>&1) || exit_code=$?

    if [[ $exit_code -eq 0 ]]; then
        copy_extra_configs "$verbose" "$targets"
        strip_agents_md_toon "$verbose"

        if [[ "$verbose" == "true" ]]; then
            echo "$output"
            echo ""
            echo -e "${GREEN}✓ Configuration generated successfully${NC}"
        else
            local summary
            summary=$(echo "$output" | grep -o '🎉.*' || echo "Configuration generated")
            echo -e "${GREEN}✓${NC} $summary"
        fi
    else
        echo -e "${YELLOW}Warning: rulesync failed - some configuration may be incomplete${NC}"
        if [[ "$verbose" == "true" ]]; then
            echo "$output"
            echo -e "${YELLOW}This may be due to missing external/prompts (ag-charts-prompts not cloned)${NC}"
        else
            echo "$output" | grep -i "error" | head -3 || true
        fi
    fi
}

# Show help
show_help() {
    echo "Usage: setup-prompts.sh [OPTIONS]"
    echo ""
    echo "Detects installed AI coding tools and generates rulesync configuration"
    echo "only for those that are present."
    echo ""
    echo "Options:"
    echo "  --all       Generate for all supported tools"
    echo "  --list      List detected tools without generating"
    echo "  --targets   Comma-separated list of specific targets"
    echo "  --verbose   Show detailed output"
    echo "  --help      Show this help message"
    echo ""
    echo "Supported tools:"
    while IFS=: read -r tool_id display_name detector; do
        [[ -z "$tool_id" ]] && continue
        echo "  - $display_name ($tool_id)"
    done <<< "$TOOLS"
    echo ""
    echo "Examples:"
    echo "  ./setup-prompts.sh                    # Auto-detect and generate"
    echo "  ./setup-prompts.sh --all              # Generate for all tools"
    echo "  ./setup-prompts.sh --list             # Show detected tools"
    echo "  ./setup-prompts.sh --targets=claudecode,cursor  # Specific tools"
}

# Main
main() {
    local mode="auto"
    local custom_targets=""
    local verbose="false"
    local postinstall="false"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                mode="all"
                shift
                ;;
            --list)
                mode="list"
                shift
                ;;
            --targets=*)
                mode="custom"
                custom_targets="${1#*=}"
                shift
                ;;
            --verbose|-v)
                verbose="true"
                shift
                ;;
            --postinstall)
                # When run via postinstall, reset AGENTS.md after rulesync
                # to avoid confusing noise for most users
                postinstall="true"
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

    # Setup prompts repository (graceful - doesn't fail on errors)
    setup_prompts_repo || true

    # Stash AGENTS.md changes before rulesync (to preserve user edits)
    if [[ "$postinstall" == "true" ]]; then
        stash_agents_md
    fi

    case $mode in
        list)
            print_detected_tools_verbose
            ;;
        all)
            if [[ "$verbose" == "true" ]]; then
                echo -e "${BLUE}Generating for all supported tools...${NC}"
            fi
            generate_config "*" "$verbose"
            # Reset AGENTS.md in postinstall mode to avoid noise (only if it wasn't already dirty)
            if [[ "$postinstall" == "true" ]]; then
                restore_agents_md "$verbose"
            fi
            ;;
        custom)
            generate_config "$custom_targets" "$verbose"
            # Reset AGENTS.md in postinstall mode (only if it wasn't already dirty)
            if [[ "$postinstall" == "true" ]]; then
                restore_agents_md "$verbose"
            fi
            ;;
        auto)
            local detected
            detected=$(detect_tools)

            if [[ -z "$detected" ]]; then
                echo -e "${YELLOW}No AI coding tools detected. Use --all to generate for all tools.${NC}"
                exit 0
            fi

            if [[ "$verbose" == "true" ]]; then
                print_detected_tools_verbose
            else
                print_detected_tools_compact
            fi

            generate_config "$detected" "$verbose"
            # Reset AGENTS.md in postinstall mode (only if it wasn't already dirty)
            if [[ "$postinstall" == "true" ]]; then
                restore_agents_md "$verbose"
            fi
            ;;
    esac
}

main "$@"
