import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the olympic winners source data', async ({ agIdFor }) => {
        // First row of olympic-winners.json: Michael Phelps, United States, 2008, total 8.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Editing a cell commits the new value', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'athlete');

        await cell.dblclick();
        const input = page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();
        await expect(input).toBeVisible();
        await input.fill('Jane Doe');
        await input.press('Enter');

        await expect(cell).toContainText('Jane Doe');
    });

    test.eachFramework('Cell selection ranges can be dragged for copy', async ({ agIdFor }) => {
        const source = agIdFor.cell('0', 'gold');
        const target = agIdFor.cell('2', 'total');

        await dragOverTo(source, target, undefined);

        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(target).toHaveClass(/ag-cell-range-selected/);
    });
});
