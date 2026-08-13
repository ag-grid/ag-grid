/**
 * Error codes removed from `AG_GRID_ERRORS` whose docs pages must still be generated: the hop to
 * `/archive/<version>/` is client-side JS on the live page, so a 404 here cuts users on an older grid
 * version off from an archived page that renders fine.
 *
 * The value is the last released version that shipped the code, or `null` where that is unknown. It is
 * display-only — the archive redirect target comes from the `_version_` URL param, never from this map.
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
 * The highest error code ever allocated. `retiredErrorCodes.test.ts` asserts it equals the maximum of the
 * live and retired codes, so adding a code goes red until this is bumped and the range check keeps
 * covering everything.
 */
export const HIGHEST_ALLOCATED_CODE = 326;
