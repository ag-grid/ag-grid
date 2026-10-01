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

    test.eachFramework('column groups and columns render distinct label icons', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

        const chooser = page.locator('.ag-column-select');

        // columnGroupIcon: '◆' is used for the group label
        const resultsGroup = chooser.locator('.ag-column-select-column-group', {
            has: page.locator('.custom-column-label-text', { hasText: 'Results' }),
        });
        await expect(resultsGroup.locator('.custom-column-label-icon')).toHaveText('◆');

        // columnIcon: '●' is used for the column label
        const goldRow = chooser.locator('.ag-column-select-column', {
            has: page.locator('.custom-column-label-text', { hasText: 'Gold' }),
        });
        await expect(goldRow.locator('.custom-column-label-icon')).toHaveText('●');
    });

    test.eachFramework(
        'group rows keep the grid managed checkbox, drag handle and expand control',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            await agIdFor.headerCell('athlete').hover();
            await agIdFor.headerCellMenuButton('athlete').click();
            await page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' }).click();

            // the renderer only replaces the label text - the grid still supplies the controls
            await expect(agIdFor.columnChooserListItemCheckbox('Athlete Details Column Group')).toBeVisible();
            await expect(agIdFor.columnChooserListItemDragHandle('Athlete Details Column Group')).toBeVisible();

            const groupItem = page.locator(
                '.ag-column-select-virtual-list-item[aria-label="Athlete Details Column Group"]'
            );
            // groups start expanded, so the grid managed expand control shows the "opened" icon
            await expect(groupItem.locator('.ag-column-group-opened-icon')).toBeVisible();

            // and it still collapses the group, hiding its children
            await groupItem.locator('.ag-column-group-opened-icon').click();
            await expect(page.locator('.ag-column-select-virtual-list-item[aria-label="Country Column"]')).toHaveCount(
                0
            );
            await expect(groupItem.locator('.ag-column-group-closed-icon')).toBeVisible();
        }
    );
});
