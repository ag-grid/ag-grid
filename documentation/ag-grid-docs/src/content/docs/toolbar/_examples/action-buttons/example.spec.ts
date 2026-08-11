import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Icon-only action buttons and separators render', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        await expect(toolbar.locator(':scope > .ag-toolbar-button-wrapper')).toHaveCount(7);
        await expect(toolbar.locator(':scope > .ag-toolbar-separator')).toHaveCount(3);
    });

    test.eachFramework('Action buttons have no visible label text', async ({ page }) => {
        await waitForGridContent(page);

        const buttons = page.locator('.ag-toolbar .ag-toolbar-button-wrapper .ag-toolbar-button');
        const count = await buttons.count();
        for (let i = 0; i < count; i++) {
            await expect(buttons.nth(i).locator('.ag-toolbar-button-label')).not.toBeVisible();
        }
    });

    test.eachFramework('Column chooser tabs directly to the element after the grid', async ({ page }) => {
        await waitForGridContent(page);

        await page.evaluate(() => {
            const after = document.createElement('button');
            after.id = 'focus-after-grid';
            after.textContent = 'After grid';
            document.querySelector('.ag-root-wrapper')!.after(after);
        });

        await page.locator('.ag-toolbar-button[title="Open Column Chooser"]').click();
        await expect(page.locator('.ag-dialog')).toBeVisible();

        await page.keyboard.press('Tab');
        await expect(page.locator('.ag-column-select-header-filter-wrapper input')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.locator('.ag-column-select-list .ag-virtual-list-item').first()).toBeFocused();
        await page.keyboard.press('Tab');

        await expect(page.locator('#focus-after-grid')).toBeFocused();
        await expect(page.locator('.ag-dialog > .ag-tab-guard-bottom')).not.toBeFocused();
    });
});
