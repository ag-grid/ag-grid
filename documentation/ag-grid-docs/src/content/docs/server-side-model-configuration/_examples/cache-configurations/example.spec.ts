import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

// A row index comfortably past the first 50-row block, so reaching it proves a further block was
// fetched on demand while scrolling. Kept low enough to reach reliably within the test budget.
const DEEP_INDEX = 60;

test.agExample(import.meta, () => {
    test.eachFramework('cacheBlockSize blocks load on demand while scrolling', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // First 50-row block loads on demand with real olympic data.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="id"]')).toContainText('0');

        const deepestRenderedIndex = () =>
            page.evaluate(() => {
                const indices = Array.from(document.querySelectorAll('.ag-row'))
                    .map((r) => Number(r.getAttribute('row-index')))
                    .filter((idx) => Number.isFinite(idx));
                return indices.length ? Math.max(...indices) : -1;
            });

        // The last row is unknown up-front, so the grid can only fetch one block at a time and a
        // single scroll reaches the end of what is loaded, not DEEP_INDEX. Scroll again on every
        // attempt until the rows go deep enough, so a scroll that lands mid-load just costs a retry.
        await expect(async () => {
            await page.locator('.ag-grid-viewport').evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });
            expect(await deepestRenderedIndex()).toBeGreaterThanOrEqual(DEEP_INDEX);
        }).toPass();

        const renderedIndex = await page.evaluate((min) => {
            const deep = Array.from(document.querySelectorAll('.ag-row'))
                .map((r) => Number(r.getAttribute('row-index')))
                .filter((idx) => Number.isFinite(idx) && idx >= min)
                .sort((a, b) => a - b);
            return deep[0];
        }, DEEP_INDEX);
        // A block beyond the first was fetched on demand: the deep row carries its real id and data.
        await expect(dataRow(renderedIndex).locator('[col-id="id"]')).toContainText(String(renderedIndex));
        await expect(dataRow(renderedIndex).locator('[col-id="athlete"]')).not.toBeEmpty();
    });
});
