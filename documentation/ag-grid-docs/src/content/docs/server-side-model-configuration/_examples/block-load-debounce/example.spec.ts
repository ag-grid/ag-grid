import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('blockLoadDebounceMillis delays block loads then resolves to data', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // The first block loads (despite the debounce) with real olympic data.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        // Scroll into a fresh, not-yet-loaded block. Because of blockLoadDebounceMillis:1000
        // the grid shows loading placeholders before the block request fires and resolves.
        await page.locator('.ag-grid-viewport').evaluate((el) => {
            el.scrollTop = el.scrollHeight;
        });

        // A loading placeholder appears during the debounce window...
        await expect(page.locator('.ag-row-loading').first()).toBeVisible({ timeout: 3000 });

        // ...and eventually resolves: the loading placeholders clear and the deep block
        // renders real data whose id column matches the row index.
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
