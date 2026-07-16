import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('clicking chart series and legend fires standalone chart events', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered auto-creates a grouped-column chart into the #myChart container.
        const canvas = page.locator('#myChart canvas').first();
        await expect(canvas).toBeVisible();

        const logs: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        const seen = (needle: string) => logs.some((l) => l.includes(needle));
        const waitForLog = async (needle: string) => {
            await expect(async () => {
                expect(seen(needle)).toBe(true);
            }).toPass({ timeout: 5000 });
        };

        // seriesNodeClick: the chart's accessible series-area (the focusable swapchain element)
        // provides a deterministic keyboard path to a series node. Focus it, move to the first
        // datum with ArrowRight, then submit with Enter — this fires the standalone
        // seriesNodeClick listener registered via chartThemeOverrides.
        await page.locator('#myChart .ag-charts-swapchain[tabindex="0"]').focus();
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Enter');
        await waitForLog('seriesNodeClick');

        // legendItemClick: the legend renders accessible proxy switch buttons, one per series.
        // Clicking the first is a deterministic hit that fires the standalone legendItemClick
        // listener registered via chartThemeOverrides.legend.
        const legendSwitches = page.locator('#myChart [role="switch"]');
        await expect(legendSwitches).toHaveCount(2);
        await legendSwitches.first().click();
        await waitForLog('legendItemClick');
    });
});
