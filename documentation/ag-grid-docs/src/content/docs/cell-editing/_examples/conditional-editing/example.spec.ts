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
});
