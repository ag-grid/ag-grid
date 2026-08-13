/**
 * Error codes that once existed in `AG_GRID_ERRORS` and have since been removed.
 *
 * Their pages must keep being generated. The hop to `/archive/<version>/` is client-side JS running on
 * the live page (see `src/pages/[framework]-data-grid/errors/[code].astro`), so a 404 here cuts users on
 * an older grid version off from an archived page that renders perfectly well.
 *
 * The value is the last released version that shipped the code, or `null` where that is not known. It is
 * display-only prose: the archive redirect derives its target from the `_version_` URL param that the
 * grid appends to the error link, never from this map.
 *
 * Codes are allocated monotonically, so `retiredErrorCodes.test.ts` asserts that the live codes plus
 * these cover `1..HIGHEST_ALLOCATED_CODE` with no gaps — a future removal that is not registered here
 * fails that test instead of silently 404ing in production.
 */
export const RETIRED_ERROR_CODES: Record<number, string | null> = {
    73: null,
    100: '33.3.2',
    112: null,
    115: '33.0.4',
    131: '33.0.4',
    191: '33.0.4',
    192: '33.0.4',
    193: '33.0.4',
    198: '33.0.4',
    229: '34.3.1',
    232: '36.0.2',
    241: '33.0.4',
    242: '33.0.4',
    272: '35.3.1',
    275: '35.3.1',
    299: null,
    300: null,
};

/**
 * The highest error code ever allocated. Kept honest by `retiredErrorCodes.test.ts`, which asserts it
 * equals the maximum of the live and retired codes — so adding a new error code goes red until this is
 * bumped, which is what keeps the contiguity check covering the whole range.
 */
export const HIGHEST_ALLOCATED_CODE = 326;
