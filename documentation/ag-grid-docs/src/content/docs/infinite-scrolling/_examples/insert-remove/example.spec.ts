import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads generated car data and applies the Honda row style', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // Row 0 has id 1 => make 'Ford', price formatted as '£72,000'.
        await expect(dataRow(0).locator('[col-id="make"]')).toContainText('Ford');
        await expect(dataRow(0).locator('[col-id="price"]')).toContainText('£72,000');

        // Row 3 has id 4 => make 'Honda', which getRowStyle renders bold.
        await expect(dataRow(3).locator('[col-id="make"]')).toContainText('Honda');
        await expect(dataRow(3)).toHaveCSS('font-weight', '700');
    });

    test.eachFramework('Delete Rows removes rows from the server and refreshes the cache', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        await expect(dataRow(3).locator('[col-id="make"]')).toContainText('Honda');

        // Delete Rows splices 10 rows at index 3, so id 14 (make 'Porsche') moves up to row 3.
        await page.getByText('Delete Rows', { exact: true }).click();
        await expect(dataRow(3).locator('[col-id="make"]')).toContainText('Porsche');
    });

    test.eachFramework('Jump to 500 scrolls to and loads row 500', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 400 });
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByText('Jump to 500', { exact: true }).click();

        // Row 500 has id 501 => make 'Chevy' (501 % 6 === 3).
        await expect(page.locator('.ag-row[row-index="500"]').locator('[col-id="make"]')).toContainText('Chevy', {
            timeout: 10000,
        });
    });
});
