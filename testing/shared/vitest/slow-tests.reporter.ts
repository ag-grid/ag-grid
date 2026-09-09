import type { Reporter, TestModule } from 'vitest/node';

import {
    SLOWEST_FILE_MIN_MS,
    SLOWEST_MIN_MS,
    SLOWEST_TESTS_COUNT,
    SLOW_TEST_WARN_MS,
    TEST_TIMEOUT_MS,
    WAITING_MIN_MS,
} from './timings';

interface TimedTest {
    name: string;
    file: string;
    duration: number;
    passed: boolean;
    /** Fraction of the test spent waiting rather than working, from the setup file's event-loop reads. */
    waitFraction?: number;
}

/**
 * Reports what a run spent its time on: the slowest few tests every time, and a warning for any approaching
 * `testTimeout`. Without a standing report, a test that slow only surfaces once it trips the cap outright.
 */
export default class SlowTestsReporter implements Reporter {
    private startedAt = 0;

    // Per run, not per process: in watch mode `onInit` fires once and every later run would be measured
    // against the age of the session instead of its own wall clock.
    onTestRunStart(): void {
        this.startedAt = Date.now();
    }

    onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
        const tests = collectTests(testModules);
        tests.sort((a, b) => b.duration - a.duration);

        if (SLOWEST_TESTS_COUNT > 0) {
            const slowest = tests.filter((test) => test.duration >= SLOWEST_MIN_MS).slice(0, SLOWEST_TESTS_COUNT);
            if (slowest.length) {
                console.info(`\nSlowest tests over ${secs(SLOWEST_MIN_MS).trim()}:\n${format(slowest)}`);
            }

            // A file is slow either because it holds a lot of tests or because each one is slow, and only
            // the second is a defect - so rank files by total but show the rate that tells them apart.
            // Pointless when the run was a single file, which the per-test table already covers.
            const byFile = slowestFiles(testModules, tests);
            if (byFile.length > 1) {
                const shown = byFile.filter((f) => f.duration >= SLOWEST_FILE_MIN_MS).slice(0, SLOWEST_TESTS_COUNT);
                if (shown.length) {
                    console.info(
                        `\nSlowest test files over ${secs(SLOWEST_FILE_MIN_MS).trim()}:\n${formatFiles(shown)}`
                    );
                }
            }

            // Ranked and gated on the idle time itself, not on its share: 3s of idle inside a 10s file is 3s
            // to reclaim whether or not it clears some percentage. Outside the multi-file guard above, since
            // a single-file run is exactly when a wait is being chased.
            const waiting = byFile
                .filter((f) => f.idleMs >= WAITING_MIN_MS)
                .sort((a, b) => b.idleMs - a.idleMs)
                .slice(0, SLOWEST_TESTS_COUNT);
            if (waiting.length) {
                console.info(
                    `\nIdle, over ${secs(WAITING_MIN_MS).trim()} off-CPU (usually a timer out-waited; RPC and snapshot writes land here too):` +
                        `\n${formatWaiting(waiting)}`
                );
            }

            const budget = budgetLine(testModules, Date.now() - this.startedAt);
            if (budget) {
                console.info(budget);
            }
        }

        // Failures are excluded: a test that timed out reports the timeout as its duration, which would
        // top the warning list while saying nothing the run's own error output has not already said.
        const slow = tests.filter((test) => test.passed && test.duration >= SLOW_TEST_WARN_MS);
        if (slow.length) {
            console.warn(
                `\n! ${slow.length} test(s) over ${SLOW_TEST_WARN_MS / 1000}s (testTimeout is ${TEST_TIMEOUT_MS / 1000}s):\n${format(slow)}`
            );
        }
    }
}

interface TimedFile {
    file: string;
    duration: number;
    count: number;
    idleMs: number;
}

/**
 * The run's own overhead, a line rather than a table: per-file load is flat, so there is nothing to rank.
 * It makes the trade visible - a new file is never free, and past core count only fewer worker-seconds help.
 */
