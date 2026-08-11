// Output-volume controls shared by every unit project, so `./behave.sh --no-diff` and friends mean the same
// thing whichever `--project` is selected. A setup file because these must apply inside the worker.
import { chai } from 'vitest';

// `process` is absent in browser mode (BENCH_BROWSER), so guard the env reads.
const env = typeof process !== 'undefined' ? process.env : undefined;

// Long enough to see through the grid's event plumbing. Don't go far below 20: vitest walks the stack to
// locate an inline snapshot, so a short limit fails every one with "Couldn't infer stack frame".
const stackTraceLen = Number(env?.AG_STACK_TRACE_LEN);
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
