import { dragFillHandleOverTo, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // fields 'a' and 'b'. Formatter: '£' + value. Parser strips a leading '£' then parseFloat.
    // a = Math.floor(((i + 2) * 173456) % 10000): row 0 -> 6912, row 1 -> 368.

    test.eachFramework('valueFormatter renders values with a pound prefix', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'a')).toContainText('£6912');
        await expect(agIdFor.cell('1', 'a')).toContainText('£368');
    });

    test.eachFramework('editing parses a formatted string back into a number', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'a');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('£1500');
        await page.keyboard.press('Enter');

        // The parser strips '£' and stores 1500; the formatter renders it back with the prefix.
        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('£1500');
    });

    test.eachFramework('fill handle imports the value via the parser', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const source = agIdFor.cell('0', 'a'); // £6912
        const target = agIdFor.cell('1', 'a');

        await source.click();
        await dragFillHandleOverTo(agIdFor.fillHandle(), target);

        // The formatted source is re-imported through the parser, so the target matches the source.
        await expect(target).toContainText('£6912');
    });

    test.eachFramework('column B is formatted and parsed the same way', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // b = Math.floor(((i + 7) * 373456) % 10000): row 0 -> 4192.
        const cell = agIdFor.cell('0', 'b');
        await expect(cell).toContainText('£4192');

        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('£25');
        await page.keyboard.press('Enter');

        // The parser strips '£' and stores 25; the formatter renders it back with the prefix.
        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('£25');
    });

    test.eachFramework('clearing a cell parses to null and renders empty', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'a');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('');
        await page.keyboard.press('Enter');

        // currencyParser returns null for an empty string, and currencyFormatter renders null as ''.
        await expect(editor).toHaveCount(0);
        await expect(cell).toHaveText('');
    });

    test.eachFramework('copy range down imports the value via the parser', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const source = agIdFor.cell('0', 'a'); // £6912
        const target = agIdFor.cell('1', 'a');

        // Select a two-row range, then Ctrl/Cmd+D copies the top row down over it.
        await source.click();
        await target.click({ modifiers: ['Shift'] });
        await page.keyboard.press('ControlOrMeta+d');

        // Docs: useValueParserForImport applies to Copy Range Down, so the formatted source value
        // is re-imported through the parser and the target matches the source.
        await expect(target).toContainText('£6912');
    });
});
