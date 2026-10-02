// Runs the real-browser Playwright e2e suite in testing/e2e directly, bypassing Nx. Defaults to chromium only.
import fs from 'node:fs';
import path from 'node:path';

import { NONE, VALUE, captureUsage, isCI } from '../args.mjs';

const ALL_BROWSERS = ['chromium', 'firefox', 'webkit'];
const UMD_PROJECTS = 'ag-grid-community,ag-grid-enterprise';

/** `--project=x` and `--project x`, the two spellings Playwright accepts, in the forwarded arguments. */
function requestedProjects(forward) {
    const projects = [];
    forward.forEach((arg, index) => {
        if (arg.startsWith('--project=')) {
            projects.push(arg.slice('--project='.length));
        } else if (arg === '--project' && forward[index + 1]) {
            projects.push(forward[index + 1]);
        }
    });
    return projects;
}

function browsersToRun(state) {
    if (state.allBrowsers) {
        return ALL_BROWSERS;
    }
    const requested = requestedProjects(state.forward);
    return requested.length > 0 ? requested : ['chromium'];
}

export default {
    name: 'grid-e2e',
    script: 'grid-e2e.sh',
    // Playwright's list reporter marks a failure with `✘`, and closes with `N passed (1.2m)` / `N failed`.
    failRe: /^\s*(✘|\d+\) )/,
    summaryRe: /^\s*\d+ (passed|failed|flaky|skipped|did not run|interrupted)/,

    flags: {
        '--all-browsers': { takes: NONE, apply: (state) => (state.allBrowsers = true) },
        '--no-build': { takes: NONE, apply: (state) => (state.noBuild = true) },
        '--url': {
            takes: VALUE,
            hint: 'e.g. https://grid-staging.ag-grid.com',
            apply: (state, value) => {
                process.env.BASE_URL = value;
                state.noBuild = true;
            },
        },
    },

    // `--ui` and `--debug` hand the terminal to Playwright and never return on their own, so a captured or
    // detached run would hang holding a log nobody reads.
    endless: (state) =>
        state.forward.some((arg) => arg === '--ui' || arg.startsWith('--ui-') || arg === '--debug')
            ? '--ui/--debug, which need the terminal'
            : undefined,

    plan({ bin, rootDir, state }) {
        state.started = Date.now();
        state.browsers = browsersToRun(state);
        const project = requestedProjects(state.forward).length > 0 || state.allBrowsers ? [] : ['--project=chromium'];
        return {
            command: bin('playwright'),
            args: ['test', ...state.forward, ...project],
            cwd: path.join(rootDir, 'testing/e2e'),
        };
    },

    // In `beforeRun` rather than `plan`, so the build and download land in the run log and a failure is closed
    // through `finish`. The specs load the UMD bundles from each package's dist, so they are built first; Nx
    // serves an unchanged build from its cache.
    async beforeRun({ bin, rootDir, runLog, state }) {
        if (!state.noBuild) {
            process.env.NX_DAEMON = 'false';
            const built = await runLog.exec(bin('nx'), ['run-many', '-t', 'build:umd', '-p', UMD_PROJECTS], {
                cwd: rootDir,
            });
            if (built !== 0) {
                runLog.echo('grid-e2e.sh: building the UMD bundles failed, so there is nothing to test against.');
                return built;
            }
        }
        // CI installs the browsers in its own bounded, cached step (scripts/ci/install-playwright.sh).
        if (isCI) {
            return 0;
        }
        const installed = await runLog.exec(bin('playwright'), ['install', ...state.browsers], { cwd: rootDir });
        if (installed !== 0) {
            runLog.echo('grid-e2e.sh: `playwright install` failed, so the browsers are not available to run in.');
        }
        return installed;
    },

    // The elapsed time is the cost of the suite, which is the thing to watch as it grows. It goes to the run
    // log, and to the job summary under GitHub Actions.
    afterRun({ runLog, state }, code) {
        const elapsed = Math.round((Date.now() - state.started) / 1000);
        const verdict = `GRID-E2E-${code === 0 ? 'PASSED' : 'FAILED'} (${elapsed}s) — browsers: ${state.browsers.join(', ')}`;
        runLog.echo(verdict, code === 0 ? console.log : console.error);
        if (process.env.GITHUB_STEP_SUMMARY) {
            fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Grid e2e run time\n\n${verdict}\n`);
        }
        return code;
    },

    usage: `
Usage: ./grid-e2e.sh [options] [playwright-args]

Runs the real-browser Playwright specs in testing/e2e directly, bypassing Nx for the test run. Each spec builds
a grid from its own configuration in the page, community or enterprise, so no docs site or dev server is needed.
Defaults to chromium only. Any unrecognised arguments are forwarded directly to playwright test.

Before the tests it builds the UMD bundles of ag-grid-community and ag-grid-enterprise (cached by Nx when
unchanged) and, outside CI, installs the browsers it is about to use.

Options:
  --all-browsers          Run all browsers (chromium, firefox, webkit)
  --no-build              Skip the UMD build; use the bundles already in each package's dist
  --url <url>             Load the bundles from <url>/files/<package>/dist/ instead of the local build, e.g.
                          https://localhost:4610 (dev server) or https://grid-staging.ag-grid.com. Implies
                          --no-build. Also settable as BASE_URL.
  --help                  Show this help message

Run capture (shared with ./behave.sh, ./checks.sh, ./benches.sh and ./docs-e2e.sh). Every run streams stdout+stderr to
tmp/_grid-e2e-output/<id>/output.log, whose path is printed first:
${captureUsage({ runner: 'playwright', width: 26 })}

Playwright options (forwarded as-is):
  "file-pattern"          Run spec files matching pattern
  --grep <name>           Run tests matching name
  --project <browser>     Run one browser project: chromium, firefox or webkit
  --headed                Run in headed mode
  --ui                    Open Playwright UI mode
  --debug                 Debug mode
  --last-failed           Re-run only the tests that failed in the previous run

Examples:
  ./grid-e2e.sh
  ./grid-e2e.sh --all-browsers
  ./grid-e2e.sh --project=firefox
  ./grid-e2e.sh "enterprise" --grep "row group"
  ./grid-e2e.sh --headed --no-build
  ./grid-e2e.sh --url https://grid-staging.ag-grid.com
`,
};
