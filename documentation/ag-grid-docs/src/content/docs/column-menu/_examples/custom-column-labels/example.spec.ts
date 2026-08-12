import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders custom labels in the Column Chooser', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        const chooser = page.locator('.ag-column-select');
        await expect(chooser.locator('.custom-column-label[data-kind="group"]')).toHaveCount(2);
        await expect(chooser.locator('.custom-column-label[data-kind="column"]')).toHaveCount(6);
        await expect(chooser.locator('.custom-column-label[data-source="columnChooser"]')).toHaveCount(8);
        await expect(chooser.locator('.custom-column-label', { hasText: 'Results' })).toBeVisible();

        const goldRow = chooser.locator('.ag-column-select-column', {
            has: chooser.locator('.custom-column-label', { hasText: 'Gold' }),
        });
        await expect(goldRow.locator('.ag-column-select-checkbox')).toBeVisible();
    });
});
