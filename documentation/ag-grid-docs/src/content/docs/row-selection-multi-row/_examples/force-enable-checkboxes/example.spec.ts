import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('rows selected on first render need no checkbox', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // onFirstDataRendered selects rows with year in 2004..2008.
        // Row 0 is 2008 and row 6 is 2004 — both selected despite having no checkbox.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('only year-2012 rows render a checkbox', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // checkboxes callback returns true only when year === 2012.
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');
        await expect(agIdFor.selectionColumnCheckbox('2').first()).toBeVisible();

        // Row 0 (2008) has no checkbox even though it is selectable.
        await expect(agIdFor.selectionColumnCheckbox('0')).toHaveCount(0);
    });

    test.eachFramework('clicking a forced checkbox selects that row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-selected/);
        await agIdFor.selectionColumnCheckbox('2').first().click();
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });
});
