import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // colIds: 'Name' (anonymous) -> '0', 'A' -> 'a', 'B' (anonymous) -> '1',
    //         'C.X' (anonymous) -> '2', 'C.Y' (anonymous) -> '3'. All columns editable.
    // Row 0 firstName/lastName are deterministic: 'Niall' / 'Pink'.

    test.eachFramework('Name valueGetter combines firstName and lastName', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', '0')).toContainText('Niall Pink');
    });

    test.eachFramework('Name valueSetter splits the edited value back into two fields', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const nameCell = agIdFor.cell('0', '0');
        await nameCell.dblclick();
        const editor = nameCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('John Black');
        await page.keyboard.press('Enter');

        // The setter writes firstName='John' and lastName='Black'; the getter re-derives the display.
        await expect(editor).toHaveCount(0);
        await expect(nameCell).toContainText('John Black');
    });

    test.eachFramework('B valueSetter writes the edited number back to the data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const bCell = agIdFor.cell('0', '1');
        await bCell.dblclick();
        const editor = bCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('55');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(bCell).toContainText('55');
    });

    test.eachFramework('C.X valueSetter writes into the embedded object', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const cxCell = agIdFor.cell('0', '2');
        await cxCell.dblclick();
        const editor = cxCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('77');
        await page.keyboard.press('Enter');

        // The setter creates data.c if missing and stores x=77; the getter reads it back.
        await expect(editor).toHaveCount(0);
        await expect(cxCell).toContainText('77');
    });
});
