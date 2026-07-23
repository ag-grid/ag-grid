import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports grid and custom-content hyperlinks', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'company')).toContainText('Google');
        await expect(agIdFor.cell('0', 'url')).toContainText('https://www.google.com');

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
        expect(pdfContent).toContain('/Subtype /Link');
        expect(pdfContent).toContain('/URI (https://www.google.com)');
        expect(pdfContent).toContain('/URI (https://www.ag-grid.com/documentation/)');
        expect(pdfContent).toContain('/Annots [');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
