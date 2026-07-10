import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('cacheBlockSize blocks load on demand while scrolling', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // First 50-row block loads on demand with real olympic data.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        // The last row is unknown up-front, so the grid can only scroll one block at a time.
        // Repeatedly scroll to the bottom to force successive blocks to be fetched on demand.
        const deepestRenderedIndex = async () =>
            page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('.ag-row')) as HTMLElement[];
                const indices = rows.map((r) => Number(r.getAttribute('row-index'))).filter((i) => Number.isFinite(i));
                return indices.length ? Math.max(...indices) : -1;
            });

        for (let i = 0; i < 6; i++) {
            await page.locator('.ag-grid-viewport').evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });
            await expect(page.locator('.ag-row-loading')).toHaveCount(0, { timeout: 10000 });
            if ((await deepestRenderedIndex()) >= 100) {
                break;
            }
        }

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
