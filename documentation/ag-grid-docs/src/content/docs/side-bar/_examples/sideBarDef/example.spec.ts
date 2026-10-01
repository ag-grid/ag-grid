import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('SideBarDef renders on the left with Filters open by default', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // position: 'left'
        await expect(page.locator('.ag-side-bar.ag-side-bar-left')).toBeVisible();

        // Both configured tool panel buttons are present.
        await expect(page.locator('.ag-side-button')).toHaveCount(2);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters' })).toBeVisible();

        // defaultToolPanel: 'filters'
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });

    test.eachFramework('Clicking Columns opens the Columns panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('.ag-side-button').filter({ hasText: 'Columns' }).click();

        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Columns');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();
    });

    test.eachFramework('Each tool panel opens at its configured width', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const openPanelWidth = () =>
            page
                .locator('.ag-tool-panel-wrapper:not(.ag-hidden)')
                .evaluate((el) => Math.round(el.getBoundingClientRect().width));

        // filters: minWidth 180, maxWidth 400, width 250 — open by default.
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
        await expect(async () => {
            expect(await openPanelWidth()).toBe(250);
        }).toPass();

        // columns: minWidth 225, maxWidth 225, width 225.
        await page.locator('.ag-side-button').filter({ hasText: 'Columns' }).click();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();
        await expect(async () => {
            expect(await openPanelWidth()).toBe(225);
        }).toPass();
    });
});
