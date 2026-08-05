import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

test.agExample(import.meta, () => {
    test.eachFramework('exports images and text in grid cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const countryCell = agIdFor.cell('0', 'country');
        await expect(countryCell).toContainText('United Kingdom');
        const flag = countryCell.locator('img');
        await expect(flag).toBeVisible();
        await expect(flag).toHaveJSProperty('complete', true);
        expect(await flag.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

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
        expect(pdfContent.startsWith('%PDF-1.4')).toBe(true);
        expect(pdfContent).toContain('/Subtype /Image');
        expect(pdfContent).toContain('/XObject << /Im1');
        expect(pdfContent).toContain('/Im1 Do');
        expect(pdfContent).toContain('(United Kingdom)');
        expect(pdfContent.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
