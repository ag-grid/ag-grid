import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns Tool Panel stages changes until Apply is clicked', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Grid renders grouped by Country (top level), and the Columns Tool Panel is present.
        await expect(groupRow('United States')).toBeVisible();
        await expect(page.locator('.ag-column-select')).toBeVisible();

        // The 'Age' column starts visible in the grid.
        const ageHeader = page.locator('.ag-header-cell[col-id="age"]');
        await expect(ageHeader).toBeVisible();

        // Unchecking 'Age' in the tool panel stages the change but does NOT apply it —
        // the column stays visible in the grid until Apply is clicked.
        const ageToolPanelCheckbox = page
            .locator('.ag-column-select-column')
            .filter({ hasText: 'Age' })
            .locator('.ag-checkbox-input');
        await ageToolPanelCheckbox.click();
        await expect(ageHeader).toBeVisible();

        // Clicking Apply commits the staged change and the column is removed.
        await page.getByRole('button', { name: 'Apply' }).click();
        await expect(ageHeader).toBeHidden();
    });
});
