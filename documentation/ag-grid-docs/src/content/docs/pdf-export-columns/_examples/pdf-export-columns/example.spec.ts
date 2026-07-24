import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports hidden columns and applies header options', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await page.locator('#columnSet').selectOption('all');
        await page.locator('#skipColumnGroupHeaders').check();

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export to PDF' }).click(),
        ]);
        const downloadPath = await download.path();

        expect(downloadPath).toBeTruthy();
        if (!downloadPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const pdfContent = await readFile(downloadPath, 'latin1');
        expect(pdfContent.startsWith('%PDF-1.4')).toBe(true);
        expect(pdfContent).toContain('(Internal Reference) Tj');
        expect(pdfContent).toContain('(Priority account) Tj');
        expect(pdfContent).not.toContain('(Customer Details) Tj');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
