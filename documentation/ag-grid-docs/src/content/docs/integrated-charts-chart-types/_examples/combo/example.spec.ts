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

        // Grid renders the documented category + series columns.
        await expect(agIdFor.headerCell('period')).toContainText('Financial Period');
        await expect(agIdFor.headerCell('recurring')).toContainText('Recurring revenue');
        await expect(agIdFor.headerCell('individual')).toContainText('Individual sales');

        // A chart is rendered into the example container with both series in the legend.
        await expect(page.locator('#myChart .ag-charts-canvas canvas').first()).toBeVisible();
        const legend = page.locator('#myChart .ag-charts-proxy-legend-toolbar [role="listitem"]');
        await expect(legend).toHaveCount(2);

        // The chart is initially the built-in Column & Line combination.
        await openChartSettings(page);
        expect(await selectedChartType(page)).toContain('Column & Line');

        // Both toolbar buttons apply a combination chart type. Applying a named combo via the API
        // lands on the gallery's "Custom Combination" entry (there is no dedicated thumbnail per
        // named combo), so the selected type is asserted at that granularity — this still verifies
        // the update took effect and moved the chart off its initial built-in combination.
        await switchChartType(page, 'Column Line Combo');
        await expect(page.locator('.ag-chart-mini-thumbnail.ag-selected').first()).toHaveAttribute(
            'aria-label',
            /Custom Combination/
        );

        await switchChartType(page, 'Area Column Combo');
        await expect(page.locator('.ag-chart-mini-thumbnail.ag-selected').first()).toHaveAttribute(
            'aria-label',
            /Custom Combination/
        );
    });
});
