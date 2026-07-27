import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('a selectable row (year < 2007) can be selected', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Row 6 is Natalie Coughlin, 2004 — selectable per isRowSelectable.
        await expect(agIdFor.cell('6', 'year')).toContainText('2004');
        await agIdFor.selectionColumnCheckbox('6').first().click();
        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework(
        'non-selectable rows hide their checkbox when hideDisabledCheckboxes is on',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // Row 0 is 2008 — not selectable; hideDisabledCheckboxes (default on) hides its checkbox.
            await expect(agIdFor.cell('0', 'year')).toContainText('2008');
            await expect(agIdFor.selectionColumnCheckbox('0')).not.toBeVisible();
        }
    );

    test.eachFramework(
        'toggling hideDisabledCheckboxes off reveals the disabled checkbox',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await expect(agIdFor.selectionColumnCheckbox('0')).not.toBeVisible();

            // Uncheck the control so disabled checkboxes are shown rather than hidden.
            await page.locator('#toggle-hide-checkbox').uncheck();

            // The revealed checkbox is present but disabled, not merely visible.
            // The test id resolves to the <input>; its wrapper (an ancestor) carries the disabled class.
            const checkboxInput = agIdFor.selectionColumnCheckbox('0').first();
            await expect(checkboxInput).toBeVisible();
            const wrapper = checkboxInput.locator(
                'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " ag-checkbox-input-wrapper ")]'
            );
            await expect(wrapper).toHaveClass(/ag-disabled/);
            await expect(checkboxInput).toBeDisabled();

            // Force-clicking the disabled checkbox cannot select the non-selectable row.
            await checkboxInput.click({ force: true });
            await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
        }
    );
});
