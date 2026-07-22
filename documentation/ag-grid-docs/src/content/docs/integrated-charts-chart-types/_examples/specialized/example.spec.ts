import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Opens the chart's settings tool panel so the selected chart-type thumbnail is visible.
async function openChartSettings(page: Page): Promise<void> {
    await page.locator('.ag-chart-menu-toolbar-button').first().click();
    await page.locator('.ag-chart-mini-thumbnail.ag-selected').first().waitFor();
}

async function selectedChartType(page: Page): Promise<string | null> {
    return page.locator('.ag-chart-mini-thumbnail.ag-selected').first().getAttribute('aria-label');
}

async function switchChartType(page: Page, buttonText: string): Promise<void> {
    await page.locator('.button-container button', { hasText: buttonText }).click();
}

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grid starts on the heatmap dataset (year + monthly columns).
        await expect(agIdFor.headerCell('year')).toContainText('Year');
        await expect(agIdFor.headerCell('jan')).toContainText('Jan');
        await expect(agIdFor.headerCell('dec')).toContainText('Dec');

        // A chart is rendered into the example container, initially a Heatmap.
        await expect(page.locator('#myChart .ag-charts-canvas canvas').first()).toBeVisible();
        await openChartSettings(page);
        expect(await selectedChartType(page)).toContain('Heatmap');

        // The Waterfall button swaps in the waterfall dataset (financials + amount columns) and
        // switches the chart to a Waterfall series.
        await switchChartType(page, 'Waterfall');
        await expect(agIdFor.headerCell('financials')).toContainText('Financials');
        await expect(agIdFor.headerCell('amount')).toContainText('Amount');
        await expect(page.locator('.ag-chart-mini-thumbnail.ag-selected').first()).toHaveAttribute(
            'aria-label',
            /Waterfall/
        );

        // The Heatmap button restores the heatmap dataset and chart type.
        await switchChartType(page, 'Heatmap');
        await expect(agIdFor.headerCell('year')).toContainText('Year');
        await expect(page.locator('.ag-chart-mini-thumbnail.ag-selected').first()).toHaveAttribute(
            'aria-label',
            /Heatmap/
        );
    });
});
