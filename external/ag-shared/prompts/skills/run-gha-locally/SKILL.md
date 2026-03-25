---
targets: ['*']
name: run-gha-locally
description: >-
  Run GitHub Actions workflow jobs locally by reading workflow YAML and
  extracting shell commands. Use when the user asks to "run CI locally",
  "reproduce a CI failure", "run a workflow job", "test a GitHub Action
  locally", "what does the CI do", or wants to debug why a CI job failed.
  Also use when the user references a specific workflow file or job name
  they want to execute locally.
invocable: user-only
---

# Run GitHub Actions Locally

You are an expert at reading GitHub Actions workflow YAML and extracting the shell commands so they can be run locally without Docker or `act`.

Your goal is to parse the actual workflow file, classify each step, resolve expressions, and execute the commands step-by-step.

## Help

If the user provides a command option of `help`:

-   Explain how to use this prompt.
-   Explain that this skill reads workflow YAML directly and extracts shell commands — no Docker or `act` required.
-   DO NOT proceed, exit the prompt immediately after these steps.

## 1. IMPORTANT TOOLING REQUIREMENTS - STOP IF THESE ARE NOT MET

-   Git CLI must be available.
-   The repository must contain `.github/workflows/` with at least one workflow file.
-   Shell (bash/zsh) must be available for executing extracted commands.
-   Use `NX_DAEMON=false` for any Nx-based commands to avoid daemon pipe hangs.

## 2. Workflow

### Phase 1: Identify Workflow and Job

1.  **Find all workflows:**

    ```bash
    ls .github/workflows/*.yml .github/workflows/*.yaml 2>/dev/null
    ```

2.  **Parse user input from `${ARGUMENTS}`:**

    -   If the user specifies a workflow file name or path, locate it directly.
    -   If the user specifies a job name, find which workflow contains it.
    -   If the user provides a CI run URL (e.g. `https://github.com/org/repo/actions/runs/12345`), extract the workflow name from the URL or ask the user which job failed.
    -   If the user provides a failure log, identify the workflow and job from the log context.

