import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('shows all rows with the default "Everyone" filter', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of olympic-winners.json is Michael Phelps, age 23.
        const firstRow = page.locator('.ag-row[row-index="0"]');
        await expect(firstRow.locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(firstRow.locator('[col-id="age"]')).toContainText('23');
    });

    test.eachFramework('external filter "Above 50" restricts rows to age > 50', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#above50').check();

        // Only 9 athletes in the dataset are older than 50.
        const rows = page.locator('.ag-row');
        await expect(rows).toHaveCount(9);

        // Every visible age cell must be greater than 50.
        const ages = await page.locator('.ag-row [col-id="age"]').allInnerTexts();
        expect(ages.length).toBe(9);
        for (const age of ages) {
            expect(Number.parseInt(age, 10)).toBeGreaterThan(50);
        }

        // Michael Phelps (age 23) is filtered out.
        await expect(page.getByText('Michael Phelps')).toHaveCount(0);
    });

    test.eachFramework('switching between filters updates and restores the row set', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Narrow to "Above 50": only 9 rows remain, all older than 50.
        await page.locator('#above50').check();
        await expect(page.locator('.ag-row')).toHaveCount(9);
        await expect(page.getByText('Michael Phelps')).toHaveCount(0);

        // Switch back to "Everyone": the full dataset returns, Michael Phelps at the top.
        await page.locator('#everyone').check();
        await waitForGridContent(page);
        const firstRow = page.locator('.ag-row[row-index="0"]');
        await expect(firstRow.locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(firstRow.locator('[col-id="age"]')).toContainText('23');
    });
});
