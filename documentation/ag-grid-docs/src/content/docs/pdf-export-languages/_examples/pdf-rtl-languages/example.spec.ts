import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports right-to-left text with embedded fonts', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'text')).toContainText('أحمد');
        await expect(agIdFor.cell('2', 'text')).toContainText('דוד');

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export to PDF' }).click(),
        ]);
        const downloadPath = await download.path();
        if (!downloadPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const pdfContent = await readFile(downloadPath, 'latin1');
        expect(pdfContent.startsWith('%PDF-1.4')).toBe(true);
        expect(pdfContent).toContain('/BaseFont /Helvetica-Bold');
        expect(pdfContent).toContain('/Encoding /Identity-H');
        expect(pdfContent).toContain('/ToUnicode');
        const boldHeaderPosition = pdfContent.indexOf('(Text Bold) Tj');
        const textHeaderPosition = pdfContent.indexOf('(Text) Tj');
        const languageHeaderPosition = pdfContent.indexOf('(Language) Tj');
        expect(boldHeaderPosition).toBeGreaterThan(-1);
        expect(boldHeaderPosition).toBeLessThan(textHeaderPosition);
        expect(textHeaderPosition).toBeLessThan(languageHeaderPosition);
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
