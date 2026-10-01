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

    test.eachFramework('reverts a number edit below the min', async ({ agIdFor, page }) => {
        // Documented claim: "Number editors validate against min and max constraints." Age min is 0.
        const cell = agIdFor.cell('0', 'age');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('-5');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('23');
        await expect(cell).not.toContainText('-5');
    });

    test.eachFramework('respects the athlete maxLength constraint', async ({ agIdFor, page }) => {
        // Documented claim: "Text and Large Text editors will respect the maxLength property."
        // Athlete sets maxLength 10, which the Text editor applies to the input itself, so an
        // over-long value can never be entered rather than being caught by validation.
        const cell = agIdFor.cell('0', 'athlete');

        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('maxlength', '10');

        await editInput(page).fill('AaronMichaelPhelps');
        await expect(editInput(page)).toHaveValue('AaronMicha');

        await editInput(page).fill('Jane Doe');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('Jane Doe');
    });

    test.eachFramework('reverts a Date editor value past its max', async ({ agIdFor, page }) => {
        // dateObj uses agDateCellEditor with max 2008-12-31, so 2010-01-01 is invalid.
        const cell = agIdFor.cell('0', 'dateObj');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('2010-01-01');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('2008-08-24');
        await expect(cell).not.toContainText('2010');
    });

    test.eachFramework('commits a Date editor value within its max', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'dateObj');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('2008-01-01');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('2008-01-01');
    });

    test.eachFramework('reverts a Date as String value below its min', async ({ agIdFor, page }) => {
        // date uses agDateStringCellEditor with min 2008-12-31, so 2007-01-01 is invalid.
        const cell = agIdFor.cell('0', 'date');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('2007-01-01');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('2008-08-24');
        await expect(cell).not.toContainText('2007');
    });

    test.eachFramework('commits a Date as String value above its min', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'date');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await editInput(page).fill('2009-06-15');
        await editInput(page).press('Enter');

        await expect(editInput(page)).toHaveCount(0);
        await expect(cell).toContainText('2009-06-15');
    });
});
