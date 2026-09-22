import type { AgGridFixtures } from '@utils/grid/test-utils';
import { clickHeaderToSort, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const GRID_ID = 'setStatePartial';

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

test.agExample(import.meta, () => {
    test.eachFramework('Set Column Order Only resets every omitted section', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // Column definition defaults: Gold sorted desc, Country pinned, sum aggregation in the grand total row.
        const goldTotal = page.locator('.ag-row-footer [col-id="gold"]');
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'descending');
        await expect(agIdFor.headerCell('country')).toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(goldTotal).not.toBeEmpty();

        await page.getByRole('button', { name: 'Set Column Order Only', exact: true }).click();

        await expectGoldBeforeAthlete(agIdFor);
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'none');
        await expect(agIdFor.headerCell('country')).not.toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(goldTotal).toBeEmpty();
    });

    test.eachFramework('Restore State, Keep Filter leaves the current filter in place', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        // The grand total row shows whether a filter is applied.
        const goldTotal = page.locator('.ag-row-footer [col-id="gold"]');
        await expect(goldTotal).toHaveText('3143');

        await page.getByRole('button', { name: 'Save State', exact: true }).click();

        // Change the sort and the filter after saving.
        await clickHeaderToSort(agIdFor.headerCell('athlete'));
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        const floatingFilter = agIdFor.floatingFilter('sport').locator('input');
        await floatingFilter.fill('Swimming');
        await expect(goldTotal).not.toHaveText('3143');
        const swimmingTotal = await goldTotal.textContent();

        // Restore keeping the filter: the sort reverts, the filter stays.
        await page.getByRole('button', { name: 'Restore State, Keep Filter', exact: true }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'descending');
        await expect(floatingFilter).toHaveValue('Swimming');
        await expect(goldTotal).toHaveText(swimmingTotal!);

        // A plain restore clears the filter too.
        await page.getByRole('button', { name: 'Restore State', exact: true }).click();
        await expect(floatingFilter).toHaveValue('');
        await expect(goldTotal).toHaveText('3143');
    });
});
