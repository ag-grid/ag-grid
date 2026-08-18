// Pre-commit gate: type-check + lint + spec type-check for the grid packages and the behavioural suite.
//
// Runs every task in ONE Nx invocation so they execute in parallel and hit the Nx cache — much faster than
// chaining a `yarn nx <target> <project>` per gate, which re-pays Nx startup each time and forces the tasks
// to run serially. Output is suppressed unless something fails.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { NONE, VALUE, captureUsage } from '../args.mjs';
import { stripAnsi } from '../run-log.mjs';

// Empty means every project. Nx skips projects that lack a target, so the gate covers the same ground as
// CI's `yarn nx lint` rather than a hand-maintained subset that silently drifts as packages are added.
const DEFAULT_TARGETS = 'build:types,lint,build:test';

// Nx has no "auto" and defaults to 3, which idles cores on a gate whose graph is ~5 tasks wide. Capped at 8
// so small runners do not thrash on memory-hungry tsc processes; a passed --parallel=N wins (nx takes last).
const MAX_PARALLEL = 8;

// What Nx prints instead of failing when `-t`/`-p` select nothing at all.
const NOTHING_RAN = /^\s*NX\s+No tasks were run/m;

// How Nx marks a failing task inline. Spelled once: it is both this gate's `failRe` and how `failedTasks`
// names them back, and two spellings of it would parse the same line differently.
const FAILED_TASK = /^\s*✖\s+nx run\s+(\S+)/;

export default {
    name: 'checks',
    script: 'checks.sh',
    // Nx output is never watched live, only read back, so it goes straight to the file.
    capture: 'file',
    // The verdict below is this gate's own summary; the run log must not print it a second time.
    report: false,
    // The verdict line is echoed into the log too, so `--wait` sees it.
    failRe: FAILED_TASK,
    summaryRe: /^CHECKS-(PASSED|FAILED)/,

    flags: {
        '--projects': {
            takes: VALUE,
            hint: 'comma-separated, e.g. ag-grid-community,ag-grid-enterprise',
            apply: (state, value) => (state.projects = value),
        },
        '--targets': {
            takes: VALUE,
            hint: 'comma-separated, e.g. build:types,lint',
            apply: (state, value) => (state.targets = value),
        },
        '--fresh': { takes: NONE, apply: (state) => state.forward.push('--skip-nx-cache') },
        '--warn': { takes: NONE, apply: (state) => (state.showWarnings = true) },
        '--verbose': { takes: NONE, apply: (state) => (state.verbose = true) },
    },

    plan({ bin, rootDir, runLog, state }) {
        // The Nx daemon deadlocks on piped stdio in agent/CI shells; a single invocation only pays graph cost once.
        process.env.NX_DAEMON = 'false';
        state.targets ??= DEFAULT_TARGETS;
        state.started = Date.now();
        // Without the run log there is still a file to read back, just a disposable one - the output is far too
        // long to hold in the terminal, and only a failure needs to show any of it.
        state.log = runLog.enabled
            ? runLog.file
            : path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ag-checks-')), 'output.log');
        const projects = state.projects ? ['-p', ...state.projects.split(',')] : [];
        return {
            command: bin('nx'),
            args: [
                'run-many',
                '-t',
                ...state.targets.split(','),
                ...projects,
                `--parallel=${Math.min(os.availableParallelism(), MAX_PARALLEL)}`,
                '--output-style=stream',
                ...state.forward,
            ],
            cwd: rootDir,
            file: state.log,
            // A temp log is only ever printed to a console, so it keeps Nx's colours; a run log is read back
            // with grep, where they would be noise.
            colour: !runLog.enabled,
        };
    },

    afterRun({ rootDir, runLog, state }, code) {
        try {
            const raw = readLog(state.log);
            if (code !== 0 || state.verbose) {
                process.stdout.write(raw);
            }
            // Nx colours its output, which leaves an escape sequence flush against the word "warning" and
            // defeats any word-boundary match, so everything parsed below reads the stripped copy.
            const log = stripAnsi(raw);
            const elapsed = Math.round((Date.now() - state.started) / 1000);
            const summary = `targets: ${state.targets} | projects: ${state.projects || 'all'}`;
            // Every verdict is built once and echoed, so the console and the log cannot say different things:
            // the log is what a later reader (or `--wait`) has, and it must record whether the gate passed.
            if (code !== 0) {
                runLog.echo(`CHECKS-FAILED (${elapsed}s) — ${summary}`, console.error);
                for (const task of failedTasks(log)) {
                    console.error(`  failed: ${task}`);
                }
                return code;
            }
            // Nx exits 0 when a filter matches nothing, which would report a gate that never ran as one that
            // passed. Both filters are typed by hand, and these are Nx project names, not the vitest ones
            // ./behave.sh takes, so matching nothing is a mistake every time. 2, to tell it from a real failure.
            if (NOTHING_RAN.test(log)) {
                runLog.echo(
                    `CHECKS-FAILED (${elapsed}s) — ${summary} — no task matched, nothing was checked`,
                    console.error
                );
                return 2;
            }
            const passed = `CHECKS-PASSED (${elapsed}s) — ${summary}`;
            const warnings = countWarnings(log);
            if (!warnings) {
                runLog.echo(passed);
                return code;
            }
            runLog.echo(`${passed} — ${warnings} warnings`);
            reportWarnings(log, warnings, state.showWarnings, rootDir);
            return code;
        } finally {
            if (!runLog.enabled) {
                fs.rmSync(path.dirname(state.log), { recursive: true, force: true });
            }
        }
    },

    usage: `
Usage: ./checks.sh [options] [extra nx args]

  (default)                     The full gate — build:types, lint and build:test for every project,
                                in one Nx invocation so the tasks run in parallel and hit the cache.
  --projects a,b                Narrow to specific projects.
  --targets lint                Override the target list.
  --fresh                       Bypass the Nx cache.
  --warn                        Print the warnings a passing run produced.
  --verbose                     Print task output even when everything passes.

Run capture (local only; CI keeps its own logs). Every run prints an id first and writes the full task
output to tmp/_checks-output/<id>/output.log, whether it passed or not. Read that instead of re-running:
${captureUsage({ runner: 'Nx', quiet: false })}

  -h, --help                    Show this.

Anything else is forwarded verbatim to \`nx run-many\`.
`,
};

