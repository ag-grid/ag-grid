import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports a text watermark on every page', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export PDF' }).click(),
        ]);
        const downloadPath = await download.path();
        expect(downloadPath).toBeTruthy();
        if (!downloadPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const pdfContent = await readFile(downloadPath, 'latin1');
        const pageCount = pdfContent.split('/Type /Page /Parent').length - 1;

        expect(pdfContent.startsWith('%PDF-1.4')).toBe(true);
        expect(pageCount).toBeGreaterThan(1);
        expect(pdfContent.split('(DRAFT) Tj').length - 1).toBe(pageCount);
        expect(pdfContent).toContain('/Type /ExtGState /ca 0.12 /CA 0.12 /BM /Normal');
        expect(pdfContent).toContain('/Artifact BMC');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
