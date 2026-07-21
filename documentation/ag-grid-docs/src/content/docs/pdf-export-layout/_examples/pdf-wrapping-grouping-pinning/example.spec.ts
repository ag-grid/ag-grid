import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports wrapped, pinned and grouped rows', async ({ page }) => {
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
        expect(pdfContent).toContain('(Approved Portfolio) Tj');
        expect(pdfContent).toContain('(Contingency) Tj');
        expect(pdfContent).toContain('(Improve column workflows.) Tj');
        expect(pdfContent).toContain('(Add keyboard controls.) Tj');
        expect(pdfContent).not.toContain(' -> ');
    });
});
