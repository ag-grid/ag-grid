import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('customises exported headers and group headers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell-label', { hasText: 'Athlete Details' })).toBeVisible();
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete');

        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export to PDF' }).click(),
        ]);
        const downloadPath = await download.path();
        if (!downloadPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const pdfContent = await readFile(downloadPath, 'latin1');
        expect(pdfContent).toContain('(group header: Athlete Details) Tj');
        expect(pdfContent).toContain('(header: Athlete) Tj');
        expect(pdfContent).toContain('(header: Gold) Tj');
    });
});
