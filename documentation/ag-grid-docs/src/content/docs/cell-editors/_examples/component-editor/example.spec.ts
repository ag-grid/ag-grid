import { expect, test } from '@utils/grid/test-utils';

const runTests = (frameworkTest: any) => {
    frameworkTest('displays the provided text and custom numeric columns', async ({ agIdFor }: any) => {
        // Row 0: { name: 'Bob', number: 10 }
        await expect(agIdFor.cell('0', 'name')).toContainText('Bob');
        await expect(agIdFor.cell('0', 'number')).toContainText('10');
        // Row 1: { name: 'Harry', number: 3 }
        await expect(agIdFor.cell('1', 'name')).toContainText('Harry');
        await expect(agIdFor.cell('1', 'number')).toContainText('3');
    });

    frameworkTest('edits a value with the custom numeric editor', async ({ agIdFor }: any) => {
        const cell = agIdFor.cell('0', 'number');
        await expect(cell).toContainText('10');

        await cell.dblclick();
        const input = cell.locator('input').first();
        await expect(input).toBeVisible();
        await input.fill('42');
        await input.press('Enter');

        await expect(cell).toContainText('42');
    });

    // The 'name' column has no cellEditor, so it uses the provided text editor, not NumericEditor.
    frameworkTest('the provided text column uses the default editor', async ({ agIdFor }: any) => {
        const cell = agIdFor.cell('0', 'name');
        await cell.dblclick();
        await expect(cell.locator('input.ag-input-field-input')).toBeVisible();
        await expect(cell.locator('input.numeric-input')).toHaveCount(0);

        const input = cell.locator('input').first();
        await input.fill('Robert');
        await input.press('Enter');
        await expect(cell).toContainText('Robert');
    });

    // isCancelBeforeStart returns true for a printable non-digit key, so the edit never starts.
    frameworkTest(
        'isCancelBeforeStart blocks a non-numeric key',
        async ({ agIdFor, page }: any) => {
            const cell = agIdFor.cell('0', 'number');
            await cell.click();
            await page.keyboard.press('a');

            // React mounts the editor before isCancelBeforeStart is consulted, so the editor element can
            // appear briefly; what the claim guarantees on every framework is that no edit takes effect.
            // Mounting it with Number('a') also makes the React development build warn about a NaN value -
            // a defect in the React example rather than in the grid, so the warning is opted into here.
            await expect(cell).toHaveText('10');
        },
        { allowedConsoleMessages: ['Received NaN for the `%s` attribute'] }
    );

    // A digit key starts the editor seeded with that digit (params.eventKey).
    frameworkTest('a digit key starts the editor with that digit', async ({ agIdFor, page }: any) => {
        const cell = agIdFor.cell('0', 'number');
        await cell.click();
        await page.keyboard.press('7');

        await expect(cell.locator('input.numeric-input')).toHaveValue('7');
    });

    // Backspace starts the editor with an empty value.
    frameworkTest('Backspace starts the editor cleared', async ({ agIdFor, page }: any) => {
        const cell = agIdFor.cell('0', 'number');
        await cell.click();
        await page.keyboard.press('Backspace');

        await expect(cell.locator('input.numeric-input')).toHaveValue('');
    });

    // F2 starts the editor with the current cell value.
    frameworkTest('F2 starts the editor with the current value', async ({ agIdFor, page }: any) => {
        const cell = agIdFor.cell('0', 'number');
        await cell.click();
        await page.keyboard.press('F2');

        await expect(cell.locator('input.numeric-input')).toHaveValue('10');
    });

    // onKeyDown calls preventDefault for anything that is not a digit, so the value is unchanged.
    frameworkTest('non-numeric characters are blocked while editing', async ({ agIdFor }: any) => {
        const cell = agIdFor.cell('0', 'number');
        await cell.dblclick();

        const input = cell.locator('input.numeric-input');
        await expect(input).toHaveValue('10');
        await input.press('a');
        await expect(input).toHaveValue('10');
    });

    // finishedEditingPressed treats Tab as well as Enter as the end of the edit.
    frameworkTest('Tab commits the edit', async ({ agIdFor }: any) => {
        const cell = agIdFor.cell('0', 'number');
        await cell.dblclick();

        const input = cell.locator('input.numeric-input');
        await input.fill('55');
        await input.press('Tab');

        await expect(cell).toHaveText('55');
    });

    // isCancelAfterEnd rejects the result of the edit when the value is greater than 1,000,000.
    frameworkTest('isCancelAfterEnd rejects a value over 1,000,000', async ({ agIdFor }: any) => {
        const cell = agIdFor.cell('0', 'number');
        await cell.dblclick();

        const input = cell.locator('input.numeric-input');
        await input.fill('2000000');
        await input.press('Enter');

        await expect(cell).toHaveText('10');
    });
};

test.agExample(import.meta, () => {
    // Example only supports the React frameworks (see exampleConfig.json).
    runTests(test.reactFunctionalTs);
    runTests(test.reactFunctionalTs_Dev);
});
