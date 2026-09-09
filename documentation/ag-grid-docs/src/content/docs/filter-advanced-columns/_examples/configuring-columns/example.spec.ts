import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should show advanced filter input and load grouped data', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Advanced filter input should be visible
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toBeVisible();

        // Data should be grouped by country (groupDefaultExpanded: 1)
        const groupRows = page.locator('.ag-row-group');
        await expect(groupRows.first()).toBeVisible();
    });

    test.eachFramework('should toggle hidden columns in filter via button', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        const toggleButton = page.locator('#includeHiddenColumns');

        // Type '[S' to search for Sport column — should not appear (hidden columns excluded by default)
        await filterInput.fill('[S');
        const autocompleteList = page.locator('.ag-autocomplete-list-popup');
        await expect(autocompleteList).toBeVisible();
        // Sport should NOT be in the suggestions (Silver is, but not Sport)
        const sportOption = autocompleteList.getByText('Sport', { exact: true });
        await expect(sportOption).not.toBeVisible();

        // Clear the input and press Escape to close any autocomplete
        await filterInput.fill('');
        await filterInput.press('Escape');

        // Click "Include Hidden Columns"
        await toggleButton.click();

        // Now type '[S' again — Sport should appear in suggestions
        await filterInput.fill('[Sport');
        await expect(autocompleteList).toBeVisible();
        const sportOptionAfter = autocompleteList.getByText('Sport', { exact: true });
        await expect(sportOptionAfter).toBeVisible();
    });
});
