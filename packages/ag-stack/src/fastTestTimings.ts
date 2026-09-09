/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 *
 * Collapses the grid's hard-coded UX delays, the ones no grid option reaches. Always `false` in every
 * build: the behavioural suite alone turns it on, by aliasing this module (testing/behavioural/vitest.config.ts).
 */
export const FAST_TEST_TIMINGS = false;
