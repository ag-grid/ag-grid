import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

const PAGE_OBJECT = '/Type /Page /Parent';

function countOccurrences(pdfContent: string, text: string): number {
    return pdfContent.split(text).length - 1;
}

/** X origin of the first header cell rectangle, which sits on the page's left margin. */
function leftMargin(pdfContent: string): number {
    const label = pdfContent.indexOf('(Item) Tj');
    if (label < 0) {
        throw new Error('No header cell found.');
    }
    const cells = [...pdfContent.matchAll(/([\d.]+) [\d.]+ [\d.]+ [\d.]+ re f/g)];
    // The header cell rectangle is the last one drawn before its label.
    const cell = cells.filter((match) => match.index < label).pop();
    return Number(cell![1]);
}

test.agExample(import.meta, () => {
    test.eachFramework('exports the configured page and repeats table headers', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        async function exportWithPageSetup(
            pageSize: string,
            orientation: string,
            margin: string,
            repeatHeader: boolean
        ): Promise<string> {
            await page.locator('#pageSize').selectOption(pageSize);
            await page.locator('#orientation').selectOption(orientation);
            await page.locator('#margin').selectOption(margin);
            await page.locator('#repeatHeader').setChecked(repeatHeader);

            const [download] = await Promise.all([
                page.waitForEvent('download'),
                page.getByRole('button', { name: 'Export to PDF' }).click(),
            ]);
            const downloadPath = await download.path();
            if (!downloadPath) {
                throw new Error(`Expected the ${pageSize} export to create a downloadable file.`);
            }
            return readFile(downloadPath, 'latin1');
        }

        const a4Pdf = await exportWithPageSetup('A4', 'landscape', 'standard', true);
        expect(a4Pdf.startsWith('%PDF-1.4')).toBe(true);
        expect(a4Pdf).toContain('(Quarterly Inventory) Tj');
        expect(a4Pdf).toContain('(Item 40) Tj');
        expect(a4Pdf).toContain('/MediaBox [0 0 841.89 595.28]');
        expect(leftMargin(a4Pdf)).toBe(36);
        // repeatHeader draws the table header once per page.
        expect(countOccurrences(a4Pdf, '(Item) Tj')).toBe(countOccurrences(a4Pdf, PAGE_OBJECT));

        // Letter, rotated to portrait, with wide margins.
        const letterPdf = await exportWithPageSetup('Letter', 'portrait', 'wide', true);
        expect(letterPdf).toContain('/MediaBox [0 0 612 792]');
        expect(leftMargin(letterPdf)).toBe(54);

        // A custom page size also honours the portrait orientation, so 420x300 is emitted rotated.
        const customPdf = await exportWithPageSetup('custom', 'portrait', 'compact', false);
        expect(customPdf).toContain('/MediaBox [0 0 300 420]');
        expect(leftMargin(customPdf)).toBe(18);
        // The smaller page needs more sheets, but the header is no longer repeated on each one.
        expect(countOccurrences(customPdf, PAGE_OBJECT)).toBeGreaterThan(countOccurrences(a4Pdf, PAGE_OBJECT));
        expect(countOccurrences(customPdf, '(Item) Tj')).toBe(1);
        expect(customPdf.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
