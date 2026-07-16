import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const usGroup = agIdFor.rowNode('row-group-country-United States').first();
        await expect(usGroup).toHaveClass(/ag-full-width-row/);
        await expect(usGroup.locator('.ag-group-value')).toContainText('United States');

        // Count is shown (not suppressed here) alongside the checkbox.
        await expect(usGroup.locator('.ag-group-child-count')).toContainText('(1109)');

        // checkboxLocation: 'autoGroupColumn' renders a checkbox in the group cell.
        const groupCheckbox = usGroup.locator('.ag-group-checkbox .ag-checkbox-input');
        await expect(groupCheckbox).toBeVisible();
        await expect(usGroup).toHaveAttribute('aria-selected', 'false');

        // groupSelects: 'descendants' - selecting the group selects its children.
        await groupCheckbox.check();
        await expect(usGroup).toHaveAttribute('aria-selected', 'true');
        await usGroup.locator('.ag-group-contracted').click();
        await expect(usGroup).toHaveClass(/ag-row-group-expanded/);
        await expect(page.locator('.ag-row.ag-row-selected:not(.ag-full-width-row)').first()).toBeVisible();
    });
});
