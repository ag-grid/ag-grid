import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders custom labels in the Column Chooser', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        const chooser = page.locator('.ag-column-select');
        await expect(chooser.locator('.ag-column-select-column-group .custom-column-label')).toHaveCount(2);
        await expect(chooser.locator('.ag-column-select-column .custom-column-label')).toHaveCount(6);
        await expect(chooser.locator('.custom-column-label', { hasText: 'Results' })).toBeVisible();

        const goldRow = chooser.locator('.ag-column-select-column', {
            has: page.locator('.custom-column-label', { hasText: 'Gold' }),
        });
        await expect(goldRow.locator('.ag-column-select-checkbox')).toBeVisible();
    });
});
