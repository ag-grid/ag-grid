import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0: { first_name: 'Bob', last_name: 'Harrison', gender: 'Male', mood: 'Happy', country: 'Ireland' }
    test.eachFramework('displays the student data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'first_name')).toContainText('Bob');
        await expect(agIdFor.cell('0', 'last_name')).toContainText('Harrison');
        await expect(agIdFor.cell('0', 'gender')).toContainText('Male');
        await expect(agIdFor.cell('0', 'mood')).toContainText('Happy');
        await expect(agIdFor.cell('0', 'country')).toContainText('Ireland');
    });

    test.eachFramework('edits a cell with the custom MySimpleEditor', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'gender');
        await cell.dblclick();
        const input = cell.locator('input.my-simple-editor').first();
        await expect(input).toBeVisible();
        await input.fill('Female');
        await input.press('Enter');
        await expect(cell).toContainText('Female');
    });
});
