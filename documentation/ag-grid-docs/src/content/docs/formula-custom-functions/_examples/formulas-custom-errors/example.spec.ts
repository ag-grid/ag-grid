import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // ERRORIFONE throws when it finds a '1' in the referenced range; row 9 checks columns A/B/C over rows 1-8.
    test.eachFramework('A thrown error renders #ERROR!, otherwise the success message', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Column A (col '0') values 1..8 contain a 1 -> function throws -> #ERROR!
        await expect(agIdFor.cell('9', '0').first()).toContainText('#ERROR!');

        // Column B (col '1') values contain no 1 -> success message
        await expect(agIdFor.cell('9', '1').first()).toContainText("SUCCESS, no '1' found.");

        // Column C (col '2') values contain no 1 -> success message
        await expect(agIdFor.cell('9', '2').first()).toContainText("SUCCESS, no '1' found.");
    });

    // An error propagates through dependent formulas: D concatenates A (which errored).
    test.eachFramework('Errors propagate to dependent formula cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('9', '3').first()).toContainText('#ERROR!');
    });
});
