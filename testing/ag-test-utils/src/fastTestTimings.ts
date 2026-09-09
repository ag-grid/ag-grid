/**
 * Replaces `packages/ag-stack/src/fastTestTimings.ts` in this suite only (aliased in
 * `testing/behavioural/vitest.config.ts`), turning the grid's hard-coded UX delays instant. A suite that
 * needs the real timing of something asserts it through the grid option that controls it - the flag only
 * removes the floors and intervals a test has no way to reach.
 */
export const FAST_TEST_TIMINGS = true;