3.  **If ambiguous, ask the user:**

    -   List all workflows with their jobs (read each YAML file's `jobs:` keys).
    -   Ask the user to pick a workflow and job.

4.  **Read the target workflow file** and identify:

    -   The target job's `steps:` array.
    -   Workflow-level `env:` block (top-level).
    -   Job-level `env:` block.
    -   The job's `strategy.matrix` block (if any).
    -   The job's `needs:` dependencies (if any).
    -   The job's `defaults.run.working-directory` (if any).

### Phase 2: Read and Classify Steps

For each step in the target job, classify it into one of three categories:

#### EXECUTE — `run:` steps

These contain shell commands to extract directly.

```yaml
- name: Build project
  run: yarn nx build my-package
```

Extract the `run:` value as the command to execute.

#### INLINE — Local composite actions (`uses: ./path`)

These reference a local composite action within the repository. The path starts with `./`.

```yaml
- name: Setup environment
  uses: ./tools/actions/setup-env
  with:
    node-version: '20'
```

To inline these:

1.  Read the composite action's `action.yml` (or `action.yaml`) at the referenced path.
2.  Process each step in `runs.steps[]` using the same classification rules as the parent workflow:
    -   **`run:` steps** — extract the shell command directly.
    -   **`uses: ./path` steps** — recursively inline the nested composite action.
    -   **`uses: third-party` steps** — apply the same SKIP logic as for workflow steps. If the third-party action performs setup required by later `run:` steps (e.g. installs a tool, configures credentials), note this and suggest a local equivalent command rather than silently dropping it.
3.  Resolve `${{ inputs.X }}` references using the values from the calling step's `with:` block.
4.  If the composite action has `inputs` with `default` values, use those when the calling step doesn't provide a `with:` value.

#### SKIP — Third-party `uses:` steps

These reference remote actions from the GitHub marketplace or other repositories.

```yaml
- name: Checkout code
  uses: actions/checkout@v4
```

**Pattern**: Any `uses:` value that does NOT start with `./` is a third-party action. These are CI infrastructure (checkout, setup-node, cache, upload-artifact, etc.) that either:

-   Are unnecessary locally (checkout — you already have the code).
-   Cannot run outside GitHub Actions (upload-artifact, github-script).
-   Handle environment setup that's already present locally (setup-node — you have node).

**Always note what's being skipped** so the user understands what CI infrastructure is not being reproduced. Format as a comment:

```
# SKIP: actions/checkout@v4 — already have local checkout
# SKIP: actions/setup-node@v4 — using local node installation
```

**Exception**: If a third-party action performs something substantive that the user needs (e.g. a custom build action), note this and suggest a manual equivalent.

### Phase 3: Resolve Expressions and Directives

#### Expression Resolution

Resolve `${{ ... }}` expressions from the actual workflow YAML context:

| Pattern | Resolution |
|---------|------------|
| `${{ env.X }}` | Look up `X` in workflow-level and job-level `env:` blocks. Job-level overrides workflow-level. |
| `${{ github.event.inputs.X }}` | Show the user the `workflow_dispatch.inputs.X` definition (including `default`). Prompt the user for a value. |
| `${{ matrix.X }}` | Read `strategy.matrix.X` values from the job. Present choices to the user and substitute the chosen value. |
| `${{ steps.ID.outputs.KEY }}` | Track via `$GITHUB_OUTPUT` simulation (see below). If the step hasn't run yet, warn the user. |
| `${{ needs.X.outputs.Y }}` | Warn: this is a cross-job dependency. Ask the user to provide the value, or offer to run the prerequisite job first. |
| `${{ secrets.X }}` | Warn that this requires a secret. Ask the user if they have the value; skip if not. |
| `${{ github.head_ref \|\| github.ref_name }}` | Resolve to `$(git branch --show-current)`. |
| `${{ github.event.pull_request.base.ref }}` | Prompt the user; default to the repository's default branch. |
| `${{ github.sha }}` | Resolve to `$(git rev-parse HEAD)`. |
| `${{ github.ref_name }}` | Resolve to `$(git branch --show-current)`. |
| `${{ github.event_name }}` | Default to `workflow_dispatch`. |
| `${{ strategy.job-total }}` | Derive from the matrix size, or prompt. |
| `${{ runner.os }}` | `Linux` on Linux, `macOS` on macOS, `Windows` on Windows. Use `uname -s` to determine. |
| `${{ runner.arch }}` | Use `uname -m` to determine. |
| `${{ github.workspace }}` | Resolve to `$(git rev-parse --show-toplevel)`. |

For any unrecognised expression, show it to the user and ask them to provide a value.

#### Step-Level Directives

-   **`working-directory:`** — Wrap the command in a subshell: `(cd <dir> && <command>)`. If the job has `defaults.run.working-directory`, apply it to all `run:` steps unless the step overrides it.
-   **`env:` on individual steps** — Prepend `export KEY=VALUE` lines before the command.
-   **`if:` conditions** — Translate simple conditions to bash comments or guards:
    -   `if: success()` or `if: always()` — note as a comment but always run.
    -   `if: failure()` — note as a comment; ask the user whether to run.
    -   `if: ${{ env.X == 'value' }}` — translate to `if [ "$X" = "value" ]; then ... fi`.
    -   Complex conditions — include as a comment for the user to evaluate.
-   **`continue-on-error: true`** — Append `|| true` to the command.
-   **`timeout-minutes:`** — Optionally wrap with `timeout <seconds>`.
-   **`shell:`** — If a step specifies `shell: python` or similar, note this and adjust accordingly.

#### `$GITHUB_OUTPUT` Simulation

Some steps write outputs that later steps consume:

```bash
# Before the first step, set up:
export GITHUB_OUTPUT=$(mktemp)
```

After each step that writes to `$GITHUB_OUTPUT` (look for `echo "key=value" >> $GITHUB_OUTPUT` or similar patterns), parse the outputs. GitHub Actions supports two formats:

**Simple format**: `key=value` (value may itself contain `=` characters)

**Multiline format** (heredoc-style):
```
key<<EOF
line1
line2
EOF
```

```bash
# After a step that writes outputs — parse both simple and multiline formats:
__parse_github_output() {
    local file="$1" step_id="$2"
    while IFS= read -r line; do
        if [[ "$line" =~ ^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$ ]]; then
            export "STEP_${step_id}_${BASH_REMATCH[1]}=${BASH_REMATCH[2]}"
        elif [[ "$line" =~ ^([a-zA-Z_][a-zA-Z0-9_]*)\<\<(.+)$ ]]; then
            local key="${BASH_REMATCH[1]}" delim="${BASH_REMATCH[2]}" val=""
            while IFS= read -r line && [[ "$line" != "$delim" ]]; do
                val+="${val:+$'\n'}${line}"
            done
            export "STEP_${step_id}_${key}=${val}"
        fi
    done < "$file"
    > "$file"  # Clear for next step
}
__parse_github_output "$GITHUB_OUTPUT" "${STEP_ID}"
```

Then substitute `${{ steps.ID.outputs.KEY }}` with the corresponding variable.

Also set up `$GITHUB_ENV` similarly for steps that write environment variables:

```bash
export GITHUB_ENV=$(mktemp)
```

After each step, source any variables written to `$GITHUB_ENV`:

```bash
if [ -s "$GITHUB_ENV" ]; then
    set -a
    source "$GITHUB_ENV"
    set +a
    > "$GITHUB_ENV"
fi
```

### Phase 4: Present and Execute

1.  **Present the extracted commands** as a numbered list with step names as comments:

    ```bash
    # === Environment Setup ===
    export NX_DAEMON=false
    export GITHUB_OUTPUT=$(mktemp)
    export GITHUB_ENV=$(mktemp)
    # ... workflow-level and job-level env vars ...

    # SKIP: actions/checkout@v4 — already have local checkout

    # Step 1: Install dependencies
    yarn install

    # Step 2: Build packages
    yarn nx build my-package

    # SKIP: actions/upload-artifact@v4 — CI artifact upload

    # Step 3: Run tests
    yarn nx test my-package
    ```

2.  **Execute step-by-step:**

    -   Run one command at a time using the Bash tool.
    -   Show the output to the user.
    -   After each step, ask whether to continue to the next step, retry, skip, or abort.

3.  **On failure:**

    -   Show the error output clearly.
    -   Suggest possible causes (missing dependencies, environment differences, etc.).
    -   Ask whether to retry the step, skip it, or abort.

## 3. Matrix Handling

When a job uses `strategy.matrix`:

```yaml
strategy:
  matrix:
    node-version: [18, 20]
    os: [ubuntu-latest, macos-latest]
```

1.  Read the matrix definition from the YAML.
2.  Present all combinations to the user.
3.  Ask which combination to run (or suggest the most relevant one based on the failure context).
4.  Substitute `${{ matrix.X }}` with the chosen values throughout all steps.

For **dynamic matrices** (e.g. `fromJson(needs.X.outputs.Y)`):

-   Warn the user that the matrix is dynamically generated.
-   Ask the user to provide the matrix values, or offer to run the prerequisite job that generates them.

## 4. Cross-Job Dependencies

When a job has `needs:` and references outputs from other jobs:

```yaml
jobs:
  build:
    outputs:
      artifact-path: ${{ steps.build.outputs.path }}
  test:
    needs: build
    steps:
      - run: echo ${{ needs.build.outputs.artifact-path }}
```

1.  **Identify** all `needs:` dependencies and what outputs are consumed.
2.  **Explain** to the user that this job depends on outputs from another job.
3.  **Offer options:**
    -   Run the prerequisite job's commands first (recursively apply this skill).
    -   Ask the user to provide the output values manually.
    -   Skip steps that depend on unavailable outputs.

## 5. Important Guidelines

### Environment Differences

Local execution differs from GitHub Actions in several ways. Note these to the user when relevant:

-   **No `GITHUB_TOKEN`**: API calls requiring authentication will fail unless the user provides a token.
-   **No artifact storage**: Upload/download artifact steps are skipped.
-   **No service containers**: Jobs using `services:` (e.g. PostgreSQL) need manual setup.
-   **No job concurrency controls**: `concurrency:` groups don't apply locally.
-   **Different OS**: The user's local OS may differ from the runner OS.

### Error Recovery

If a step fails:

1.  Check if it's a missing dependency — suggest installing it.
2.  Check if it's an environment variable issue — check which expressions weren't resolved.
3.  Check if it's a path issue — working directory may differ from CI.
4.  If the failure matches what the user is trying to reproduce, congratulate them — the CI failure has been reproduced locally.

### Performance Tips

-   Use `NX_DAEMON=false` for Nx commands.
-   Skip unnecessary build steps if the user only wants to reproduce a specific test failure.
-   Suggest running only the failing step if the earlier steps are known to succeed.

## 6. Command Arguments

**Format:** `${ARGUMENTS}` can be:

-   `<workflow-file> <job-name>` — Run a specific job from a specific workflow.
-   `<workflow-file>` — List jobs in the workflow and ask user to pick.
-   `<job-name>` — Search all workflows for this job name.
-   `<github-actions-url>` — Extract workflow/job from the URL.
-   (empty) — List all workflows and ask user to pick.

**Examples:**

-   `/run-gha-locally ci.yml lint`
-   `/run-gha-locally ci.yml`
-   `/run-gha-locally lint`
-   `/run-gha-locally https://github.com/org/repo/actions/runs/12345`
-   `/run-gha-locally` (interactive selection)
