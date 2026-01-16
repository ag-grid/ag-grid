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
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Tool detection functions
# Each function returns 0 if tool is detected, 1 otherwise

detect_claudecode() {
    command -v claude &>/dev/null && return 0
    [[ -d "$HOME/.claude" ]] && return 0
    return 1
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

# Generate rulesync configuration
generate_config() {
    local targets="$1"
    local verbose="$2"

    cd "$REPO_ROOT"

    if [[ "$verbose" == "true" ]]; then
        echo -e "${BLUE}Generating configurations for: ${NC}$targets"
        echo ""

        # Run rulesync with detected targets (verbose)
        npx rulesync generate \
            --targets="$targets" \
            --features="rules,ignore,mcp,commands,subagents" \
            --delete

        # Copy extra configs
        copy_extra_configs "$verbose" "$targets"

        echo ""
        echo -e "${GREEN}✓ Configuration generated successfully${NC}"
    else
        # Run rulesync quietly and capture output for summary
        local output
        output=$(npx rulesync generate \
            --targets="$targets" \
            --features="rules,ignore,mcp,commands,subagents" \
            --delete 2>&1)

        # Copy extra configs
        copy_extra_configs "$verbose" "$targets"

        # Extract the summary line from rulesync output
        local summary
        summary=$(echo "$output" | grep -o '🎉.*' || echo "Configuration generated")
        echo -e "${GREEN}✓${NC} $summary"
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

    case $mode in
        list)
            print_detected_tools_verbose
            ;;
        all)
            if [[ "$verbose" == "true" ]]; then
                echo -e "${BLUE}Generating for all supported tools...${NC}"
            fi
            generate_config "*" "$verbose"
            ;;
        custom)
            generate_config "$custom_targets" "$verbose"
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
            ;;
    esac
}

main "$@"
