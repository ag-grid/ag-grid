// Runs the docs Playwright e2e tests directly, bypassing Nx. Defaults to chromium only.
import path from 'node:path';

import { NONE, VALUE, captureUsage } from '../args.mjs';

export default {
    name: 'docs-e2e',
    script: 'docs-e2e.sh',
    // Playwright's list reporter marks a failure with `✘`, and closes with `N passed (1.2m)` / `N failed`.
    failRe: /^\s*(✘|\d+\) )/,
    summaryRe: /^\s*\d+ (passed|failed|flaky|skipped|did not run|interrupted)/,

    flags: {
        '--all-browsers': { takes: NONE, apply: (state) => (state.allBrowsers = true) },
        '--framework': {
            takes: VALUE,
            hint: 'e.g. reactFunctionalTs',
            apply: (state, value) => (process.env.FRAMEWORK = value),
        },
        '--url': {
            takes: VALUE,
            hint: 'e.g. https://localhost:4610',
            apply: (state, value) => (process.env.BASE_URL = value),
        },
        '--all-variants': { takes: NONE, apply: () => (process.env.ALL_FRAMEWORK_VARIANTS = 'true') },
    },

    // `--ui` and `--debug` hand the terminal to Playwright and never return on their own, so a captured or
    // detached run would hang holding a log nobody reads.
    endless: (state) =>
        state.forward.some((arg) => arg === '--ui' || arg.startsWith('--ui-') || arg === '--debug')
            ? '--ui/--debug, which need the terminal'
            : undefined,

    plan({ bin, rootDir, state }) {
        // Default to chromium unless --all-browsers or --project is already specified.
        const browser =
            state.allBrowsers || state.forward.some((arg) => arg.includes('--project')) ? [] : ['--project=chromium'];
        return {
            command: bin('playwright'),
            args: ['test', ...state.forward, ...browser],
            cwd: path.join(rootDir, 'documentation/ag-grid-docs'),
        };
    },

    usage: `
Usage: ./docs-e2e.sh [options] [playwright-args]

Runs docs Playwright e2e tests directly, bypassing Nx. Defaults to chromium only.
Any unrecognised arguments are forwarded directly to playwright test.

Options:
  --all-browsers          Run all browsers (chromium, firefox, webkit)
  --framework <name>      Set FRAMEWORK env var. Valid: typescript, vanilla,
                          reactFunctionalTs, reactFunctionalTs_Dev, angular, vue3.
                          Mirrors a CI shard, so reactFunctionalTs covers both React
                          builds: every example on the production one, plus the tests
                          naming reactFunctionalTs_Dev outright. Pin that instead to
                          run only those.
  --url <url>             Set BASE_URL env var (default: https://localhost:4610)
  --all-variants          Run every example against the production React variant too (or
                          ALL_FRAMEWORK_VARIANTS=true). By default examples run on one
                          React build: development locally, production in CI. Tests
                          naming a framework outright always run and are unaffected.
  --help                  Show this help message

Run capture (shared with ./behave.sh, ./checks.sh and ./benches.sh). Every run streams stdout+stderr to
tmp/_docs-e2e-output/<id>/output.log, whose path is printed first:
${captureUsage({ runner: 'playwright', width: 26 })}

Playwright options (forwarded as-is):
  "file-pattern"          Run tests matching pattern
  --grep <name>           Run tests matching name
  --project <browser>     Run specific browser project
  --headed                Run in headed mode
  --ui                    Open Playwright UI mode
  --debug                 Debug mode
  --last-failed           Re-run only the tests that failed in the previous run

Examples:
  ./docs-e2e.sh
  ./docs-e2e.sh "toolbar"
  ./docs-e2e.sh "toolbar" --grep "Quick filter"
  ./docs-e2e.sh --all-browsers
  ./docs-e2e.sh --framework reactFunctionalTs
  ./docs-e2e.sh --url https://localhost:4610
  ./docs-e2e.sh --headed
  ./docs-e2e.sh --ui

Iterate-until-green loop (re-run only failures each pass):
  ./docs-e2e.sh                 # initial run records failures to .last-run.json
  # ...fix a failing test...
  ./docs-e2e.sh --last-failed   # re-runs only the failures; repeat until it passes
`,
};
