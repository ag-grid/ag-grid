import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Data renders with the nested Athlete Details group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' })).toHaveCount(1);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Toggling hidePaddedHeaderRows removes padding-only header rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const headerRows = page.locator('.ag-header-row');
        const before = await headerRows.count();

        await page.locator('#hidePaddedHeaderRows').check();

        const after = await headerRows.count();
        expect(after).toBeLessThan(before);
    });
});
