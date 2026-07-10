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
};

test.agExample(import.meta, () => {
    // Example only supports the React frameworks (see exampleConfig.json).
    runTests(test.reactFunctionalTs);
    runTests(test.reactFunctionalTs_Dev);
});
