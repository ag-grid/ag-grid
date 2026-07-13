import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

// A row index past the first 100-row block, so reaching it proves a further block was fetched on
// demand while scrolling. Kept just past the boundary to reach reliably within the test budget.
const DEEP_INDEX = 120;

test.agExample(import.meta, () => {
    test.eachFramework('server-side datasource loads the first block and more on scroll', async ({ page }) => {
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // The first block is fetched on demand from the datasource with real olympic data.
        await expect(dataRow(0).locator('[col-id="athlete"]')).toContainText('Michael Phelps');
        await expect(dataRow(0).locator('[col-id="country"]')).toContainText('United States');
        await expect(dataRow(0).locator('[col-id="gold"]')).toContainText('8');
        await expect(dataRow(3).locator('[col-id="athlete"]')).toContainText('Natalie Coughlin');

        const deepestRenderedIndex = () =>
            page.evaluate(() => {
                const indices = Array.from(document.querySelectorAll('.ag-row'))
                    .map((r) => Number(r.getAttribute('row-index')))
                    .filter((idx) => Number.isFinite(idx));
                return indices.length ? Math.max(...indices) : -1;
            });

        // The last row is not known up-front, so scroll to the bottom repeatedly, each time waiting
        // until the deepest rendered row index actually advances (real data progress) before scrolling
        // again — tolerating the occasional scroll that lands mid-load without failing.
        for (let i = 0; i < 10 && (await deepestRenderedIndex()) < DEEP_INDEX; i++) {
            const before = await deepestRenderedIndex();
            await page.locator('.ag-grid-viewport').evaluate((el) => {
                el.scrollTop = el.scrollHeight;
            });
            await page
                .waitForFunction(
                    (prev) => {
                        const indices = Array.from(document.querySelectorAll('.ag-row'))
                            .map((r) => Number(r.getAttribute('row-index')))
                            .filter((idx) => Number.isFinite(idx));
                        return indices.length > 0 && Math.max(...indices) > prev;
                    },
                    before,
                    { timeout: 5000 }
                )
                .catch(() => {});
        }

        const renderedIndex = await page.evaluate((min) => {
            const deep = Array.from(document.querySelectorAll('.ag-row'))
                .map((r) => Number(r.getAttribute('row-index')))
                .filter((idx) => Number.isFinite(idx) && idx >= min)
                .sort((a, b) => a - b);
            return deep[0];
        }, DEEP_INDEX);
        expect(renderedIndex).toBeGreaterThanOrEqual(DEEP_INDEX);
        // A further block was fetched on demand: the deep row renders real data.
        await expect(dataRow(renderedIndex).locator('[col-id="athlete"]')).not.toBeEmpty();
        await expect(dataRow(renderedIndex).locator('[col-id="country"]')).not.toBeEmpty();
    });
});
