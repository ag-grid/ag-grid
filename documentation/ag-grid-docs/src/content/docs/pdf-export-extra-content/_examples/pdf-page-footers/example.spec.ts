import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports page, date, and time placeholders', async ({ page }) => {
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
        expect(pdfContent).toContain('(Page 1 of ');
        expect(pdfContent).not.toContain('&[Page]');
        expect(pdfContent).not.toContain('&[Pages]');
        expect(pdfContent).not.toContain('&[Date]');
        expect(pdfContent).not.toContain('&[Time]');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
