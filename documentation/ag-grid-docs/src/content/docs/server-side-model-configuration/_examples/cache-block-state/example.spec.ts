import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('cache blocks load on demand as the grid is scrolled', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // First block is fetched from the server on demand.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        // Scrolling down forces a later block to be fetched (its cache block enters the
        // loading state, showing a placeholder) which then resolves to real data.
        await page.locator('.ag-grid-viewport').evaluate((el) => {
            el.scrollTop = 6000;
        });

        await expect(page.locator('.ag-row-loading').first()).toBeVisible({ timeout: 3000 });
        await expect(page.locator('.ag-row-loading')).toHaveCount(0, { timeout: 10000 });

        const renderedIndex = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
            const deep = rows
                .map((r) => Number(r.getAttribute('row-index')))
                .filter((i) => Number.isFinite(i) && i >= 100)
                .sort((a, b) => a - b);
            return deep[0];
        });
        expect(renderedIndex).toBeGreaterThanOrEqual(100);
        await expect(dataRow(renderedIndex).locator('[col-id="id"]')).toContainText(String(renderedIndex));
        await expect(dataRow(renderedIndex).locator('[col-id="athlete"]')).not.toBeEmpty();
    });
});
