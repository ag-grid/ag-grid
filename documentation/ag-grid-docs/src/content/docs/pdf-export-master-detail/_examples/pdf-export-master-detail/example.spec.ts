import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports detail records while detail grids are collapsed', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'name')).toContainText('Nora Thomas');
        await expect(page.locator('.ag-details-row')).toHaveCount(0);

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
        expect(pdfContent).toContain('(Calls for Nora Thomas) Tj');
        expect(pdfContent).toContain('(Call ID) Tj');
        expect(pdfContent).toContain('(555) Tj');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
