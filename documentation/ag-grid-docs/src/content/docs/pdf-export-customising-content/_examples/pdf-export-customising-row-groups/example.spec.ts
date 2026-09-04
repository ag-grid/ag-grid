import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('customises exported cells and row groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupCell('row-group-country-United Kingdom')).toContainText('United Kingdom');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Asha Patel');

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export to PDF' }).click(),
        ]);
        const downloadPath = await download.path();
        if (!downloadPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const pdfContent = await readFile(downloadPath, 'latin1');
        expect(pdfContent).toContain('(row group: United Kingdom) Tj');
        expect(pdfContent).toContain('(_Asha Patel_) Tj');
        expect(pdfContent).toContain('(_2_) Tj');
    });
});
