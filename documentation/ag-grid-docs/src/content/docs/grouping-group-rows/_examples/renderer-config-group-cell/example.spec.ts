import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const usGroup = agIdFor.rowNode('row-group-country-United States').first();
        await expect(usGroup).toHaveClass(/ag-full-width-row/);
        await expect(usGroup.locator('.ag-group-value')).toContainText('United States');

        // suppressCount: true removes the child count from the group row.
        await expect(usGroup.locator('.ag-group-child-count')).toBeEmpty();

        // checkboxLocation: 'autoGroupColumn' renders a selection checkbox in the group cell.
        const groupCheckbox = usGroup.locator('.ag-group-checkbox .ag-checkbox-input');
        await expect(groupCheckbox).toBeVisible();
        await expect(usGroup).toHaveAttribute('aria-selected', 'false');

        // Selecting the group row selects it (groupSelects: 'descendants' also selects children).
        await groupCheckbox.check();
        await expect(usGroup).toHaveAttribute('aria-selected', 'true');

        // Expand to verify a descendant child data row is also selected.
        await usGroup.locator('.ag-group-contracted').click();
        await expect(usGroup).toHaveClass(/ag-row-group-expanded/);
        await expect(page.locator('.ag-row.ag-row-selected:not(.ag-full-width-row)').first()).toBeVisible();
    });
});
