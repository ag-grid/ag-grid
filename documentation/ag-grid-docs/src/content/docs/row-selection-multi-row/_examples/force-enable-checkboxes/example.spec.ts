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

    test.eachFramework('only year-2012 rows render an enabled checkbox', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // checkboxes callback returns true only when year === 2012.
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');
        const enabledCheckbox = agIdFor.selectionColumnCheckbox('2').first();
        await expect(enabledCheckbox).toBeVisible();
        await expect(enabledCheckbox).toBeEnabled();

        // Row 0 (2008) is selectable but checkboxes returns false, so its checkbox
        // is rendered disabled rather than removed (hideDisabledCheckboxes defaults to false).
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        const disabledCheckbox = agIdFor.selectionColumnCheckbox('0').first();
        await expect(disabledCheckbox).toBeVisible();
        const wrapper = disabledCheckbox.locator(
            'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ag-checkbox-input-wrapper ")]'
        );
        await expect(wrapper).toHaveClass(/ag-disabled/);
        await expect(disabledCheckbox).toBeDisabled();
    });

    test.eachFramework('clicking a forced checkbox selects that row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-selected/);
        await agIdFor.selectionColumnCheckbox('2').first().click();
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });
});
