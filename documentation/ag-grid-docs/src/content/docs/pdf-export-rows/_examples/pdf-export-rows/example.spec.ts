import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports the selected rows and applies pinned-row options', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await page.locator('#onlySelected').check();

        const [selectedRowsDownload] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export to PDF' }).click(),
        ]);
        const selectedRowsPath = await selectedRowsDownload.path();

        expect(selectedRowsPath).toBeTruthy();
        if (!selectedRowsPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const selectedRowsPdf = await readFile(selectedRowsPath, 'latin1');
        expect(selectedRowsPdf.startsWith('%PDF-1.4')).toBe(true);
        expect(selectedRowsPdf).toContain('(Asha Patel) Tj');
        expect(selectedRowsPdf).toContain('(Sofia Rossi) Tj');
        expect(selectedRowsPdf).not.toContain('(Marc Dubois) Tj');

        await page.locator('#onlySelected').uncheck();
        await page.locator('#skipPinnedTop').check();

        const [pinnedRowsDownload] = await Promise.all([
            page.waitForEvent('download'),
            page.getByRole('button', { name: 'Export to PDF' }).click(),
        ]);
        const pinnedRowsPath = await pinnedRowsDownload.path();

        expect(pinnedRowsPath).toBeTruthy();
        if (!pinnedRowsPath) {
            throw new Error('Expected PDF export to create a downloadable file.');
        }

        const pinnedRowsPdf = await readFile(pinnedRowsPath, 'latin1');
        expect(pinnedRowsPdf).not.toContain('(Quarterly Plan) Tj');
        expect(pinnedRowsPdf).toContain('(Project Total) Tj');
        expect(pinnedRowsPdf.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
