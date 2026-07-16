import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The example demonstrates the Column / Bar family of integrated charts: a range chart is created
// over the period + recurring + individual columns, and buttons switch it between the six
// documented column/bar variants.
test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Grid renders the documented category + series columns and first row of data.
        await expect(agIdFor.cell('0', 'period')).toContainText('Q1 2021');
        await expect(agIdFor.cell('0', 'recurring')).toContainText('485829');
        await expect(agIdFor.cell('0', 'individual')).toContainText('237438');

        // The chart canvas renders inside the example's #myChart container.
        await expect(page.locator('#myChart canvas').first()).toBeVisible();

        // The two series are reflected in the chart legend.
        const legend = page.locator('#myChart .ag-charts-proxy-legend-toolbar [role="switch"]');
        await expect(legend).toHaveCount(2);
        await expect(legend.nth(0)).toContainText('Recurring revenue');
        await expect(legend.nth(1)).toContainText('Individual sales');

        // The chart starts as a grouped column (createRangeChart chartType).
        const initialModels = await gridApi.getChartModels();
        expect(initialModels).toHaveLength(1);
        expect(initialModels![0].chartType).toBe('groupedColumn');

        // Each button switches the chart to its documented column/bar type.
        const expectedTypes = [
            'groupedColumn',
            'stackedColumn',
            'normalizedColumn',
            'groupedBar',
            'stackedBar',
            'normalizedBar',
        ];
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
