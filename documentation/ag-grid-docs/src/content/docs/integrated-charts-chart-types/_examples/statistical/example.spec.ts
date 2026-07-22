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
        await expect(agIdFor.headerCell('client')).toContainText('Client name');
        await expect(agIdFor.headerCell('recurring')).toContainText('Recurring revenue');
        await expect(agIdFor.headerCell('individual')).toContainText('Individual sales');

        // A chart is rendered into the example container.
        await expect(page.locator('#myChart .ag-charts-canvas canvas').first()).toBeVisible();

        // The chart is initially a Box Plot.
        await openChartSettings(page);
        expect(await selectedChartType(page)).toContain('Box Plot');

        // Each toolbar button switches the statistical chart to the documented series type.
        const cases: [string, string][] = [
            ['Histogram', 'Histogram'],
            ['Range Bar', 'Range Bar'],
            ['Range Area', 'Range Area'],
            ['Box Plot', 'Box Plot'],
        ];
        for (let i = 0, len = cases.length; i < len; ++i) {
            const [button, expected] = cases[i];
            await switchChartType(page, button);
            await expect(page.locator('.ag-chart-mini-thumbnail.ag-selected').first()).toHaveAttribute(
                'aria-label',
                new RegExp(expected)
            );
        }
    });
});
