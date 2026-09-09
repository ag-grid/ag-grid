// Output controls shared by every unit project, so `./behave.sh --no-diff` and friends mean the same thing
// whichever `--project` is selected. A setup file because these must apply inside the worker - which is a
// *browser* one under `./benches.sh`, hence no static node import and thresholds from the node-free `timings`.
import type { EventLoopUtilization } from 'node:perf_hooks';
import type { TestContext } from 'vitest';
import { afterEach, beforeEach, chai } from 'vitest';

import { TEST_TIMEOUT_MS } from './timings';

// `process` is absent in browser mode (BENCH_BROWSER), so guard the env reads.
const env = typeof process !== 'undefined' ? process.env : undefined;
const isNode = typeof process !== 'undefined' && process.versions?.node != null;

// From `node:perf_hooks`, not the global: under a DOM environment `performance` is the environment's own,
// which has no `eventLoopUtilization`. Undefined off node, where there is no event loop to read.
const eventLoopUtilization = isNode ? (await import('node:perf_hooks')).performance.eventLoopUtilization : undefined;

// Long enough to see through the grid's event plumbing. Don't go far below 20: vitest walks the stack to
// locate an inline snapshot, so a short limit fails every one with "Couldn't infer stack frame".
const stackTraceLen = Number(env?.AG_STACK_TRACE_LEN || NaN);
if (Number.isFinite(stackTraceLen)) {
    Error.stackTraceLimit = stackTraceLen;
} else if (Error.stackTraceLimit < 40) {
    Error.stackTraceLimit = 40;
}

// Vitest's diff stringifies both sides and re-walks them at halved depth past 10K chars, which is unbounded
// for a DOM node or a grid bean. chai only sets `showDiff: true` when this is true, and vitest skips the diff
// when it is explicitly false, so one flag turns the whole path off.
if (env?.AG_NO_DIFF) {
    chai.config.showDiff = false;
}

// A failed testing-library query prints the whole container, and a grid container is ~100KB of DOM. The
// library default of 7000 chars is several screens of markup; 1000 still shows the subtree.
if (env && !env.DEBUG_PRINT_LIMIT) {
    env.DEBUG_PRINT_LIMIT = '1000';
}

// Enforced on measured duration, because a per-test timeout argument opts out of `testTimeout` entirely.
// Tests only: vitest's benchmark runner drives tinybench directly and never calls these hooks.
// Bound before any test can install fake timers, which replace `performance.now`.
const realNow = performance.now.bind(performance);

// Keyed by task rather than held in a module global: a `concurrent` suite overlaps these hooks, and a
// shared pair of variables would then bill one test for another's wait.
const startedAt = new WeakMap<object, { at: number; elu: EventLoopUtilization | undefined }>();
beforeEach((ctx: TestContext) => {
    if (ctx.task) {
        // Before the body runs, since the duration check below cannot pre-empt a worker blocked for minutes.
        // The whole range, not just the top: vitest disables enforcement outright for 0, a negative or
        // Infinity, so those are no cap at all rather than a longer one.
        const timeout = ctx.task.timeout;
        if (timeout != null && !(timeout > 0 && timeout <= TEST_TIMEOUT_MS)) {
            throw new Error(
                `This test overrides its timeout to ${timeout}ms, outside the 1..${TEST_TIMEOUT_MS}ms allowed range.` +
                    ` A test needing longer is waiting on something - find what it waits on, or split the case up.`
            );
        }
        startedAt.set(ctx.task, { at: realNow(), elu: eventLoopUtilization?.() });
    }
});
// Typed against vitest's own `TestContext`, so a rename fails the type-check rather than silently
// blanking the reporter's idle tables.
afterEach((ctx: TestContext) => {
    const started = ctx.task && startedAt.get(ctx.task);
    if (!started) {
        return;
    }
    // Skipped for a concurrent task: the counter covers the whole worker, so overlapping tests would each
    // be billed the others' idle. The suite has none today, and a wrong number is worse than no number.
    if (eventLoopUtilization && started.elu && ctx.task.meta && !ctx.task.concurrent) {
        // `active` is time this thread had work on the loop; `idle` is time it sat waiting on a timer or IO.
        const { active, idle } = eventLoopUtilization(started.elu);
        ctx.task.meta.activeMs = active;
        ctx.task.meta.idleMs = idle;
    }
    const elapsedMs = Math.round(realNow() - started.at);
    // A test killed by `testTimeout` already reports a duration at the cap, so failing it again here would
    // only staple a second, contradictory error onto the real one.
    if (elapsedMs > TEST_TIMEOUT_MS && ctx.task?.result?.state !== 'fail') {
        throw new Error(
            `Test took ${(elapsedMs / 1000).toFixed(1)}s, over the ${TEST_TIMEOUT_MS / 1000}s limit. A test this slow is` +
                ` usually waiting on a timeout rather than working - find what it waits on, or split the case up.`
        );
    }
});
