import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports headings on a separate cover page', async ({ page }) => {
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
        expect(pdfContent.split('/Type /Page /Parent').length - 1).toBe(2);
        expect(pdfContent).toContain('(Annual Performance Report) Tj');
        expect(pdfContent).toContain('(Financial year 2026) Tj');
        expect(pdfContent).toContain('(Confidential) Tj');
        expect(pdfContent).toContain('(Page 2 of 2) Tj');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
