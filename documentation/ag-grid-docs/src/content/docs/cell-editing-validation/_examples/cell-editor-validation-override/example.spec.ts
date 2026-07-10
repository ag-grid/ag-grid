import { expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // Row 0 of olympic-winners.json: Michael Phelps, age 23.
    test.eachFramework('displays the source data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('reverts an athlete edit shorter than 3 characters', async ({ agIdFor, page }) => {
        // getValidationErrors requires at least 3 characters, so 'ab' is invalid and reverts.
        const cell = agIdFor.cell('0', 'athlete');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('ab');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('Michael Phelps');
    });

    test.eachFramework('commits a valid athlete edit', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'athlete');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('Jane Doe');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('Jane Doe');
    });

    test.eachFramework('reverts an age edit equal to 18', async ({ agIdFor, page }) => {
        // getValidationErrors rejects the value 18, so the edit reverts to the original 23.
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('18');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('23');
    });
});