const readLog = (file) => {
    try {
        return fs.readFileSync(file, 'utf8');
    } catch {
        return '';
    }
};

// Sums ESLint's own per-project totals. Counting matching lines instead would miss wrapped messages and
// double-count the "N warnings potentially fixable" footer.
function countWarnings(log) {
    let total = 0;
    for (const [, count] of log.matchAll(/\d+ problems? \(\d+ errors?, (\d+) warnings?\)/g)) {
        total += Number(count);
    }
    return total;
}

// Kept next to the other tooling scratch (ag-watch-status.json), so a passing gate can point at its warnings
// instead of discarding them with the temp log. Rewritten by any run that has warnings to report.
const WARNINGS_LOG = 'node_modules/.cache/ag-checks-warnings.log';
// Keep the file-path lines ESLint prints above each block, or the rows say nothing about where. Nx prefixes
// streamed lines with the task name, so the path is not always at the start of a line.
const WARNING_LINE = /\d+:\d+\s+warning|problems? \(|^([^:]+: )?\/.*\.(ts|tsx|js|jsx|mjs|cjs|vue|astro)$/;

// Resolved against the repo root, not the cwd: only the Nx child is given that cwd, so a gate invoked by
// path from another directory would otherwise write under the caller's tree, or fail to write at all.
function reportWarnings(log, warnings, print, rootDir) {
    let file = path.join(rootDir, WARNINGS_LOG);
    try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, log);
    } catch {
        // A failed write must not leave the summary pointing at an absent log, or at a previous run's.
        file = '';
    }
    if (!file) {
        console.log(`  ${warnings} warnings (could not be written to disk)`);
    } else if (print) {
        for (const line of log.split('\n').filter((line) => WARNING_LINE.test(line))) {
            console.log(line);
        }
        console.log(`  ${warnings} warnings: ${file}`);
    } else {
        console.log(`  ${warnings} warnings (run with --warn to print them): ${file}`);
    }
}

// Reprinted at the end so the failing tasks are the last thing on screen rather than lost up the stream.
// Two sources because neither is complete on its own: Nx marks each failure inline as "✖ nx run <task>",
// while its closing bullet list is capped at a handful of tasks but survives an interleaved stream.
const TASK_ID = /^[A-Za-z0-9@._/-]+:[A-Za-z0-9:._-]+$/;

function failedTasks(log) {
    const tasks = new Set();
    let inList = false;
    for (const line of log.split('\n')) {
        const inline = line.match(FAILED_TASK);
        if (inline) {
            tasks.add(inline[1]);
        } else if (/^\s*(Failed tasks:|✖\s+\d+\/\d+ targets failed)/.test(line)) {
            inList = true;
        } else if (inList && /^\s*-\s/.test(line)) {
            // Only bullets that look like a task id: a task's own output can pose as Nx's summary list.
            const task = line.replace(/^\s*-\s*/, '').replace(/^nx run\s+/, '');
            if (TASK_ID.test(task)) {
                tasks.add(task);
            }
        } else if (inList && line.trim()) {
            inList = false;
        }
    }
    return [...tasks].sort();
}
