import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports the configured page and repeats table headers', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await page.locator('#pageSize').selectOption('custom');

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
        const itemHeaderCount = pdfContent.split('(Item) Tj').length - 1;

        expect(pdfContent.startsWith('%PDF-1.4')).toBe(true);
        expect(pdfContent).toContain('(Quarterly Inventory) Tj');
        expect(pdfContent).toContain('(Item 40) Tj');
        expect(itemHeaderCount).toBeGreaterThan(1);
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
