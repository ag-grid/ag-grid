// Runs behavioural benchmarks directly via Vitest, bypassing Nx.
// Benchmarks run in a real headless Chromium (Playwright), so layout-dependent work is measured against a
// real layout engine. All other arguments are forwarded to `vitest bench`.
import fs from 'node:fs';
import path from 'node:path';

import { NONE, captureUsage } from '../args.mjs';
import { spawnAwait } from '../run-log.mjs';

// Profiles live under benchmarks/tmp/ which is already git-ignored, so no separate ignore needed.
const PROFILES = 'testing/behavioural/src/benchmarks/tmp/profiles';

export default {
    name: 'bench',
    script: 'benches.sh',
    helpCommand: ['vitest', 'bench', '--help'],
    failRe: /^( FAIL|\s+×)/,
    // `vitest bench` reports a table rather than test counts; these are the lines worth echoing back. The
    // profiles line is in there because --profile --async is exactly the case where the terminal has nothing
    // else to go on.
    summaryRe: /^ *(BENCH|Duration|Bench Files|CPU profiles written)/,

    // `--bench-compare [args...]` is a thin pass-through to the bench-compare.mjs tool, handled before
    // anything else reads argv so its sub-commands and flags (base/test/compare/all/backup, --runs, --filter,
    // …) reach that script untouched.
    preParse({ argv, rootDir }) {
        if (argv[0] !== '--bench-compare') {
            return undefined;
        }
        return spawnAwait(
            process.execPath,
            [path.join(rootDir, 'testing/behavioural/src/benchmarks/bench-compare.mjs'), ...argv.slice(1)],
            { cwd: rootDir, stdio: 'inherit' }
        );
    },

    flags: {
        '-w': { takes: NONE, apply: (state) => watchMode(state, '-w') },
        '--watch': { takes: NONE, apply: (state) => watchMode(state, '--watch') },
        '--headed': { takes: NONE, apply: () => headed() },
        '--interactive': { takes: NONE, apply: () => headed() },
        '--ui': {
            takes: NONE,
            apply(state) {
                // Visible browser + the Vitest dashboard (bench picker) at a localhost URL. --standalone
                // starts WITHOUT running anything (pick benches from the dashboard); --watch keeps the
                // server + browser alive (and is required by --standalone). CLI --watch beats config watch:false.
                headed();
                state.endless = true;
                state.forward.push('--ui', '--standalone', '--watch');
            },
        },
        '--profile': {
            takes: NONE,
            apply(state) {
                // A CDP CPU profile of each bench's measured run. Profiling distorts timing — not for numbers.
                state.profile = true;
                process.env.BENCH_PROFILE = '1';
            },
        },
    },

    // Watch and --ui never end, so there is nothing to capture and nothing to wait for. No reason string:
    // --async is refused for them by the generic "the run log is off" message.
    endless: (state) => state.endless,

    async plan({ bin, rootDir, state }) {
        const profileDir = path.join(rootDir, PROFILES);
        if (state.profile) {
            process.env.BENCH_PROFILE_DIR = profileDir;
            fs.mkdirSync(profileDir, { recursive: true });
            // Taken before the run so a failed one cannot report earlier profiles as its own.
            state.profileStart = Date.now();
        }
        return {
            command: bin('vitest'),
            args: ['bench', ...(state.endless ? [] : ['--run']), ...state.forward],
            cwd: path.join(rootDir, 'testing/behavioural'),
        };
    },

    // In `beforeRun` rather than `plan`, so the download lands in the run log and a failed one is closed
    // through `finish`: under --async the console is /dev/null, which is where this used to report from.
    async beforeRun({ bin, rootDir, runLog, state }) {
        // Benches run in Chromium, so ensure the Playwright Chromium build matching the installed `playwright`
        // package is present (the launch fails otherwise); `install` is a no-op when it already is. The local
        // binary rather than `npx`, which would resolve from the registry if it were ever missing - the exact
        // mismatch this call exists to prevent.
        const installed = await runLog.exec(bin('playwright'), ['install', 'chromium', 'chromium-headless-shell'], {
            cwd: rootDir,
        });
        // Stop here rather than let the launch fail later, where the error names a missing browser
        // executable instead of the download that did not happen.
        if (installed !== 0) {
            runLog.echo('benches.sh: `playwright install` failed, so Chromium is not available to run in.');
        }
        return installed;
    },

    // Profiling has to name the .cpuprofile files it emitted, and through the run log rather than the console:
    // they are this gate's own output, so they would otherwise miss the log entirely and, under --async, go to
    // /dev/null after the run had already reported back.
    afterRun({ rootDir, runLog, state }, code) {
        if (state.profile) {
            const dir = path.join(rootDir, PROFILES);
            const written = profilesSince(dir, state.profileStart);
            runLog.echo('');
            if (written.length > 0) {
                runLog.echo(`CPU profiles written: ${written.length} in ${dir} (one per bench)`);
                for (const name of written) {
                    runLog.echo(`  ${name}`);
                }
                runLog.echo('Open in Chrome DevTools (Performance → Load profile) or https://speedscope.app');
            } else {
                runLog.echo('CPU profiles written: none');
            }
        }
        return code;
    },

    usage: `
Usage: ./benches.sh [pattern] [options]

  pattern                A file-name pattern forwarded to \`vitest bench\` (e.g. "grouping-pipelines").
                         Narrows the run to matching .bench.ts files. Omit to run all.

Modes:
  -w, --watch            Watch mode (re-runs on file changes).
  --headed, --interactive  Visible Chromium, single run — watch the grid render.
  --ui                   Visible Chromium + the Vitest dashboard at a localhost URL; starts WITHOUT
                         running (pick benches from the dashboard), and stays open.
  --profile              CPU-profiles each bench's measured run in Chromium (CDP) for method-cost analysis.
                         Writes one .cpuprofile per bench under benchmarks/tmp/profiles/ (printed after the
                         run); open them in Chrome DevTools or speedscope. Not for timings.
  --bench-compare ...    Pass through to bench-compare.mjs (base/test/compare/all/backup); everything
                         after it is forwarded verbatim, e.g. ./benches.sh --bench-compare all.

Run capture (local only, and not for --watch/--ui, which never end). Every run prints its log
path first and streams stdout+stderr to tmp/_bench-output/<id>/output.log — a bench run costs minutes, so
read that afterwards rather than running it twice:
${captureUsage({ runner: 'vitest', width: 25 })}
  -h, --help             Show this help.

Anything else is forwarded verbatim to \`vitest bench\`.
`,
};

// Watch keeps the runner alive between re-runs, so the run has no end for the log or `--wait` to key on.
function watchMode(state, arg) {
    state.endless = true;
    state.forward.push(arg);
}

// A visible window, not an endless mode: the browser closes when the benches finish, so the run is captured
// and can be awaited like any other. `--ui` is the one that never ends, and it says so itself.
function headed() {
    process.env.BENCH_BROWSER_HEADED = '1';
}

function profilesSince(dir, since) {
    const written = [];
    const names = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
    for (const name of names) {
        // A file removed since the listing is not this run's.
        if (
            name.endsWith('.cpuprofile') &&
            fs.statSync(path.join(dir, name), { throwIfNoEntry: false })?.mtimeMs >= since
        ) {
            written.push(name);
        }
    }
    return written.sort();
}
