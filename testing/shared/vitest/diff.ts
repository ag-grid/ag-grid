// Vitest never truncates a diff, and a grid object stringifies unbounded, so a suite failing wholesale
// prints for far longer than it runs. `./behave.sh --diff-lines N` (AG_DIFF_LINES) overrides; 0 = unbounded.
// `process` is absent in browser mode (BENCH_BROWSER), which loads this module just the same.
const env = typeof process === 'undefined' ? undefined : process.env;
const diffLines = Number(env?.AG_DIFF_LINES);

export default {
    // A snapshot mismatch carries its own diff options and never sets `showDiff`, so `--no-diff` cannot reach
    // it through chai; this threshold is the only thing that bounds it.
    truncateThreshold: env?.AG_NO_DIFF ? 1 : Number.isFinite(diffLines) ? diffLines : 80,
    // Context-only diffs: the changed lines plus a few around them, not every matching line.
    expand: false,
};
