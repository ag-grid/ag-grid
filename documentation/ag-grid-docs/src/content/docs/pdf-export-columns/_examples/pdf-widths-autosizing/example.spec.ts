import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';
import { readFile } from 'node:fs/promises';

/** Width of the header cell rectangle drawn immediately before the given header label. */
function headerWidth(pdfContent: string, headerText: string): number {
    const cells = [...pdfContent.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) [\d.]+ re f/g)];
    const label = pdfContent.indexOf(`(${headerText}) Tj`);
    if (label < 0) {
        throw new Error(`No header cell found for "${headerText}".`);
    }
    // The cell rectangle is the last one drawn before its label.
    const cell = cells.filter((match) => match.index < label).pop();
    return Number(cell![3]);
}

function headerWidths(pdfContent: string): number[] {
    return ['Sku', 'Product', 'Description', 'Units', 'Unit Price'].map((header) => headerWidth(pdfContent, header));
}

test.agExample(import.meta, () => {
    test.eachFramework('exports configured column widths', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        async function exportWithWidthMode(widthMode: string): Promise<string> {
            await page.locator('#widthMode').selectOption(widthMode);
            const [download] = await Promise.all([
                page.waitForEvent('download'),
                page.getByRole('button', { name: 'Export to PDF' }).click(),
            ]);
            const downloadPath = await download.path();
            if (!downloadPath) {
                throw new Error(`Expected the ${widthMode} export to create a downloadable file.`);
            }
            return readFile(downloadPath, 'latin1');
        }

        // A4 landscape less the default 36pt margins.
        const printableWidth = 841.89 - 72;

        const autoPdf = await exportWithWidthMode('auto');
        expect(autoPdf.startsWith('%PDF-1.4')).toBe(true);
        expect(autoPdf).toContain('(Mechanical Keyboard) Tj');
        // Auto sizes each column to its content, so the long description is not truncated...
        expect(autoPdf).toContain(
            '(Low-profile wireless keyboard with hot-swappable switches and multi-device pairing.) Tj'
        );
        expect(headerWidth(autoPdf, 'Description')).toBeGreaterThan(300);
        // ...and the table only takes the width it needs.
        const autoTotal = headerWidths(autoPdf).reduce((total, width) => total + width, 0);
        expect(autoTotal).toBeLessThan(printableWidth);

        // Grid widths are scaled to fill the page, matching the on-screen proportions.
        const gridPdf = await exportWithWidthMode('grid');
        const gridWidths = headerWidths(gridPdf);
        const gridTotal = gridWidths.reduce((total, width) => total + width, 0);
        expect(gridTotal).toBeGreaterThan(printableWidth - 60);
        expect(gridWidths).not.toEqual(headerWidths(autoPdf));

        // Per-column widths come from the columnWidth callback; unlisted columns still auto-size.
        const customPdf = await exportWithWidthMode('custom');
        expect(headerWidth(customPdf, 'Sku')).toBe(70);
        expect(headerWidth(customPdf, 'Description')).toBe(220);
        expect(headerWidth(customPdf, 'Units')).toBe(70);
        expect(headerWidth(customPdf, 'Product')).toBe(headerWidth(autoPdf, 'Product'));
        expect(customPdf.trimEnd().endsWith('%%EOF')).toBe(true);
    });
});
