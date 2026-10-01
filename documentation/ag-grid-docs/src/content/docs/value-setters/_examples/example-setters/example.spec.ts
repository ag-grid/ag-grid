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

    test.eachFramework('A uses field for both getting and setting the value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Docs: 'Column A uses field for both getting and setting the value.'
        // The starting value is randomised, so only the post-edit value is asserted.
        const aCell = agIdFor.cell('0', 'a');
        await aCell.dblclick();
        const editor = aCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('33');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(aCell).toContainText('33');
    });

    test.eachFramework('C.Y valueSetter writes into the embedded object', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Docs: 'Column C.X and C.Y use valueGetter to get the value from an embedded object.
        // They then use valueSetter to set the value into the embedded object.'
        const cyCell = agIdFor.cell('0', '3');
        await cyCell.dblclick();
        const editor = cyCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('88');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(cyCell).toContainText('88');
    });

    test.eachFramework('a valueSetter returning false leaves the row unchanged', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Docs: 'A value setter should return true if the value was updated successfully and false
        // if the value was not updated (including if the value was not changed).' The example logs
        // the row data on cellValueChanged, which the grid only fires when the setter returns true.
        const logs: string[] = [];
        page.on('console', (m) => logs.push(m.text()));

        const nameCell = agIdFor.cell('0', '0');
        const editName = async (value: string) => {
            await nameCell.dblclick();
            const editor = nameCell.locator('input');
            await expect(editor).toBeVisible();
            await editor.fill(value);
            await page.keyboard.press('Enter');
            await expect(editor).toHaveCount(0);
        };

        // Re-entering the existing name: the setter finds nothing changed and returns false.
        await editName('Niall Pink');
        await expect(nameCell).toContainText('Niall Pink');
        expect(logs.some((l) => l.includes('Data after change is'))).toBe(false);

        // A genuinely different name makes the setter return true, so the change is reported.
        await editName('John Black');
        await expect(nameCell).toContainText('John Black');
        await expect.poll(() => logs.some((l) => l.includes('Data after change is'))).toBe(true);
    });
});
