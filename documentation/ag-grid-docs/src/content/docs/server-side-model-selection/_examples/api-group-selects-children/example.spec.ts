import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('groupSelects descendants reflects full and partial group selection', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();
        const groupCheckbox = (name: string) => groupRow(name).locator('.ag-checkbox-input-wrapper').first();

        // With groupSelects: 'descendants' the applied state selects all children except within
        // United States, where only the 2004 subgroup is fully selected. So United States is
        // partially selected (indeterminate), while its 2004 subgroup is fully selected.
        await expect(groupRow('United States')).not.toHaveClass(/ag-row-selected/);
        await expect(groupCheckbox('United States')).toHaveClass(/ag-indeterminate/);

        await expect(groupRow('2004')).toHaveClass(/ag-row-selected/);
        await expect(groupCheckbox('2004')).toHaveClass(/ag-checked/);

        // A sibling year subgroup with no selected children is not selected.
        await expect(groupRow('2008')).not.toHaveClass(/ag-row-selected/);

        // Save the current selection, clear it, then reload it.
        await page.getByRole('button', { name: 'Save Selection' }).click();

        await page.getByRole('button', { name: 'Clear Selection' }).click();
        await expect(groupCheckbox('United States')).not.toHaveClass(/ag-indeterminate/);
        await expect(groupRow('2004')).not.toHaveClass(/ag-row-selected/);

        await page.getByRole('button', { name: 'Load Selection' }).click();
        await expect(groupCheckbox('United States')).toHaveClass(/ag-indeterminate/);
        await expect(groupRow('2004')).toHaveClass(/ag-row-selected/);
    });
});
