#!/usr/bin/env bash
# rulesync-fetch: clone/update ag-dev-prompts into a local cache so non-Claude
# targets (Cursor, Codex, Gemini, Copilot, AGENTS.md) can receive plugin content
# via rulesync generate. Part of AG-17085 Phase 3.
#
# Auth precedence:
#   1. AG_DEV_PROMPTS_REPO env — explicit URL (overrides everything below).
#      Use this to force SSH (e.g. AG_DEV_PROMPTS_REPO=git@github.com:...).
#   2. GITHUB_TOKEN env        — https clone via per-call Authorization header
#                                (not persisted to .git/config). CI path.
#   3. gh CLI                  — if `gh auth token` resolves a token, use it
#                                the same way as GITHUB_TOKEN. Transparent for
#                                developers already logged in with `gh`.
#   4. Consumer origin is SSH  — if the consumer repo's `origin` remote points
#                                at github.com over SSH, mirror that scheme.
#                                Cheap and local (single `git config` read),
#                                and a strong signal that the developer has
#                                working SSH keys for github.com.
#   5. Fallback                 — https clone with no explicit credentials; git's
#                                credential helper (osxkeychain, manager, etc.)
#                                supplies auth. The dev workstation path.
#
# HTTPS is the default because SSH keys are not universally registered with
# GitHub on dev workstations, whereas `gh` and credential helpers are common.
#
# AG_DEV_PROMPTS_REF must resolve to a branch or tag name. SHAs are not supported.
set -euo pipefail

CACHE_ROOT="${AG_DEV_PROMPTS_CACHE:-$HOME/.cache/ag-dev-prompts}"
REF="${AG_DEV_PROMPTS_REF:-latest}"
REPO_DIR="$CACHE_ROOT/repo"
REPO_SLUG="${AG_DEV_PROMPTS_SLUG:-ag-grid/ag-dev-prompts}"

# Track which auth path was selected so failure messages can be tailored.
# Set here (not inside the resolver) because resolve_repo_url runs inside a
# command substitution subshell, so assignments there wouldn't propagate.
if [[ -n "${AG_DEV_PROMPTS_REPO:-}" ]]; then
    AUTH_MODE="override"
elif [[ -n "${GITHUB_TOKEN:-}" ]]; then
    AUTH_MODE="token"
elif command -v gh >/dev/null 2>&1 && _gh_token="$(gh auth token 2>/dev/null)" && [[ -n "$_gh_token" ]]; then
    # Match the git URL scheme to gh's configured git protocol so we exercise
    # the same auth path the developer already uses for git operations. This
    # avoids HTTPS failures when the user authenticated gh with SSH protocol
    # but never ran `gh auth setup-git` to wire the token into git's
    # credential helper.
    # Query the github.com-specific protocol. `gh auth status` reports every
    # configured host, so grepping its output could pick up SSH from an
    # unrelated host and flip github.com onto SSH incorrectly. `gh config get`
    # is scoped to a host and returns exactly 'ssh' or 'https'.
    if [[ "$(gh config get -h github.com git_protocol 2>/dev/null)" == "ssh" ]]; then
        AUTH_MODE="gh-ssh"
    else
        GITHUB_TOKEN="$_gh_token"
        export GITHUB_TOKEN
        AUTH_MODE="gh"
    fi
    unset _gh_token
