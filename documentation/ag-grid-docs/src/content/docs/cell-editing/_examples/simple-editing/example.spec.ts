import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the source data with editing enabled', async ({ agIdFor }) => {
        // First row of olympic-winners.json: Michael Phelps, 23, United States, 2008, total 8.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('edits a text cell and commits the new value', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'athlete');
        await expect(cell).toContainText('Michael Phelps');

        // Double-click to enter edit mode, replace the value, and commit with Enter.
        await cell.dblclick();
        const input = page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();
        await expect(input).toBeVisible();
        await input.fill('Jane Doe');
        await input.press('Enter');

        await expect(cell).toContainText('Jane Doe');
    });

    test.eachFramework('edits a number cell and commits the new value', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'age');

        await cell.dblclick();
        const input = page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();
        await expect(input).toBeVisible();
        await input.fill('99');
        await input.press('Enter');

        await expect(cell).toContainText('99');
    });
});
