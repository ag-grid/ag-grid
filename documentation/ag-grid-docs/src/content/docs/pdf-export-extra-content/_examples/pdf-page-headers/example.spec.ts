import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports first-page and subsequent-page headers', async ({ page }) => {
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
        expect(pdfContent).toContain('(Confidential Report) Tj');
        expect(pdfContent).toContain('(Quarterly Results) Tj');
        expect(pdfContent.split('/Type /Page /Parent').length - 1).toBeGreaterThan(1);
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
