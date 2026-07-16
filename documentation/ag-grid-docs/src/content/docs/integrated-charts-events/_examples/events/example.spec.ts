import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'creating, editing and destroying a chart fires the lifecycle events',
        async ({ page, remoteGrid }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const logs: string[] = [];
            page.on('console', (msg) => {
                if (msg.type() === 'log') {
                    logs.push(msg.text());
                }
            });

            // Creating a chart from a cell range fires ChartCreated.
            await remoteGrid(page).createRangeChart({
                cellRange: { columns: ['Month', 'Sunshine (hours)'] },
                chartType: 'line',
            });

            await expect(() => {
                expect(logs.some((l) => l.includes('Created chart with ID'))).toBe(true);
            }).toPass();

            // The chart renders inside a popup dialog (no chartContainer was supplied).
            await page.locator('.ag-chart').first().waitFor({ state: 'visible' });

            // Open the chart settings/edit toolbar and switch the chart type -> ChartOptionsChanged.
            await page.locator('.ag-chart-menu-toolbar-button').first().click();
            await page.locator('.ag-menu-option-text', { hasText: 'Edit Chart' }).click();
            // The Settings tab (default) lists the chart-type mini thumbnails.
            const miniCharts = page.locator('.ag-chart-mini-thumbnail');
            await miniCharts.first().waitFor({ state: 'visible' });
            // Pick a different chart type than the current line chart.
            await miniCharts.nth(3).click();

            await expect(() => {
                expect(logs.some((l) => l.includes('Changed options of chart with ID'))).toBe(true);
            }).toPass();

            // Closing the chart dialog (its title-bar close button) fires ChartDestroyed.
            await page
                .locator('.ag-panel-title-bar-button')
                .filter({ has: page.locator('.ag-icon-cross') })
                .first()
                .click();

            await expect(() => {
                expect(logs.some((l) => l.includes('Destroyed chart with ID'))).toBe(true);
            }).toPass();
        }
    );
});