elif _origin_url=$(git config --get remote.origin.url 2>/dev/null) && [[ "$_origin_url" =~ ^(git@github\.com:|ssh://git@github\.com/) ]]; then
    # No gh / GITHUB_TOKEN, but the consumer repo was cloned over SSH. The
    # developer almost certainly has working SSH keys for github.com, so mirror
    # that scheme rather than falling through to an HTTPS prompt.
    AUTH_MODE="origin-ssh"
    unset _origin_url
else
    AUTH_MODE="https"
fi

# Git config args for the current invocation only. When a token is available we
# attach an Authorization header via `-c http.extraHeader=...` instead of
# embedding credentials in the remote URL, so nothing secret lands in
# .git/config. Assignment happens at top level (not inside a subshell) so the
# array is visible to the git invocations below.
#
# Callers MUST expand with the ${arr[@]+"${arr[@]}"} idiom — under `set -u`,
# macOS's system bash 3.2 treats "${empty_array[@]}" as an unbound variable.
GIT_AUTH_ARGS=()
if [[ "$AUTH_MODE" == "token" || "$AUTH_MODE" == "gh" ]]; then
    _basic=$(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 | tr -d '\n')
    GIT_AUTH_ARGS=(-c "http.extraHeader=Authorization: Basic ${_basic}")
    unset _basic
fi

resolve_repo_url() {
    case "$AUTH_MODE" in
        override)   echo "$AG_DEV_PROMPTS_REPO" ;;
        gh-ssh)     echo "git@github.com:${REPO_SLUG}.git" ;;
        origin-ssh) echo "git@github.com:${REPO_SLUG}.git" ;;
        *)          echo "https://github.com/${REPO_SLUG}.git" ;;
    esac
}

# Print tailored remediation to stderr based on which auth path we tried. Called
# from the ERR trap so developers see actionable next steps instead of a bare
# git error.
print_remediation() {
    local exit_code="$1"
    echo "" >&2
    echo "ag-dev-prompts fetch failed (exit $exit_code) from $REPO_URL" >&2
    echo "" >&2
    case "$AUTH_MODE" in
        https)
            cat >&2 <<EOF
Auth path: HTTPS via git credential helper (no GITHUB_TOKEN, no gh login found).

Git asked your system credential helper (osxkeychain / manager / libsecret)
for ${REPO_SLUG} credentials and either got none or got credentials that
don't grant access.

To fix, pick one:

  A. Install GitHub CLI and authenticate — easiest path, no tokens to manage:
       brew install gh                 # or: https://cli.github.com/
       gh auth login --hostname github.com --git-protocol https --web
       gh auth setup-git               # wire gh token into git's credential helper
       yarn                            # re-run install to retry the fetch

  B. Already logged in to gh but git still prompts? Git's credential helper
     isn't wired to gh. Run:
       gh auth setup-git
       yarn

  C. Export a Personal Access Token with repo scope for this session:
       export GITHUB_TOKEN=ghp_...
       yarn

  D. If you prefer SSH and your key is registered with GitHub:
       export AG_DEV_PROMPTS_REPO=git@github.com:${REPO_SLUG}.git
       yarn

Verify HTTPS access directly:
  git ls-remote https://github.com/${REPO_SLUG}.git
EOF
            ;;
        gh)
            cat >&2 <<EOF
