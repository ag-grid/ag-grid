import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('applies the export callbacks to cells, groups and headers', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

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
        expect(pdfContent).toContain('(Region: EMEA) Tj');
        expect(pdfContent).toContain('(CUSTOMER) Tj');
        expect(pdfContent).toContain('(Customer Details \\(grouped\\)) Tj');
        // only the single missing order total is labelled, not every blank cell on the group rows
        expect(pdfContent.split('(Not invoiced) Tj')).toHaveLength(2);
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
