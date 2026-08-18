// Runs the merged unit-test suite directly via the root Vitest config's project list, bypassing Nx:
// package (London-school) unit tests plus the behavioural (Chicago-school) black-box suite — one command.
// That list also carries the node-env tooling projects (docs, ag-website-shared) so the IDE can
// discover them; by default this gate restricts the run to the unit projects.
import { INLINE, NONE, NUMBER, VALUE, captureUsage, isCI } from '../args.mjs';

// Default projects when the caller doesn't pick their own with --project (values are vitest test.names).
const UNIT_PROJECTS = ['ag-stack', 'ag-grid-community', 'ag-grid-enterprise', 'locale', 'behavioural'];

export default {
    name: 'behave',
    script: 'behave.sh',
    helpCommand: ['vitest', '--help'],
    failRe: /^( FAIL|\s+×)/,
    summaryRe: /^ *(Test Files|Tests|Duration) /,

    flags: {
        '--update-grid-rows': {
            takes: INLINE,
            operands: ['dry'],
            apply(state, value) {
                if (value !== undefined && value !== 'dry') {
                    console.error(
                        `Unknown value: --update-grid-rows=${value} (expected --update-grid-rows or --update-grid-rows=dry)`
                    );
                    process.exit(1);
                }
                process.env.UPDATE_GRID_ROWS_SNAPSHOTS = value ?? '1';
            },
        },
        '--no-diff': { takes: NONE, apply: () => (process.env.AG_NO_DIFF = '1') },
        '--diff-lines': {
            takes: NUMBER,
            hint: 'a line count, 0 = unlimited',
            apply: (state, value) => (process.env.AG_DIFF_LINES = value),
        },
        '--slowest': {
            takes: NUMBER,
            hint: 'a test count, 0 = no table',
            apply: (state, value) => (process.env.AG_SLOWEST_TESTS = value),
        },
        '--stack-trace-len': {
            takes: NUMBER,
            hint: 'a frame count, e.g. 20',
            apply(state, value) {
                // Below ~20 every inline snapshot fails "Couldn't infer stack frame". Allowed, but not silently.
                if (Number(value) < 20) {
                    console.error(`behave.sh: --stack-trace-len ${value} may break inline snapshots (keep >= 20)`);
                }
                process.env.AG_STACK_TRACE_LEN = value;
            },
        },
        '--project': {
            takes: VALUE,
            hint: 'e.g. --project behavioural or --project all',
            apply(state, value) {
                if (value === 'all') {
                    state.allProjects = true; // no filter, every workspace project
                } else {
                    state.chosenProjects = true; // run theirs instead of the defaults
                    state.forward.push('--project', value);
                }
            },
        },
        '-w': { takes: NONE, apply: (state) => watch(state, '-w') },
        '--watch': { takes: NONE, apply: (state) => watch(state, '--watch') },
    },

    // `--ui` implies watch inside vitest, so it never finishes either and is not spelled here as a flag.
    endless: (state) =>
        state.watch || state.forward.includes('--ui') ? '--watch/--ui, which never finish' : undefined,

    plan({ bin, runLog, state }) {
        // Colour is for humans: an interactive terminal or CI (whose log viewer renders ANSI). An AI agent or
        // a pipe reads the escapes as noise, and vitest emits them regardless of isTTY, so say so explicitly.
        if (!process.env.NO_COLOR && !process.env.FORCE_COLOR) {
            const agent = process.env.CLAUDECODE || process.env.AI_AGENT;
            if (agent || (!isCI && !process.stdout.isTTY)) {
                process.env.NO_COLOR = '1';
            }
        }
        // A machine-readable copy beside the log, for reading a failure back without parsing console output.
        if (runLog.enabled) {
            process.env.AG_RESULT_JSON = runLog.resultJson;
        }
        const projects =
            state.allProjects || state.chosenProjects ? [] : UNIT_PROJECTS.flatMap((name) => ['--project', name]);
        return { command: bin('vitest'), args: [...projects, ...state.forward] };
    },

    usage: `
Usage: ./behave.sh [pattern] [options]

  pattern                       A file-name pattern forwarded to vitest (e.g. "tooltip"), or a path.
                                Omit to run the whole unit suite (package + behavioural).
  -t "name"                     Run a single test by name, e.g. ./behave.sh "tooltip" -t "shows tooltip".

Projects:
  (default)                     The unit projects: ag-stack, ag-grid-community, ag-grid-enterprise,
                                locale, behavioural.
  --project <name>              Run specific workspace project(s) instead, e.g. --project ag-grid-docs.
  --project all                 Run every project in the workspace (incl. docs, website).

Modes:
  -w, --watch                   Watch mode (re-runs on file changes).
  --update                      Update vitest snapshots.
  --update-grid-rows[=dry]      Update GridRows inline snapshots (dry = preview only).

Timing:
  --slowest N                   List the N slowest tests and files at the end (default 5, 0 = off).
                                Quiet below the floors in testing/shared/vitest/timings.ts.

Run capture (local only; CI keeps its own logs). Every run prints an id first and streams stdout+stderr
to tmp/_behave-output/<id>/output.log, plus result.json for machine reading. tmp/_behave-output/latest
points at the newest. Nothing extra is needed to inspect a red run — read that log:
${captureUsage({ runner: 'vitest' })}

Output volume, for when a suite fails wholesale and the diffs dwarf the results:
  --bail 1                      Stop at the first failing test.
  --no-diff                     Report which tests fail; no assertion diff, snapshots cut to a line.
  --diff-lines 10               Cap each diff at 10 lines (0 = unlimited).
  --stack-trace-len 20          Shorten captured stacks; default 40, keep >= 20.

  -h, --help                    Show vitest's own help, then this.

Anything else is forwarded verbatim to vitest.
`,
};

function watch(state, arg) {
    state.watch = true;
    state.forward.push(arg);
}
