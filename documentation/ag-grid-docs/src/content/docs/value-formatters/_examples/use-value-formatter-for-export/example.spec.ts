import { dragFillHandleOverTo, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    // fields 'a' and 'b'. Formatter: '£' + value (no digit grouping). Parser strips a leading '£'.
    // a = Math.floor(((i + 2) * 173456) % 10000): row 0 -> 6912, row 1 -> 368.
    // b = Math.floor(((i + 7) * 373456) % 10000): row 0 -> 4192.

    test.eachFramework('valueFormatter renders values with a pound prefix', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'a')).toContainText('£6912');
        await expect(agIdFor.cell('0', 'b')).toContainText('£4192');
        await expect(agIdFor.cell('1', 'a')).toContainText('£368');
    });

    test.eachFramework('editing round-trips through the parser and formatter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'a');
        await cell.dblclick();
        const editor = cell.locator('input');
        await expect(editor).toBeVisible();
        // Type with the pound sign; the parser strips it and stores the number 999.
        await editor.fill('£999');
        await page.keyboard.press('Enter');

        await expect(editor).toHaveCount(0);
        await expect(cell).toContainText('£999');
    });

    test.eachFramework('fill handle uses the formatter for export and parser for import', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const source = agIdFor.cell('0', 'a'); // £6912
        const target = agIdFor.cell('1', 'a');

        await source.click();
        await dragFillHandleOverTo(agIdFor.fillHandle(), target);

        // The source value is exported via the formatter and re-imported via the parser,
        // so the filled cell displays the same formatted value.
        await expect(target).toContainText('£6912');
    });

    test.eachFramework('PDF export uses the value formatter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.cell('0', 'a').click({ button: 'right' });
        await page.locator('.ag-menu-option-text', { hasText: 'Export' }).hover();

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('.ag-menu-option-text', { hasText: 'PDF Export' }).click(),
        ]);
        const downloadPath = await download.path();
        if (!downloadPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const pdfContent = await readFile(downloadPath, 'latin1');
        expect(pdfContent).toContain('(\\2436912) Tj');
    });
});
