import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Safari/WebKit treats Backspace outside a text field as "go back": the focused element here is
    // the cell div, so the keypress navigates away from the example instead of reaching the grid.
    // The gesture is untestable there, so the Backspace legs below run on the other browsers.
    const backspaceReachesTheGrid = () => test.info().project.name !== 'webkit';

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

    // First Name and Last Name are left on the default editor.
    test.eachFramework('the name columns use the default editor', async ({ agIdFor }) => {
        const firstName = agIdFor.cell('0', 'first_name');
        await firstName.dblclick();
        await expect(firstName.locator('input.ag-input-field-input')).toBeVisible();
        await expect(firstName.locator('input.my-simple-editor')).toHaveCount(0);

        const lastName = agIdFor.cell('0', 'last_name');
        await lastName.dblclick();
        await expect(lastName.locator('input.ag-input-field-input')).toBeVisible();
        await expect(lastName.locator('input.my-simple-editor')).toHaveCount(0);
    });

    // Every other column uses MySimpleEditor.
    test.eachFramework('the remaining columns use MySimpleEditor', async ({ agIdFor }) => {
        const mood = agIdFor.cell('0', 'mood');
        await mood.dblclick();
        const moodInput = mood.locator('input.my-simple-editor').first();
        await expect(moodInput).toHaveValue('Happy');
        await moodInput.fill('Excited');
        await moodInput.press('Enter');
        await expect(mood).toContainText('Excited');

        const country = agIdFor.cell('0', 'country');
        await country.dblclick();
        const countryInput = country.locator('input.my-simple-editor').first();
        await expect(countryInput).toHaveValue('Ireland');
        await countryInput.fill('France');
        await countryInput.press('Enter');
        await expect(country).toContainText('France');
    });

    // MySimpleEditor seeds itself from params.eventKey: Backspace clears, a printable key starts the value.
    test.eachFramework('Backspace clears and a printable key seeds the editor', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'country');

        if (backspaceReachesTheGrid()) {
            await cell.click();
            await expect(cell).toHaveClass(/ag-cell-focus/);
            await page.keyboard.press('Backspace');
            await expect(cell.locator('input.my-simple-editor')).toHaveValue('');
            await page.keyboard.press('Escape');
        }

        await cell.click();
        await expect(cell).toHaveClass(/ag-cell-focus/);
        await page.keyboard.press('x');
        await expect(cell.locator('input.my-simple-editor')).toHaveValue('x');
        await page.keyboard.press('Escape');
    });

    // The example's 2s interval prints the three getCellEditorInstances() outcomes to the console.
    test.eachFramework('getCellEditorInstances reports all three outcomes', async ({ agIdFor, page }) => {
        const logs: string[] = [];
        page.on('console', (m) => logs.push(m.text()));

        // 1) Nothing is editing.
        await expect.poll(() => logs, { timeout: 15000 }).toContain('found not editing cell.');

        // 2) A cell using the default editor is editing, so myCustomFunction is not there.
        await agIdFor.cell('0', 'first_name').dblclick();
        await expect
            .poll(() => logs, { timeout: 15000 })
            .toContain('found editing cell, but method myCustomFunction not found, must be the default editor.');
        await page.keyboard.press('Escape');

        // 3) A cell using MySimpleEditor is editing, so myCustomFunction reports the row and column.
        await agIdFor.cell('0', 'gender').dblclick();
        await expect
            .poll(() => logs, { timeout: 15000 })
            .toContain('found editing cell: row index = 0, column = gender.');
        await page.keyboard.press('Escape');
    });
});
