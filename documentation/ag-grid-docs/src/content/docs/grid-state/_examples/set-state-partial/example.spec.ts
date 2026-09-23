import type { AgGridFixtures } from '@utils/grid/test-utils';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

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
    test.eachFramework('Set Column Order Only resets every omitted property', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        const goldTotal = page.locator('.ag-row-footer [col-id="gold"]');
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'descending');
        await expect(agIdFor.headerCell('country')).toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(goldTotal).not.toBeEmpty();

        await page.getByRole('button', { name: 'Filter Sport: Swimming', exact: true }).click();
        const floatingFilter = agIdFor.floatingFilter('sport').locator('input');
        await expect(floatingFilter).toHaveValue('Swimming');

        await page.getByRole('button', { name: 'Set Column Order Only', exact: true }).click();

        await expectGoldBeforeAthlete(agIdFor);
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'none');
        await expect(agIdFor.headerCell('country')).not.toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(goldTotal).toBeEmpty();
        await expect(floatingFilter).toHaveValue('');
    });

    test.eachFramework(
        'Restore Saved State applies the saved state and clears the filter',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page, GRID_ID);
            await waitForGridContent(page);

            const goldTotal = page.locator('.ag-row-footer [col-id="gold"]');
            await expect(goldTotal).toHaveText('3143');

            await page.getByRole('button', { name: 'Filter Sport: Swimming', exact: true }).click();
            const floatingFilter = agIdFor.floatingFilter('sport').locator('input');
            await expect(floatingFilter).toHaveValue('Swimming');
            await expect(goldTotal).not.toHaveText('3143');

            await page.getByRole('button', { name: 'Restore Saved State', exact: true }).click();

            await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);
            await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
            await expect(agIdFor.headerCell('year')).toHaveCount(0);
            await expect(floatingFilter).toHaveValue('');
            await expect(goldTotal).toHaveText('3143');
        }
    );

    test.eachFramework('Restore Saved State, Ignore Filter leaves the filter in place', async ({ agIdFor, page }) => {
        await ensureGridReady(page, GRID_ID);
        await waitForGridContent(page);

        const goldTotal = page.locator('.ag-row-footer [col-id="gold"]');
        await page.getByRole('button', { name: 'Filter Sport: Swimming', exact: true }).click();
        const floatingFilter = agIdFor.floatingFilter('sport').locator('input');
        await expect(floatingFilter).toHaveValue('Swimming');
        await expect(goldTotal).not.toHaveText('3143');
        const swimmingTotal = await goldTotal.textContent();

        await page.getByRole('button', { name: 'Restore Saved State, Ignore Filter', exact: true }).click();

        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-last-left-pinned/);
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await expect(floatingFilter).toHaveValue('Swimming');
        await expect(goldTotal).toHaveText(swimmingTotal!);
    });
});
