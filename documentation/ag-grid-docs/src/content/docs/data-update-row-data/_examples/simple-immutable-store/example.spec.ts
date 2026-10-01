import {
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const rows = (page: any) => page.locator('.ag-grid-scrolling-container .ag-row[row-id]');

    test.eachFramework('Appending and prepending grows the row set', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The store is seeded with 5 items on grid ready
        await expect(rows(page)).toHaveCount(5);

        await page.getByRole('button', { name: 'Append', exact: true }).click();
        await expect(rows(page)).toHaveCount(10);

        await page.getByRole('button', { name: 'Prepend', exact: true }).click();
        await expect(rows(page)).toHaveCount(15);
    });

    test.eachFramework('Reverse keeps the same rows and moves rather than recreates', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // `getRowId` is the symbol, so the row-id at index 0 is the top row's symbol.
        const topRow = page.locator('.ag-grid-scrolling-container .ag-row[row-index="0"]');
        const before = (await topRow.first().getAttribute('row-id'))!;
        expect(before).toBeTruthy();

        await page.getByRole('button', { name: 'Reverse', exact: true }).click();

        // Reversing re-sets the same five rows in place, so the row count is already correct before the
        // reorder renders - wait on the row that actually moves instead, retried until the move settles.
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, before, { not: true });

        // Same rows, now that they have been reordered
        await expect(rows(page)).toHaveCount(5);
    });

    test.eachFramework('Grouping can be toggled on and off', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Starts flat: no group rows
        await expect(page.locator('.ag-row-group').first()).not.toBeVisible();

        await page.getByRole('button', { name: 'Grouping On', exact: true }).click();
        await expect(page.locator('.ag-row-group').first()).toBeVisible();

        await page.getByRole('button', { name: 'Grouping Off', exact: true }).click();
        await expect(page.locator('.ag-row-group').first()).not.toBeVisible();
    });
});
