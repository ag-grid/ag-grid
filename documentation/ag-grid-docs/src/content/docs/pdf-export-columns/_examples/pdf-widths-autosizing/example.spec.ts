import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports configured column widths', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await page.locator('#widthMode').selectOption('custom');

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
        expect(pdfContent).toContain('(Mechanical Keyboard) Tj');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