function budgetLine(modules: ReadonlyArray<TestModule>, wallMs: number): string | undefined {
    if (!modules.length || wallMs <= 0) {
        return undefined;
    }
    let loadMs = 0;
    let runMs = 0;
    for (const module of modules) {
        const { collectDuration, setupDuration, prepareDuration, environmentSetupDuration, duration } =
            module.diagnostic();
        loadMs += collectDuration + setupDuration + prepareDuration + environmentSetupDuration;
        // The module's own figure, not the sum of its tests: that one omits beforeAll/afterAll, which is
        // where a file built around an expensive fixture keeps most of its cost.
        runMs += duration;
    }
    const workerMs = loadMs + runMs;
    return (
        `\nWorker time ${secs(workerMs).trim()} over ${secs(wallMs).trim()} wall = ${(workerMs / wallMs).toFixed(1)}x parallel` +
        `  |  ${secs(loadMs).trim()} load + ${secs(runMs).trim()} tests` +
        `  |  ${modules.length} files at ${Math.round(loadMs / modules.length)}ms load each`
    );
}

function slowestFiles(modules: ReadonlyArray<TestModule>, tests: TimedTest[]): TimedFile[] {
    const byFile = new Map<string, TimedFile>();
    // Ranked on each module's own duration, which counts its hooks: summing the tests instead would rank a
    // file built around an expensive beforeAll by the cheap part of itself.
    for (const module of modules) {
        const file = fileKey(module);
        byFile.set(file, { file, duration: module.diagnostic().duration, count: 0, idleMs: 0 });
    }
    // Idle is per test, since only a test carries the event-loop reads; hook time is counted as work.
    for (const { file, duration, waitFraction } of tests) {
        const entry = byFile.get(file);
        if (entry) {
            entry.idleMs += (waitFraction ?? 0) * duration;
            ++entry.count;
        }
    }
    return [...byFile.values()].filter(({ count }) => count > 0).sort((a, b) => b.duration - a.duration);
}

const secs = (ms: number): string => `${(ms / 1000).toFixed(1)}s`.padStart(7);

/** Waiting share of a test, the first thing worth knowing about a slow one: high means a timer, not work. */
const wait = (fraction: number | undefined): string =>
    (fraction == null ? '' : `${Math.round(fraction * 100)}% wait`).padStart(8);

function formatFiles(files: TimedFile[]): string {
    return files
        .map(
            ({ file, duration, count, idleMs }) =>
                `  ${secs(duration)} ${wait(duration > 0 ? idleMs / duration : undefined)}  ${`${Math.round(duration / count)}ms/test`.padStart(11)}  ${String(count).padStart(4)} tests  ${file}`
        )
        .join('\n');
}

function formatWaiting(files: TimedFile[]): string {
    return files
        .map(
            ({ file, duration, count, idleMs }) =>
                `  ${secs(idleMs)} idle of ${secs(duration)} ${wait(idleMs / duration)}  ${String(count).padStart(4)} tests  ${file}`
        )
        .join('\n');
}

/** The one key files are grouped by, so the module-derived and test-derived halves cannot disagree. */
const fileKey = (module: TestModule): string => shortPath(module.project.name, module.relativeModuleId);

/**
 * Every line carries a path, so the roots they all share are noise. Prefixed with the project because the
 * id is relative to that project's own root: two projects' `src/main-internal.test.ts` are different files.
 */
function shortPath(project: string, file: string): string {
    const withinProject = file
        .replace(/^testing\/[^/]+\/src\//, '')
        .replace(/^packages\/[^/]+\/src\//, '')
        .replace(/^src\//, '');
    return `${project}/${withinProject}`;
}

const MAX_LINE = 120;

function format(tests: TimedTest[]): string {
    return tests
        .map(({ name, file, duration, passed, waitFraction }) => {
            // Names in a `test.each` matrix differ at the front and repeat at the back, so trim the tail. ASCII
            // only - a plain terminal renders a fancy separator or ellipsis as escape-sequence garbage.
            const line = `  ${secs(duration)} ${wait(waitFraction)} ${file}${passed ? '' : ' (failed)'}  ${name}`;
            return line.length > MAX_LINE ? `${line.slice(0, MAX_LINE - 3)}...` : line;
        })
        .join('\n');
}

function collectTests(modules: ReadonlyArray<TestModule>): TimedTest[] {
    const out: TimedTest[] = [];
    for (const module of modules) {
        for (const test of module.children.allTests()) {
            const state = test.result().state;
            // Skipped tests have no duration worth ranking.
            if (state !== 'passed' && state !== 'failed') {
                continue;
            }
            const { activeMs, idleMs } = test.meta();
            const loopMs = (activeMs ?? 0) + (idleMs ?? 0);
            out.push({
                name: test.name,
                file: fileKey(module),
                duration: test.diagnostic()?.duration ?? 0,
                passed: state === 'passed',
                waitFraction: loopMs > 0 ? (idleMs ?? 0) / loopMs : undefined,
            });
        }
    }
    return out;
}
