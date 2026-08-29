import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

async function switchChartType(page: Page, buttonText: string): Promise<void> {
    await page.locator('.button-container button', { hasText: buttonText }).click();
}

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const gridApi = remoteGrid(page);

        // Reads the chart's combination type and its per-series chart types as a colId -> chartType map.
        const comboState = async (): Promise<{ chartType: string; seriesTypes: Record<string, string> }> => {
            const model = (await gridApi.getChartModels())![0] as any;
            const seriesTypes: Record<string, string> = {};
            for (let i = 0, types = model.seriesChartTypes, len = types.length; i < len; ++i) {
                seriesTypes[types[i].colId] = types[i].chartType;
            }
            return { chartType: model.chartType, seriesTypes };
        };

        // Grid renders the documented category + series columns.
        await expect(agIdFor.headerCell('period')).toContainText('Financial Period');
        await expect(agIdFor.headerCell('recurring')).toContainText('Recurring revenue');
        await expect(agIdFor.headerCell('individual')).toContainText('Individual sales');

        // A chart is rendered into the example container with both series in the legend.
        await expect(page.locator('#myChart .ag-charts-canvas canvas').first()).toBeVisible();
        const legend = page.locator('#myChart .ag-charts-proxy-legend-toolbar [role="listitem"]');
        await expect(legend).toHaveCount(2);

        // The chart is initially the Column & Line combination: recurring drawn as columns, individual
        // drawn as a line.
        const columnLineState = {
            chartType: 'columnLineCombo',
            seriesTypes: { recurring: 'groupedColumn', individual: 'line' },
        };
        await expect(async () => {
            expect(await comboState()).toEqual(columnLineState);
        }).toPass({ timeout: 5000 });

        // The Area Column Combo button recomposes the series: recurring becomes an area, individual a column.
        await switchChartType(page, 'Area Column Combo');
        await expect(async () => {
            expect(await comboState()).toEqual({
                chartType: 'areaColumnCombo',
                seriesTypes: { recurring: 'stackedArea', individual: 'groupedColumn' },
            });
        }).toPass({ timeout: 5000 });

        // The Column Line Combo button restores the column + line composition.
        await switchChartType(page, 'Column Line Combo');
        await expect(async () => {
            expect(await comboState()).toEqual(columnLineState);
        }).toPass({ timeout: 5000 });
    });
});
