import { AG_GRID_ERRORS } from '../../../../packages/ag-grid-community/src/validation/errorMessages/errorText';
import { HIGHEST_ALLOCATED_CODE, RETIRED_ERROR_CODES } from './retiredErrorCodes';

// Deleting an error code from `errorText.ts` also deletes its docs route, because the error page builds
// `getStaticPaths()` from `AG_GRID_ERRORS`. That is a live 404 for anyone whose grid logged the link, and
// it takes the client-side hop to `/archive/<version>/` down with it, so even the intact archived page
// becomes unreachable. Error codes are allocated monotonically, so a removal leaves a hole in the range —
// these assertions turn that hole into a red test unless the code is registered as retired.
const liveCodes = Object.keys(AG_GRID_ERRORS).map(Number);
const retiredCodes = Object.keys(RETIRED_ERROR_CODES).map(Number);
const allCodes = new Set([...liveCodes, ...retiredCodes]);

describe('retired error codes', () => {
    it('registers no code that is still live', () => {
        const reAdded = retiredCodes.filter((code) => code in AG_GRID_ERRORS);

        expect(
            reAdded,
            `Error code(s) ${reAdded.join(', ')} are in AG_GRID_ERRORS and in RETIRED_ERROR_CODES. ` +
                `A code that is live again must be removed from RETIRED_ERROR_CODES.`
        ).toEqual([]);
    });

    it('accounts for every code in the allocated range, so no removed code 404s', () => {
        const unaccounted: number[] = [];
        for (let code = 1; code <= HIGHEST_ALLOCATED_CODE; code++) {
            if (!allCodes.has(code)) {
                unaccounted.push(code);
            }
        }

        expect(
            unaccounted,
            `Error code(s) ${unaccounted.join(', ')} are in neither AG_GRID_ERRORS nor RETIRED_ERROR_CODES, ` +
                `so their docs pages are no longer generated and now return 404. Add each to ` +
                `RETIRED_ERROR_CODES in src/utils/retiredErrorCodes.ts with the last version that shipped it.`
        ).toEqual([]);
    });

    it('keeps HIGHEST_ALLOCATED_CODE equal to the highest code, so the range check covers everything', () => {
        // Equality, not `>=`: with `>=` a newly added code above the constant would sit outside the
        // contiguity check above, and a later removal of it would pass silently — the exact bug this
        // suite exists to prevent, one code up. Equality forces the constant to be bumped.
        expect(
            Math.max(...allCodes),
            `HIGHEST_ALLOCATED_CODE (${HIGHEST_ALLOCATED_CODE}) does not match the highest known error code. ` +
                `If a new error code was added, bump HIGHEST_ALLOCATED_CODE in src/utils/retiredErrorCodes.ts.`
        ).toBe(HIGHEST_ALLOCATED_CODE);
    });
});
