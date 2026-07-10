import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Row 0: { first_name: 'Bob', last_name: 'Harrison', age: 15, gender: 'Male', mood: 'Happy' }
    test.eachFramework('displays the mix of provided and custom components', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'first_name')).toContainText('Bob');
        await expect(agIdFor.cell('0', 'last_name')).toContainText('Harrison');
        await expect(agIdFor.cell('0', 'age')).toContainText('15');
        // Gender uses a custom cell renderer that prints the value alongside an icon.
        await expect(agIdFor.cell('0', 'gender')).toContainText('Male');
        // Mood uses an image renderer.
        await expect(agIdFor.cell('0', 'mood').locator('img')).toBeVisible();
    });

    test.eachFramework('edits a cell with the provided text editor', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'first_name');
        await cell.dblclick();
        const input = cell.locator('input').first();
        await expect(input).toBeVisible();
        await input.fill('Alice');
        await input.press('Enter');
        await expect(cell).toContainText('Alice');
    });

    test.eachFramework('edits a cell with the custom text editor', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'last_name');
        await cell.dblclick();
        const input = cell.locator('input.my-simple-editor').first();
        await expect(input).toBeVisible();
        await input.fill('Smith');
        await input.press('Enter');
        await expect(cell).toContainText('Smith');
    });
});
