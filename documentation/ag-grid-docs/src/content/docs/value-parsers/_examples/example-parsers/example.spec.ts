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

    test.eachFramework(
        'the parsed column stores a number where the bad column stores a string',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const editCell = async (colId: string, value: string) => {
                const cell = agIdFor.cell('0', colId);
                await cell.dblclick();
                const editor = cell.locator('input');
                await expect(editor).toBeVisible();
                await editor.fill(value);
                await page.keyboard.press('Enter');
                await expect(editor).toHaveCount(0);
                return cell;
            };

            // Docs: 'Bad Number' is bad because the edited value is stored as a string, so the typed
            // text survives verbatim - leading zeros included.
            await expect(await editCell('numberBad', '007')).toHaveText('007');

            // Docs: 'Good Number' is good because the value parser converts the string to a number,
            // so the same input renders as 7.
            await expect(await editCell('numberGood', '007')).toHaveText('7');
        }
    );

    test.eachFramework('an edit prints the updated row data to the console', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Docs: 'After any edit, the console prints the new data for that row.'
        const logs: string[] = [];
        page.on('console', (m) => logs.push(m.text()));

        const cell = agIdFor.cell('0', 'simple');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('Moon');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        await expect.poll(() => logs.some((l) => l.includes('data after changes is'))).toBe(true);
    });
});
