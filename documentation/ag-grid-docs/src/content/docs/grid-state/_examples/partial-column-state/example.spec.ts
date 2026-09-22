import type { Page } from '@playwright/test';
import type { AgGridFixtures } from '@utils/grid/test-utils';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The example sets an explicit `gridId`, so the same selector resolves the grid before and after
// it is recreated.
const GRID_ID = 'partialColumnState';

// Column moves animate, so poll until the reorder has landed.
const expectGoldBeforeAthlete = async (agIdFor: AgGridFixtures['agIdFor']) => {
    await expect
        .poll(async () => {
            const gold = await agIdFor.headerCell('gold').boundingBox();
            const athlete = await agIdFor.headerCell('athlete').boundingBox();
            return gold && athlete ? gold.x < athlete.x : false;
        })
        .toBe(true);
};

// Every column definition default this example relies on: Country pinned, Year hidden and the
// `sum` aggregation that fills the grand total row.
const expectColDefDefaults = async (agIdFor: AgGridFixtures['agIdFor'], page: Page, kept: boolean) => {
    const goldTotal = page.locator('.ag-row-footer [col-id="gold"]');
    if (kept) {
        await expect(agIdFor.headerCell('country')).toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(agIdFor.headerCell('year')).toHaveCount(0);
        await expect(goldTotal).not.toBeEmpty();
    } else {
        await expect(agIdFor.headerCell('country')).not.toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(agIdFor.headerCell('year')).toBeVisible();
        await expect(goldTotal).toBeEmpty();
    }
};

test.agExample(import.meta, () => {
    test.eachFramework('column order only initialState resets the other column defaults', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);
        await expectColDefDefaults(agIdFor, page, true);

        await page.getByRole('button', { name: 'Recreate: Column Order Only', exact: true }).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await expectGoldBeforeAthlete(agIdFor);
        await expectColDefDefaults(agIdFor, page, false);
    });

    test.eachFramework('partialColumnState keeps the column defaults the state omits', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await page
            .getByRole('button', { name: 'Recreate: Column Order Only + partialColumnState', exact: true })
            .click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        await expectGoldBeforeAthlete(agIdFor);
        await expectColDefDefaults(agIdFor, page, true);

        await page.getByRole('button', { name: 'Recreate: No State', exact: true }).click();
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);
        await expectColDefDefaults(agIdFor, page, true);
    });
});
