import { FAST_TEST_TIMINGS } from 'ag-stack';

// The counterpart to `packages/ag-stack/src/fastTestTimings.test.ts`, which pins the shipped `false`.
// Read through `ag-stack`, not the local module: it is the alias that has to hold, and a build which
// misses it (bundling ag-stack separately, say) silently restores every delay with nothing failing.
test('this suite runs the grid with its hard-coded delays collapsed', () => {
    expect(FAST_TEST_TIMINGS).toBe(true);
});
