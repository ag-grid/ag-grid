import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const firstHeader = (page: any) => page.locator('.ag-header-cell').first();

    test.eachFramework('Existing column order is maintained when swapping sets', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Set A order starts with athlete.
        await expect(firstHeader(page)).toContainText('A Athlete');

        // Set B lists gold first, but maintainColumnOrder keeps athlete leftmost;
        // only the header names change to the 'B' variants.
        await page.getByRole('button', { name: 'Column Set B' }).click();
        await expect(firstHeader(page)).toContainText('B Athlete');
        await expect(agIdFor.headerCell('gold')).toContainText('B Gold');
    });

    test.eachFramework('Clearing removes columns, re-applying a set restores them', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Clear removes all columns.
        await page.getByRole('button', { name: 'Clear' }).click();
        await expect(page.locator('.ag-header-cell')).toHaveCount(0);

        // Applying a set restores the columns with that set's header names.
        await page.getByRole('button', { name: 'Column Set B' }).click();
        await expect(agIdFor.headerCell('gold')).toContainText('B Gold');
        await expect(agIdFor.headerCell('athlete')).toContainText('B Athlete');
    });
});
