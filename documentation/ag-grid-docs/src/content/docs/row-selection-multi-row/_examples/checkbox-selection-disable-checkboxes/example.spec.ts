import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('selectable rows (year < 2007) can be multi-selected', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Rows 6 (2004) and 7 (2000) are both selectable.
        await agIdFor.selectionColumnCheckbox('6').first().click();
        await agIdFor.selectionColumnCheckbox('7').first().click();
        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('7')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework(
        'non-selectable rows hide their checkbox when hideDisabledCheckboxes is on',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // Row 0 is 2008 — not selectable; its disabled checkbox is hidden by default.
            await expect(agIdFor.cell('0', 'year')).toContainText('2008');
            await expect(agIdFor.selectionColumnCheckbox('0')).toHaveCount(0);
        }
    );

    test.eachFramework(
        'toggling hideDisabledCheckboxes off reveals the disabled checkbox',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await expect(agIdFor.selectionColumnCheckbox('0')).toHaveCount(0);
            await page.locator('#toggle-hide-checkbox').uncheck();

            // The revealed checkbox is present but disabled, not merely visible.
            const checkbox = agIdFor.selectionColumnCheckbox('0').first();
            await expect(checkbox).toBeVisible();
            await expect(checkbox.locator('.ag-checkbox-input-wrapper').first()).toHaveClass(/ag-disabled/);
            await expect(checkbox.locator('input').first()).toBeDisabled();

            // Force-clicking the disabled checkbox cannot select the non-selectable row.
            await checkbox.click({ force: true });
            await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
        }
    );
});
