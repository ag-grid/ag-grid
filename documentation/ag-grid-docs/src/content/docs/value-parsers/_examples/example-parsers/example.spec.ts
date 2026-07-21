import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // fields 'simple', 'numberBad', 'numberGood' (numberGood has a Number() valueParser). All editable.
    // Row 0: simple 'One', numberBad 6912, numberGood 2642.

    test.eachFramework('renders the source values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'simple')).toContainText('One');
        await expect(agIdFor.cell('0', 'numberBad')).toContainText('6912');
        await expect(agIdFor.cell('0', 'numberGood')).toContainText('2642');
    });

    test.eachFramework('editing the string column writes the new text back', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'simple');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('Grid');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('Grid');
    });

    test.eachFramework('editing the parsed number column round-trips the value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'numberGood');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        // valueParser converts the typed string '1234' to the number 1234.
        await editor.fill('1234');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('1234');
    });
});
