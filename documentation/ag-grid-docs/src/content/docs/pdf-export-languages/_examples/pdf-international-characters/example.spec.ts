import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports embedded Unicode fonts', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'text')).toContainText('praça');
        await expect(agIdFor.cell('3', 'text')).toContainText('広場');

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
        expect(pdfContent).toContain('/Subtype /Type0');
        expect(pdfContent).toContain('/FontFile2');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
