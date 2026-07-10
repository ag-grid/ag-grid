import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('setServerSideSelectionState selects all rows with exceptions', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // onFirstDataRendered applies { selectAll: true, toggledNodes: [United States, United States/2004] }.
        // Without groupSelects, selection is per-node: everything is selected except the two
        // explicitly toggled group nodes. United States and its 2004 subgroup are the exceptions;
        // the other year subgroups (e.g. 2008) and all leaf rows remain selected.
        await expect(groupRow('United States')).not.toHaveClass(/ag-row-selected/);
        await expect(groupRow('2004')).not.toHaveClass(/ag-row-selected/);
        await expect(groupRow('2008')).toHaveClass(/ag-row-selected/);
        await expect(groupRow('Michael Phelps')).toHaveClass(/ag-row-selected/);

        // Save the current selection, clear it, then reload it.
        await page.getByRole('button', { name: 'Save Selection' }).click();

        await page.getByRole('button', { name: 'Clear Selection' }).click();
        await expect(groupRow('2008')).not.toHaveClass(/ag-row-selected/);
        await expect(groupRow('Michael Phelps')).not.toHaveClass(/ag-row-selected/);

        await page.getByRole('button', { name: 'Load Selection' }).click();
        await expect(groupRow('2008')).toHaveClass(/ag-row-selected/);
        await expect(groupRow('Michael Phelps')).toHaveClass(/ag-row-selected/);
        await expect(groupRow('United States')).not.toHaveClass(/ag-row-selected/);
        await expect(groupRow('2004')).not.toHaveClass(/ag-row-selected/);
    });
});
