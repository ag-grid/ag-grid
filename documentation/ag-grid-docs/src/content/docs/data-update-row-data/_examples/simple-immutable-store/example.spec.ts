import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

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

        const topSymbol = () =>
            page.locator('.ag-grid-scrolling-container .ag-row[row-index="0"] [col-id="symbol"]').innerText();
        const before = await topSymbol();

        await page.getByRole('button', { name: 'Reverse', exact: true }).click();

        // Same rows, but reordered so the top row is now a different symbol
        await expect(rows(page)).toHaveCount(5);
        const after = await topSymbol();
        expect(after).not.toBe(before);
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
