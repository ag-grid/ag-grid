import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tooltip shows immediately with a zero show delay', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // tooltipShowDelay is 0, so the tooltip appears as soon as the cell is hovered.
        // Assert visibility within a short timeout that would fail if the delay regressed
        // to the default (2000ms) — the default retry timeout would mask such a regression.
        await agIdFor.cell('0', 'age').hover();
        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible({ timeout: 400 });
        await expect(tooltip).toContainText('This is the Athlete');
    });

    test.eachFramework('Tooltip hides once the hide delay elapses', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip');
        await agIdFor.cell('0', 'age').hover();
        await expect(tooltip).toBeVisible({ timeout: 400 });

        // tooltipHideDelay is 2000ms. Wait past the point a short delay would have closed
        // the tooltip and assert it is still up, then assert it closes once 2000ms elapses.
        await page.waitForTimeout(1200);
        await expect(tooltip).toBeVisible();

        await expect(tooltip).toHaveCount(0, { timeout: 4000 });
    });

    test.eachFramework('Switching cells applies the longer switch show delay', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const sportTooltip = page.locator('.ag-tooltip', { hasText: 'Tooltip text about Sport' });

        await agIdFor.cell('0', 'age').hover();
        await expect(page.locator('.ag-tooltip')).toBeVisible({ timeout: 400 });

        // tooltipSwitchShowDelay is 1000ms, so moving to another tooltip-enabled cell does
        // not show that cell's tooltip as fast as the 0ms initial show delay would.
        await agIdFor.cell('0', 'sport').hover();
        await page.waitForTimeout(400);
        await expect(sportTooltip).toHaveCount(0);

        await expect(sportTooltip).toBeVisible({ timeout: 3000 });
    });
});
