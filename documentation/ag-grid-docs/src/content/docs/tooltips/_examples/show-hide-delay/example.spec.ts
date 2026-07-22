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
});