Auth path: token sourced from \`gh auth token\` (gh configured for https git ops).

The token was accepted by gh but rejected by GitHub for ${REPO_SLUG}.

Common causes:
  * gh session expired or missing scopes — refresh:
      gh auth refresh -h github.com -s repo
      gh auth setup-git
      yarn
  * gh account lacks access to ${REPO_SLUG}. Log in with an account that
    has access, or switch accounts:
      gh auth switch
      yarn
  * Org enforces SAML SSO and the token isn't authorized for ag-grid — open
    the SSO link printed by \`gh auth refresh\` above, then retry.

Verify the token directly:
  curl -sSf -H "Authorization: Bearer \$(gh auth token)" \\
    https://api.github.com/repos/${REPO_SLUG} >/dev/null \\
    && echo "token OK" || echo "token rejected"
EOF
            ;;
        gh-ssh)
            cat >&2 <<EOF
Auth path: SSH via gh (gh is configured for ssh git operations for github.com).

SSH clone was attempted from $REPO_URL and failed. Likely causes:

  * SSH key not loaded into ssh-agent:
      ssh-add -l
      ssh-add ~/.ssh/id_ed25519     # or your key path

  * SSH key not registered with GitHub, or missing SAML SSO authorization
    for the ag-grid org:
      gh ssh-key list
      # Register:  https://github.com/settings/keys
      # Authorize: https://github.com/organizations/ag-grid/sso

  * Prefer HTTPS? Switch gh's git protocol and re-run:
      gh config set -h github.com git_protocol https
      gh auth setup-git
      yarn

Verify SSH access directly:
  ssh -T git@github.com
EOF
            ;;
        origin-ssh)
            cat >&2 <<EOF
Auth path: SSH inferred from the consumer repo's origin remote.

No GITHUB_TOKEN and no \`gh\` login were found, but this repo's \`origin\`
points at github.com over SSH, so we tried the same scheme for
${REPO_SLUG} and it failed. Likely causes:

  * SSH key not loaded into ssh-agent:
      ssh-add -l
      ssh-add ~/.ssh/id_ed25519     # or your key path

  * SSH key registered with GitHub but missing SAML SSO authorization
    for the ag-grid org:
      # Authorize: https://github.com/organizations/ag-grid/sso

  * Prefer HTTPS instead? Install gh and authenticate:
      brew install gh
      gh auth login --hostname github.com --git-protocol https --web
      gh auth setup-git
      yarn

  * Or supply a token directly:
      export GITHUB_TOKEN=ghp_...
      yarn

Verify SSH access directly:
  ssh -T git@github.com
EOF
            ;;
        token)
            cat >&2 <<EOF
Auth path: GITHUB_TOKEN (likely CI, or you exported one locally).

Common causes:
  * Token expired or revoked.
  * Token missing 'repo' scope (private repo access required).
  * Token belongs to an account without access to ${REPO_SLUG}.

To fix:
  * CI: rotate the ${REPO_SLUG} read token in the repo/org secrets.
  * Local: re-authenticate with gh and refresh the token:
      gh auth refresh -h github.com -s repo
      export GITHUB_TOKEN=\$(gh auth token)
      yarn

Verify the token directly:
  curl -sSf -H "Authorization: Bearer \$GITHUB_TOKEN" https://api.github.com/repos/${REPO_SLUG} >/dev/null \\
    && echo "token OK" || echo "token rejected"
EOF
            ;;
        override)
            cat >&2 <<EOF
Auth path: AG_DEV_PROMPTS_REPO override (= $REPO_URL).

This URL was supplied via the AG_DEV_PROMPTS_REPO env var. Check that it
points at a reachable remote and that your current credentials (SSH key or
GITHUB_TOKEN) grant access. Unset the variable to fall back to the default
(${REPO_SLUG}):

  unset AG_DEV_PROMPTS_REPO
  yarn
EOF
            ;;
    esac
    echo "" >&2
    echo "After fixing, re-run: yarn   (or: ./external/ag-shared/scripts/setup-prompts/setup-prompts.sh)" >&2
    echo "" >&2
}

trap 'print_remediation $?' ERR

REPO_URL=$(resolve_repo_url)

mkdir -p "$CACHE_ROOT"

if [[ ! -d "$REPO_DIR/.git" ]]; then
    git ${GIT_AUTH_ARGS[@]+"${GIT_AUTH_ARGS[@]}"} clone --depth=1 --filter=blob:none --branch "$REF" "$REPO_URL" "$REPO_DIR" >&2
else
    # Keep the remote URL in sync (no credentials embedded) in case the slug or
    # AG_DEV_PROMPTS_REPO changed between runs.
    git -C "$REPO_DIR" remote set-url origin "$REPO_URL"
    git ${GIT_AUTH_ARGS[@]+"${GIT_AUTH_ARGS[@]}"} -C "$REPO_DIR" fetch --depth=1 --quiet origin "$REF" >&2
    git -C "$REPO_DIR" reset --hard --quiet FETCH_HEAD >&2
fi

# Emit the resolved SHA on stdout so callers can pin
(cd "$REPO_DIR" && git rev-parse HEAD)
