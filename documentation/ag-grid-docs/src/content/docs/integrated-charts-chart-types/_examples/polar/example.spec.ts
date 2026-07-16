import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Opens the chart's settings tool panel (the default panel for these examples) so the
// selected chart-type thumbnail is visible, then returns its aria-label. The label is
// suffixed with ". Selected" and reflects the chart's current type live.
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
        await expect(agIdFor.headerCell('division')).toContainText('Division');
        await expect(agIdFor.headerCell('recurring')).toContainText('Recurring revenue');
        await expect(agIdFor.headerCell('individual')).toContainText('Individual sales');

        // A chart is rendered into the example container with both series in the legend.
        await expect(page.locator('#myChart .ag-charts-canvas canvas').first()).toBeVisible();
        const legend = page.locator('#myChart .ag-charts-proxy-legend-toolbar [role="listitem"]');
        await expect(legend).toHaveCount(2);

        // The chart is initially a Radar Line chart.
        await openChartSettings(page);
        expect(await selectedChartType(page)).toContain('Radar Line');

        // Each toolbar button switches the polar chart to the documented series type.
        const cases: [string, string][] = [
            ['Radar Area', 'Radar Area'],
            ['Nightingale', 'Nightingale'],
            ['Radial Column', 'Radial Column'],
            ['Radial Bar', 'Radial Bar'],
            ['Radar Line', 'Radar Line'],
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
