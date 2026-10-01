import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'should display header and keep multi-select editor open after clicking options',
        async ({ agIdFor, page }) => {
            // Verify the column header contains the expected text
            const header = agIdFor.headerCell('colors');
            await expect(header).toContainText('Colours');

            // Double-click the first row cell to open the rich select editor
            const cell = agIdFor.cell('0', 'colors');
            await cell.dblclick();

            // Verify the rich select popup list appears
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Click the first visible option in the popup (the list opens scrolled to the
            // current selection, so we interact with whatever rows are in the viewport)
            const firstOption = popup.locator('.ag-rich-select-row').first();
            await expect(firstOption).toBeVisible();
            await firstOption.click();

            // Multi-select: popup should remain open after clicking an option
            await expect(popup).toBeVisible();

            // Click the second visible option
            const secondOption = popup.locator('.ag-rich-select-row').nth(1);
            await expect(secondOption).toBeVisible();
            await secondOption.click();

            // Multi-select: popup should still remain open after clicking another option
            await expect(popup).toBeVisible();

            // Press Escape to cancel editing without confirming changes
            await page.keyboard.press('Escape');

            // Verify the popup is no longer visible after pressing Escape
            await expect(popup).not.toBeVisible();
        }
    );

    test.eachFramework('should show selected state for options in multi-select editor', async ({ agIdFor, page }) => {
        // Double-click the first row cell to open the rich select editor
        const cell = agIdFor.cell('0', 'colors');
        await cell.dblclick();

        // Verify the rich select popup list appears
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Verify that at least one option has the selected class, reflecting
        // the pre-selected colours from the initial random row data (1-4 colours per row)
        const selectedRows = popup.locator('.ag-rich-select-row-selected');
        const selectedCount = await selectedRows.count();
        expect(selectedCount).toBeGreaterThanOrEqual(1);

        // Press Escape to close the editor
        await page.keyboard.press('Escape');

        // Verify the popup is no longer visible
        await expect(popup).not.toBeVisible();
    });

    test.eachFramework('should commit the selected values as a joined list', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'colors');

        // Read the current value first, as the selected colours are randomised
        const originalValues = (await cell.textContent())!.trim().split(', ');

        await cell.dblclick();

        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Add a colour that is not already selected
        const unselectedRow = popup.locator('.ag-rich-select-row:not(.ag-rich-select-row-selected)').first();
        await expect(unselectedRow).toBeVisible();
        const addedValue = (await unselectedRow.innerText()).trim();
        await unselectedRow.click();

        // Enter commits the multi-selection, and the valueFormatter joins the array with ', '
        await page.keyboard.press('Enter');
        await expect(popup).not.toBeVisible();

        await expect
            .poll(async () => (await cell.textContent())!.trim().split(', '))
            .toEqual(expect.arrayContaining([...originalValues, addedValue]));
    });

    test.eachFramework(
        'should deselect an already selected value when clicking it again',
        async ({ agIdFor, page }) => {
            const cell = agIdFor.cell('0', 'colors');

            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // The list opens scrolled to the current selection, so a selected row is in view
            const selectedRow = popup.locator('.ag-rich-select-row-selected').first();
            await expect(selectedRow).toBeVisible();
            const removedValue = (await selectedRow.innerText()).trim();

            // Clicking a selected row toggles it off
            await selectedRow.click();
            const removedRow = popup
                .locator('.ag-rich-select-row')
                .filter({ hasText: new RegExp(`^${removedValue}$`) })
                .first();
            await expect(removedRow).not.toHaveClass(/ag-rich-select-row-selected/);

            // Committing leaves the deselected colour out of the cell value
            await page.keyboard.press('Enter');
            await expect(popup).not.toBeVisible();

            await expect.poll(async () => (await cell.textContent())!.trim().split(', ')).not.toContain(removedValue);
        }
    );

    test.eachFramework(
        'should render selected values as pills when allowTyping is enabled',
        async ({ agIdFor, page }) => {
            // Enable allowTyping, which switches the editor to the typing multi-select display
            await page.locator('#allow-typing').check();

            const cell = agIdFor.cell('0', 'colors');
            const selectedValues = (await cell.textContent())!.trim().split(', ');

            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Each selected value is rendered as a pill (the default multi-select pill renderer)
            const pillDisplay = page.locator('.ag-rich-select-pill-display').first();
            await expect(pillDisplay).toBeVisible();
            await expect(pillDisplay.locator('.ag-pill')).toHaveCount(selectedValues.length);
            await expect(pillDisplay.locator('.ag-pill').first()).toContainText(selectedValues[0]);

            await page.keyboard.press('Escape');
        }
    );

    test.eachFramework(
        'should not render pills when suppressMultiSelectPillRenderer is enabled',
        async ({ agIdFor, page }) => {
            // suppressMultiSelectPillRenderer turns off the pill renderer for the typing multi-select
            await page.locator('#allow-typing').check();
            await page.locator('#suppress-multi-select-pill-renderer').check();

            const cell = agIdFor.cell('0', 'colors');
            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // No pill display is created, but the typing input is still available
            await expect(page.locator('.ag-rich-select-pill-display')).toHaveCount(0);
            await expect(page.locator('.ag-pill')).toHaveCount(0);
            await expect(page.locator('.ag-rich-select-field-input .ag-input-field-input').first()).toBeVisible();

            await page.keyboard.press('Escape');
        }
    );

    test.eachFramework(
        'should use the custom cell renderer in the cell and editor list when enabled',
        async ({ agIdFor, page }) => {
            // This example's ColourCellRenderer tints each value with an inline border colour
            await page.locator('#custom-cell-renderer').check();

            const cell = agIdFor.cell('0', 'colors');
            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Editor list rows hold a single value, so the renderer takes its color-tag branch.
            const rowRenderer = popup.locator('.ag-rich-select-row .custom-color-cell-renderer').first();
            await expect(rowRenderer).toBeVisible();
            await expect(rowRenderer).toHaveClass(/color-tag/);
            await expect(rowRenderer.locator('span').first()).toHaveAttribute('style', /border-color:/);

            await page.keyboard.press('Escape');
        }
    );
});
