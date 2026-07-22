import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The example demonstrates Funnel integrated charts: a range chart is created over the group +
// count columns, and the three buttons switch between the funnel, cone funnel and pyramid chart
// types. These series render purely to the chart canvas (no legend), so the chart type is asserted
// via the grid's chart model.
test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Grid renders the documented category + series columns and first row of data.
        await expect(agIdFor.cell('0', 'group')).toContainText('Page Visit');
        await expect(agIdFor.cell('0', 'count')).toContainText('490');

        // The chart canvas renders inside the example's #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();

        // The chart starts as a funnel (createRangeChart chartType).
        const initialModels = await gridApi.getChartModels();
        expect(initialModels).toHaveLength(1);
        expect(initialModels![0].chartType).toBe('funnel');

        // Each button switches the chart to its documented funnel-family type.
        const expectedTypes = ['funnel', 'coneFunnel', 'pyramid'];
        const buttons = page.locator('.button-container button');
        await expect(buttons).toHaveCount(expectedTypes.length);
        for (let i = 0, len = expectedTypes.length; i < len; ++i) {
            await buttons.nth(i).click();
            // Poll the chart model until the switch has been applied rather than waiting a fixed delay.
            await expect(async () => {
                const models = await gridApi.getChartModels();
                expect(models![0].chartType).toBe(expectedTypes[i]);
            }).toPass({ timeout: 5000 });
        }
    });
});
