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

# Detect if running in interactive terminal
is_interactive() {
    [[ -t 0 ]]
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
    local worktrees_src="external/ag-shared/.cursor-worktrees.json"
    local worktrees_dest="$REPO_ROOT/.cursor/worktrees.json"

    if [[ -f "$REPO_ROOT/$worktrees_src" ]] && [[ -d "$REPO_ROOT/.cursor" ]]; then
        ln -sf "../$worktrees_src" "$worktrees_dest"
        if [[ "$verbose" == "true" ]]; then
            echo -e "${GREEN}✓${NC} Symlinked Cursor worktrees config"
        fi
    fi

    # Render Claude Code settings from per-product template if claudecode is a target.
    # Source: external/ag-shared/.claude-settings.template.json with ${PRODUCT} placeholder.
    # Product is read from $AG_PRODUCT env var, falling back to the workspace root's
    # package.json `name` field (the same source scripts/sonar/sync-sonar-issues.ts
    # uses for product detection).
    local claude_settings_template="external/ag-shared/.claude-settings.template.json"
    local claude_settings_dest="$REPO_ROOT/.claude/settings.json"

    if [[ -f "$REPO_ROOT/$claude_settings_template" ]] && [[ "$targets" == *"claudecode"* || "$targets" == "*" ]]; then
        # Detect product via AG_PRODUCT env var or by reading package.json .name.
        # Fall back gracefully when neither source yields a match: skipping the
        # render leaves any existing .claude/settings.json in place and lets
        # the rest of postinstall complete. Failing here would otherwise abort
        # `yarn install` on environments missing jq or on unknown checkouts.
        local product="${AG_PRODUCT:-}"
        if [[ -z "$product" && -f "$REPO_ROOT/package.json" ]] && command -v jq >/dev/null 2>&1; then
            product=$(jq -r '.name // empty' "$REPO_ROOT/package.json" 2>/dev/null)
        fi

        if [[ -z "$product" ]]; then
            echo -e "${YELLOW}!${NC} Skipping .claude/settings.json render: no product detected" >&2
            echo -e "${YELLOW}  Set AG_PRODUCT (ag-charts | ag-grid | ag-studio) or ensure jq is installed + package.json .name is set.${NC}" >&2
            return 0
        fi

        case "$product" in
            ag-charts|ag-grid|ag-studio) ;;
            *)
                echo -e "${YELLOW}!${NC} Skipping .claude/settings.json render: unknown product '$product' (expected: ag-charts | ag-grid | ag-studio). Override with AG_PRODUCT if needed." >&2
                return 0
                ;;
        esac

        # Derive the marketplace `ref` field from AG_DEV_PROMPTS_REF. An unset or
        # 'latest' value leaves the source unqualified (Claude picks the default
        # branch); any other value pins the marketplace to that branch/tag via a
        # sibling `ref` field in the source object (Claude Code plugin schema
        # does not support `repo#ref` syntax). This lets a single consumer opt
        # into the canary track without changing settings for the other
        # products.
        local dev_prompts_ref="${AG_DEV_PROMPTS_REF:-}"
        local ref_field=""
        if [[ -n "$dev_prompts_ref" && "$dev_prompts_ref" != "latest" ]]; then
            ref_field=", \"ref\": \"$dev_prompts_ref\""
        fi

        mkdir -p "$REPO_ROOT/.claude"
        # Atomic render via temp file + mv. Drop any stale symlink first.
        local tmp_file="$claude_settings_dest.tmp.$$"
        sed \
            -e "s|\${PRODUCT}|$product|g" \
            -e "s|\${AG_DEV_PROMPTS_REF_FIELD}|$ref_field|g" \
            "$REPO_ROOT/$claude_settings_template" > "$tmp_file"
        rm -f "$claude_settings_dest"
        mv "$tmp_file" "$claude_settings_dest"
        if [[ "$verbose" == "true" ]]; then
            local track_note=""
            [[ -n "$ref_field" ]] && track_note=" (marketplace pinned to ${dev_prompts_ref})"
            echo -e "${GREEN}✓${NC} Rendered Claude Code settings for product: ${product}${track_note}"
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

    # AG-17085 Phase 3: fetch ag-dev-prompts content and stage it into .rulesync/
    # so non-Claude targets (Cursor, Codex, Gemini, Copilot, AGENTS.md) receive
    # the plugin-delivered skills/agents/commands via rulesync generate. Staged
    # items have `targets:` rewritten to exclude claudecode — Claude gets them
    # via the plugin directly, so rulesync does not re-emit under .claude/.
    #
    # Must run before the cleanup step below: both read the plugin-assignments
    # manifest from the ag-dev-prompts cache populated by fetch.sh.
    local cache_manifest="${AG_DEV_PROMPTS_CACHE:-$HOME/.cache/ag-dev-prompts}/repo/.claude-plugin/plugin-assignments.json"
    local fetch_script="$REPO_ROOT/external/ag-shared/scripts/rulesync-fetch/fetch.sh"
    local stage_script="$REPO_ROOT/external/ag-shared/scripts/rulesync-fetch/stage.py"
    if [[ -x "$fetch_script" ]] && [[ -f "$stage_script" ]]; then
        if [[ "$verbose" == "true" ]]; then
            echo -e "${BLUE}Fetching ag-dev-prompts...${NC}"
        fi
        # fetch.sh emits its own tailored remediation on failure (https/gh/
        # token/override); do not suppress its stderr.
        if resolved_sha=$("$fetch_script"); then
            if [[ "$verbose" == "true" ]]; then
                echo -e "${GREEN}✓${NC} Fetched ag-dev-prompts @ ${resolved_sha:0:8}"
            fi
            local stage_output
            local stage_exit=0
            stage_output=$(python3 "$stage_script" 2>&1) || stage_exit=$?
            if [[ $stage_exit -eq 0 ]]; then
                if [[ "$verbose" == "true" ]]; then
                    echo -e "${GREEN}✓${NC} Staged plugin content into .rulesync/"
                fi
            else
                echo -e "${YELLOW}Warning: ag-dev-prompts staging failed (exit $stage_exit) — non-Claude tools may miss shared content${NC}" >&2
                echo "$stage_output" >&2
                echo "" >&2
                echo "To fix:" >&2
                echo "  1. Check the Python error above — most stage.py failures are caused by a stale" >&2
                echo "     cache. Wipe it and retry:" >&2
                echo "       rm -rf \"${AG_DEV_PROMPTS_CACHE:-\$HOME/.cache/ag-dev-prompts}\"" >&2
                echo "       yarn" >&2
                echo "  2. If the error mentions a missing plugin-assignments.json, the fetched" >&2
                echo "     ag-dev-prompts branch is missing it — confirm AG_DEV_PROMPTS_REF (currently" >&2
                echo "     '${AG_DEV_PROMPTS_REF:-latest}') points at a branch with that file." >&2
                echo "  3. If the error persists, file a bug in ag-grid/ag-charts with the output above." >&2
                echo "" >&2
            fi
        else
            echo -e "${YELLOW}Warning: ag-dev-prompts fetch failed — non-Claude tools will use whatever is already staged.${NC}" >&2
            echo -e "${YELLOW}See the remediation printed above by rulesync-fetch.${NC}" >&2
        fi
    fi

    # Verify that .rulesync/ does not contain symlinks for plugin-delivered
    # items. If it does, rulesync would regenerate them in .claude/skills
    # alongside the same skill delivered by the plugin — duplicate content and
    # ambiguous trigger behaviour. Fail fast if stale symlinks exist.
    # Cleanup requires python3; skip with a warning when it's unavailable so
    # postinstall still succeeds on environments without it.
    local cleanup_script="$REPO_ROOT/external/ag-shared/scripts/setup-prompts/cleanup-plugin-delivered.py"
    if [[ -f "$cleanup_script" ]] && [[ -f "$cache_manifest" ]] && command -v python3 >/dev/null 2>&1; then
        if ! python3 "$cleanup_script" --verify >/dev/null 2>&1; then
            echo -e "${YELLOW}Warning: .rulesync/ contains symlinks for plugin-delivered items${NC}"
            python3 "$cleanup_script" --verify || true
            echo -e "${YELLOW}Removing stale symlinks...${NC}"
            python3 "$cleanup_script" || true
        fi
    fi

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
