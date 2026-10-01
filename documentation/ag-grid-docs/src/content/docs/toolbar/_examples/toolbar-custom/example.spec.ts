import {
    clickHeaderToSort,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom toolbar items drive filters and tool panels', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        await expect(toolbar).toBeVisible();

        const checkboxes = toolbar.locator('input[type="checkbox"]');
        const radios = toolbar.locator('input[type="radio"]');
        await expect(checkboxes).toHaveCount(2);
        await expect(radios).toHaveCount(3);

        await checkboxes.nth(0).click();
        await expect(page.locator('.ag-header-cell[col-id="gold"] .ag-filter-active')).toBeVisible();

        // Reset to a known starting point — Columns is selected by default in this example
        await toolbar.getByLabel('None').click();
        await expect(page.locator('.ag-column-panel')).toBeHidden();

        await toolbar.getByLabel('Columns').click();
        await expect(page.locator('.ag-column-panel')).toBeVisible();

        // Closing the panel via the side bar tab keeps the radio in sync via getToolbarItemInstance
        await page.getByRole('tab', { name: 'Columns' }).click();
        await expect(page.locator('.ag-column-panel')).toBeHidden();
        await expect(toolbar.getByLabel('None')).toBeChecked();
    });

    test.eachFramework('Gold winners only narrows the rows to gold medallists', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');

        // Sort gold ascending so the smallest value always occupies the top row. Unfiltered that is
        // data index 40 (Ryosuke Irie), the first zero-gold row in the dataset; the sort is stable,
        // so ties keep their original order.
        await clickHeaderToSort(agIdFor.headerCell('gold'));
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '40');

        // The checkbox applies a greaterThan 0 number filter to the gold column, which removes
        // every zero-gold row. The top row becomes data index 3 (Natalie Coughlin, 1 gold).
        await toolbar.locator('input[type="checkbox"]').nth(0).click();
        await expect(page.locator('.ag-header-cell[col-id="gold"] .ag-filter-active')).toBeVisible();
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '3');
        await expect(agIdFor.cell('3', 'gold')).toContainText('1');
        await expect(agIdFor.rowNode('40')).not.toBeVisible();
    });

    test.eachFramework('Unticking Gold winners only clears the filter', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');
        const goldCheckbox = toolbar.locator('input[type="checkbox"]').nth(0);

        await clickHeaderToSort(agIdFor.headerCell('gold'));
        await waitForRowAnimations(page);

        await goldCheckbox.click();
        await expect(goldCheckbox).toBeChecked();
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '3');

        // Unticking sets the column filter model back to null, so the zero-gold rows return and
        // data index 40 is back at the top of the ascending sort.
        await goldCheckbox.click();
        await expect(goldCheckbox).not.toBeChecked();
        await expect(page.locator('.ag-header-cell[col-id="gold"] .ag-filter-active')).toBeHidden();
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '40');
    });

    test.eachFramework('Silver winners only filters on the silver column', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');

        // Michael Phelps' first two rows won no silver, his third won 2.
        await expect(agIdFor.cell('0', 'silver')).toContainText('0');

        await toolbar.locator('input[type="checkbox"]').nth(1).click();
        await expect(page.locator('.ag-header-cell[col-id="silver"] .ag-filter-active')).toBeVisible();
        await waitForRowAnimations(page);

        await expect(agIdFor.rowNode('0')).not.toBeVisible();
        await expect(agIdFor.rowNode('1')).not.toBeVisible();
        await expect(agIdFor.cell('2', 'silver')).toContainText('2');

        // The gold column is untouched by the silver checkbox.
        await expect(page.locator('.ag-header-cell[col-id="gold"] .ag-filter-active')).toBeHidden();
    });

    test.eachFramework('Filters radio option opens the filters tool panel', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');

        await toolbar.getByLabel('Filters').click();

        const visiblePanel = page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)');
        await expect(visiblePanel.locator('.ag-filter-toolpanel, .ag-filter-panel').first()).toBeVisible();
        await expect(page.locator('.ag-column-panel')).toBeHidden();
        await expect(toolbar.getByLabel('Filters')).toBeChecked();
    });

    test.eachFramework('Opening a panel from the side bar syncs the radio', async ({ page }) => {
        await waitForGridContent(page);

        const toolbar = page.locator('.ag-toolbar');

        // Start closed so the side bar tab click is an open, not a close.
        await toolbar.getByLabel('None').click();
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)')).toHaveCount(0);

        // onToolPanelVisibleChanged pushes the opened panel key into the radio via
        // getToolbarItemInstance('toolPanel').setSelected(...).
        await page.getByRole('tab', { name: 'Filters' }).click();
        const visiblePanel = page.locator('.ag-tool-panel-wrapper:not(.ag-hidden)');
        await expect(visiblePanel.locator('.ag-filter-toolpanel, .ag-filter-panel').first()).toBeVisible();
        await expect(toolbar.getByLabel('Filters')).toBeChecked();

        // Switching tab to Columns moves the radio again.
        await page.getByRole('tab', { name: 'Columns' }).click();
        await expect(page.locator('.ag-column-panel')).toBeVisible();
        await expect(toolbar.getByLabel('Columns')).toBeChecked();
    });
});
