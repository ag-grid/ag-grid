import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The example demonstrates Hierarchical integrated charts (Treemap / Sunburst): a range chart is
// created over the division + resource categories and revenue + expenses series, and the two
// buttons switch between the treemap and sunburst chart types. These series render purely to the
// chart canvas (no legend), so the chart type is asserted via the grid's chart model.
test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Grid renders the documented category + series columns and first row of data.
        await expect(agIdFor.cell('0', 'division')).toContainText('Sales');
        await expect(agIdFor.cell('0', 'resource')).toContainText('Online sales');
        await expect(agIdFor.cell('0', 'revenue')).toContainText('1587123');
        await expect(agIdFor.cell('0', 'expenses')).toContainText('151497');

        // The chart canvas renders inside the example's #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();

        // The chart starts as a treemap (createRangeChart chartType).
        const initialModels = await gridApi.getChartModels();
        expect(initialModels).toHaveLength(1);
        expect(initialModels![0].chartType).toBe('treemap');

        // Each button switches the chart to its documented hierarchical type.
        const expectedTypes = ['treemap', 'sunburst'];
        const buttons = page.locator('.button-container button');
        await expect(buttons).toHaveCount(expectedTypes.length);
        for (let i = 0, len = expectedTypes.length; i < len; ++i) {
            await buttons.nth(i).click();
            await page.waitForTimeout(300);
            const models = await gridApi.getChartModels();
            expect(models![0].chartType).toBe(expectedTypes[i]);
        }
    });
});
