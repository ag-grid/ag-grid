import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('String expressions drive getters and formatters', async ({ agIdFor }) => {
        // valueGetter/valueFormatter/valueSetter are all string expressions.
        // Row 0: words[0] + ' ' + words[0] => 'One One'.
        await expect(agIdFor.cell('0', 'simple')).toContainText('One One');

        // number valueFormatter expression: "£" + thousands-separated integer.
        // Row 0 number = ((0+2)*476321) % 10000 = 2642 => "£2,642".
        await expect(agIdFor.cell('0', 'number')).toContainText('£2,642');
        // Row 1 number = ((1+2)*476321) % 10000 = 8963 => "£8,963".
        await expect(agIdFor.cell('1', 'number')).toContainText('£8,963');

        // 'a' = i % 4, 'b' = i % 7.
        await expect(agIdFor.cell('0', 'a')).toContainText('0');
        await expect(agIdFor.cell('1', 'a')).toContainText('1');

        // Name column valueGetter 'data.firstName + " " + data.lastName' (anonymous colId '0').
        await expect(agIdFor.cell('0', '0')).toContainText('Niall Pink');
        // A + B column valueGetter 'data.a + data.b' (anonymous colId '1'). Row 1: 1 + 1 = 2.
        await expect(agIdFor.cell('1', '1')).toContainText('2');
    });

    test.eachFramework('Editing a cell re-runs the formatter expression', async ({ agIdFor }) => {
        const cell = agIdFor.cell('0', 'number');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('5000');
        await editor.press('Enter');

        // Math.floor(5000) formatted by the expression => "£5,000".
        await expect(cell).toContainText('£5,000');
    });
});
