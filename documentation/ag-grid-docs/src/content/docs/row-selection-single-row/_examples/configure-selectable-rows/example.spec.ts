import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('a selectable row (year < 2007) can be selected', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Row 6 is Natalie Coughlin, 2004 — selectable per isRowSelectable.
        await expect(agIdFor.cell('6', 'year')).toContainText('2004');
        await agIdFor.selectionColumnCheckbox('6').first().click();
        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('non-selectable rows hide their checkbox when hideDisabledCheckboxes is on', async ({
        agIdFor,
        page,
    }) => {
        await ensureGridReady(page);

        // Row 0 is 2008 — not selectable; hideDisabledCheckboxes (default on) hides its checkbox.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        await expect(agIdFor.selectionColumnCheckbox('0')).toHaveCount(0);
    });

    test.eachFramework('toggling hideDisabledCheckboxes off reveals the disabled checkbox', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await expect(agIdFor.selectionColumnCheckbox('0')).toHaveCount(0);

        // Uncheck the control so disabled checkboxes are shown rather than hidden.
        await page.locator('#toggle-hide-checkbox').uncheck();
        await expect(agIdFor.selectionColumnCheckbox('0').first()).toBeVisible();
    });
});
