import { expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // Row 0 of olympic-winners.json: Michael Phelps, age 23, date 24/08/2008.
    // Both the dateObj and date columns format to 2008-08-24.
    test.eachFramework('displays the source data across the editor columns', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'dateObj')).toContainText('2008-08-24');
        await expect(agIdFor.cell('0', 'date')).toContainText('2008-08-24');
    });

    test.eachFramework('commits a valid number edit within the min/max range', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('42');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('42');
    });

    test.eachFramework('reverts an out-of-range number edit', async ({ agIdFor, page }) => {
        // Default invalidEditValueMode is 'revert'. Age max is 100, so 200 is invalid and reverts to 23.
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('200');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('23');
    });
});
