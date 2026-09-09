// Timing thresholds shared by the vitest configs, `slow-tests.reporter.ts` and `output.setup.ts` - which
// `./benches.sh` also loads inside a *browser* worker. Kept out of `shared.ts` for that reason: it imports
// `node:fs`. Nothing here may touch a node builtin, and `process` must stay guarded.

const env = typeof process !== 'undefined' ? process.env : undefined;

// Declared here because this is the one module both the writer (`output.setup.ts`) and the reader
// (`slow-tests.reporter.ts`) import, so the two halves cannot drift apart without a type error.
declare module 'vitest' {
    interface TaskMeta {
        /** Milliseconds this test's thread had work on the event loop, per `eventLoopUtilization()`. */
        activeMs?: number;
        /** Milliseconds it sat waiting on a timer or IO - the part a removed delay would give back. */
        idleMs?: number;
    }
}

/** Every threshold below is looser here: CI runners are slower and share cores with each other. */
const isCI = env?.CI != null;

/**
 * Per-test timeout for every unit project: several times the suite's slowest legitimate test, and far below
 * the minutes one reaches when it is waiting rather than working. Binds only where `output.setup.ts` is
 * loaded, so a suite slow by design (typedoc-links) must stay out of those projects rather than raise this.
 */
export const TEST_TIMEOUT_MS = isCI ? 60_000 : 12_000;

/**
 * Tests at or above this are reported as a warning by `slow-tests.reporter.ts`, so creep is visible as a
 * nudge rather than as the red build that follows it. The slowest legitimate test in the suite is ~3s, so
 * nothing trips this today.
 */
export const SLOW_TEST_WARN_MS = isCI ? 15_000 : 6_000;

/**
 * How many of the slowest tests `slow-tests.reporter.ts` lists when a run finishes, so the cost is visible
 * on every run rather than only once something is bad enough to warn about. `./behave.sh --slowest N` sets
 * this; 0 turns the table off.
 */
export const SLOWEST_TESTS_COUNT = Number(env?.AG_SLOWEST_TESTS ?? 5) || 0;

/**
 * Floors for those tables, so a healthy run prints nothing. A file's total is mostly how many tests it
 * holds, hence the higher file floor; 5s is where the tail starts. Measured locally, hence the CI multiplier.
 */
export const SLOWEST_MIN_MS = Number(env?.AG_SLOWEST_MIN_MS ?? (isCI ? 6_000 : 1_200));
export const SLOWEST_FILE_MIN_MS = Number(env?.AG_SLOWEST_FILE_MIN_MS ?? (isCI ? 15_000 : 5_000));

/**
 * Idle above which a file is listed as reclaimable wait. An absolute floor rather than a share of the file:
 * 3s of idle inside a 10s file is 3s to give back whether or not it clears some percentage.
 */
export const WAITING_MIN_MS = Number(env?.AG_WAITING_MIN_MS ?? (isCI ? 2_000 : 1_000));
