#!/usr/bin/env bash
#
# _detect-agent.sh - Detect known AI coding agents via environment variables
#
# Source this file in git hooks to get detect_agent and agent_block_message.
#

# detect_agent: prints the agent name to stdout and returns 0 if an agent is
# detected, returns 1 if none is detected.
detect_agent() {
    # Claude Code — confirmed signal in our environment
    if [[ -n "${CLAUDECODE:-}" ]]; then
        echo "Claude Code"
        return 0
    fi

    # OpenAI Codex
    if [[ -n "${CODEX_SANDBOX:-}" ]]; then
        echo "OpenAI Codex"
        return 0
    fi

    # Gemini CLI
    if [[ -n "${GEMINI_CLI:-}" ]]; then
        echo "Gemini CLI"
        return 0
    fi

    # Cursor
    if [[ -n "${CURSOR_TRACE_ID:-}" ]] || [[ -n "${CURSOR_AGENT:-}" ]]; then
        echo "Cursor"
        return 0
    fi

    # Windsurf
    if [[ "${TERM_PROGRAM:-}" == "windsurf" ]]; then
        echo "Windsurf"
        return 0
    fi

    # Aider (usually skips hooks, but check anyway)
    if echo "${GIT_AUTHOR_NAME:-}" | grep -qi "(aider)"; then
        echo "Aider"
        return 0
    fi

    return 1
}

# agent_block_message: prints a structured block message for AI models.
# Arguments:
#   $1 - agent name (from detect_agent)
#   $2 - hook type: "commit" or "push"
#   $3 - branch name
agent_block_message() {
    local agent="$1"
    local hook_type="$2"
    local branch="$3"
    local action
    if [[ "$hook_type" == "push" ]]; then
        action="push"
    else
        action="commit"
    fi

    echo ""
    echo "==========================================================================="
    echo "BLOCKED: ${agent} ${action} to protected branch '${branch}'"
    echo "==========================================================================="
    echo ""
    echo "IMPORTANT INSTRUCTION FOR AI AGENT (${agent}):"
    echo "You MUST NOT ${action} directly to the '${branch}' branch. This branch is"
    echo "protected and direct ${action}s are strictly prohibited."
    echo ""
    echo "REQUIRED ACTION:"
    echo "1. Create a new feature branch: git checkout -b <prefix>/your-description"
    echo "2. Make your changes on the feature branch"
    echo "3. Push the feature branch and open a pull request"
    echo ""
    echo "Do NOT attempt to bypass this hook with --no-verify."
    echo "Do NOT retry this ${action} on this branch."
    echo "==========================================================================="
    echo ""
}
