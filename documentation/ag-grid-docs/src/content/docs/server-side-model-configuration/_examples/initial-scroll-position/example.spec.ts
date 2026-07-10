import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('grid opens scrolled to the initial row via ensureIndexVisible', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 300 });
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // serverSideInitialRowCount:5500 sizes the scrollable area up-front and
        // ensureIndexVisible(5000, 'top') scrolls the viewport to row 5000 on load, so row 0
        // is far above the viewport and not rendered.
        await expect(dataRow(0)).toHaveCount(0);

        // The block around row 5000 is fetched and rendered near the top of the viewport.
        await expect(dataRow(5000).locator('[col-id="athlete"]')).not.toBeEmpty({ timeout: 10000 });

        // The viewport has actually scrolled a long way down.
        const scrollTop = await page.locator('.ag-grid-viewport').evaluate((el) => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(100000);
    });
});
