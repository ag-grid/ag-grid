import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Side bar is hidden by default and toggled via setSideBarVisible', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sideBar.hiddenByDefault = true => side bar not shown initially.
        await expect(page.locator('.ag-side-bar')).toBeHidden();

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        // Now visible, showing both configured tool panel buttons.
        await expect(page.locator('.ag-side-bar')).toBeVisible();
        await expect(page.locator('.ag-side-button')).toHaveCount(2);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters' })).toBeVisible();

        await page.getByRole('button', { name: 'setSideBarVisible(false)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeHidden();
    });

    test.eachFramework('openToolPanel and closeToolPanel switch and close panels', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        await page.getByRole('button', { name: "openToolPanel('columns')" }).click();
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Columns');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-column-panel')).toBeVisible();

        await page.getByRole('button', { name: "openToolPanel('filters')" }).click();
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();

        // closeToolPanel closes the open panel, leaving no button selected (buttons remain).
        await page.getByRole('button', { name: 'closeToolPanel()' }).click();
        await expect(page.locator('.ag-side-button.ag-selected')).toHaveCount(0);
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)')).toHaveCount(0);
    });

    test.eachFramework('setSideBarPosition moves the side bar left and right', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-bar')).toBeVisible();

        await page.getByRole('button', { name: "setSideBarPosition('left')" }).click();
        await expect(page.locator('.ag-side-bar')).toHaveClass(/ag-side-bar-left/);

        await page.getByRole('button', { name: "setSideBarPosition('right')" }).click();
        await expect(page.locator('.ag-side-bar')).toHaveClass(/ag-side-bar-right/);
    });

    test.eachFramework('setSideBar resets the configured tool panels', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'setSideBarVisible(true)' }).click();
        await expect(page.locator('.ag-side-button')).toHaveCount(2);

        // Reset to a single 'columns' panel.
        await page.getByRole('button', { name: "setSideBar('columns')" }).click();
        await expect(page.locator('.ag-side-button')).toHaveCount(1);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();

        // Reset to ['filters', 'columns'] => two panels, Filters first.
        await page.getByRole('button', { name: "setSideBar(['filters','columns'])" }).click();
        await expect(page.locator('.ag-side-button')).toHaveCount(2);
        await expect(page.locator('.ag-side-button').first()).toContainText('Filters');
    });
});
