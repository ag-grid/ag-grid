import { expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // Row 0: Michael Phelps 2008, Row 1: Michael Phelps 2004, Row 2: Michael Phelps 2012.
    test.eachFramework(
        'only cells matching the default editable year (2012) can be edited',
        async ({ agIdFor, page }) => {
            // Row 2 (year 2012) is editable — double-click opens an editor.
            const editableCell = agIdFor.cell('2', 'athlete');
            await expect(agIdFor.cell('2', 'year')).toContainText('2012');
            await editableCell.dblclick();
            await expect(editInput(page)).toBeVisible();
            await editInput(page).press('Escape');

            // Row 0 (year 2008) is not editable — double-click does not open an editor.
            const lockedCell = agIdFor.cell('0', 'athlete');
            await expect(agIdFor.cell('0', 'year')).toContainText('2008');
            await lockedCell.dblclick();
            await expect(editInput(page)).toHaveCount(0);
        }
    );

    test.eachFramework('editable cells are highlighted via cellStyle', async ({ agIdFor }) => {
        // The editableColumn type applies a blue background to cells matching the editable year (2012).
        const editableCell = agIdFor.cell('2', 'athlete');
        await expect(editableCell).toHaveAttribute('style', /background-color/);

        // Cells that are not editable (year 2008) have no highlight background.
        const lockedCell = agIdFor.cell('0', 'athlete');
        await expect(lockedCell).not.toHaveAttribute('style', /background-color/);
    });

    test.eachFramework('the Age column shares the same editable callback', async ({ agIdFor, page }) => {
        // Both Athlete and Age use the editableColumn type, so Age follows the same rule.
        await agIdFor.cell('2', 'age').dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).press('Escape');

        await agIdFor.cell('0', 'age').dblclick();
        await expect(editInput(page)).toHaveCount(0);
    });

    test.eachFramework('the buttons change which year is editable', async ({ agIdFor, page }) => {
        // Switch the editable year to 2008, which row 0 matches and row 2 does not.
        await page.getByRole('button', { name: 'Enable Editing for 2008' }).click();

        await agIdFor.cell('0', 'athlete').dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).press('Escape');

        await agIdFor.cell('2', 'athlete').dblclick();
        await expect(editInput(page)).toHaveCount(0);

        // redrawRows() re-applies cellStyle, so the highlight follows the new year too.
        await expect(agIdFor.cell('0', 'athlete')).toHaveAttribute('style', /background-color/);
        await expect(agIdFor.cell('2', 'athlete')).not.toHaveAttribute('style', /background-color/);

        // Switching back to 2012 restores the original state.
        await page.getByRole('button', { name: 'Enable Editing for 2012' }).click();
        await expect(agIdFor.cell('2', 'athlete')).toHaveAttribute('style', /background-color/);
        await expect(agIdFor.cell('0', 'athlete')).not.toHaveAttribute('style', /background-color/);
    });
});
