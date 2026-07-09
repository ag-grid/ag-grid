import type { PdfFontFamily } from 'ag-grid-community';

import type { ResolvedPageSize } from './document/layout';
import { escapePdfString, fmt, normaliseText } from './document/text';
import { normalisePdfFontFamily } from './fonts';

/**
 * Mutable store for PDF indirect objects.
 * Handles object id allocation and final cross-reference generation.
 */
class PdfObjectStore {
    private readonly objects: string[] = [];

    /**
     * Reserve an object id for content that will be written later.
     * @returns Reserved object id.
     */
    public reserve(): number {
        this.objects.push('');
        return this.objects.length;
    }

    /**
     * Append an object body and return its id.
     * @param content - Raw object content.
     * @returns Assigned object id.
     */
    public add(content: string): number {
        this.objects.push(content);
        return this.objects.length;
    }

    /**
     * Replace content for a previously reserved object id.
     * @param id - Object id (1-based).
     * @param content - Raw object content.
     */
    public set(id: number, content: string): void {
        this.objects[id - 1] = content;
    }

    /**
     * Build the final PDF file text including xref and trailer sections.
     * @param rootId - Catalog object id.
     * @param infoId - Optional info dictionary object id.
     * @returns Complete PDF document string.
     */
    public build(rootId: number, infoId?: number): string {
        let body = '%PDF-1.4\n';
        const offsets: number[] = [0];
        const objects = this.objects;

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const objectId = i + 1;
            offsets[objectId] = body.length;
            body += `${objectId} 0 obj\n${object}\nendobj\n`;
        }

        const xrefOffset = body.length;
        body += `xref\n0 ${objects.length + 1}\n`;
        body += '0000000000 65535 f \n';

        for (let i = 1; i <= objects.length; i++) {
            body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
        }

        const trailerParts = [`/Size ${objects.length + 1}`, `/Root ${rootId} 0 R`];
        if (infoId) {
            trailerParts.push(`/Info ${infoId} 0 R`);
        }

        body += `trailer\n<< ${trailerParts.join(' ')} >>\n`;
        body += `startxref\n${xrefOffset}\n%%EOF`;

        return body;
    }
}

/**
 * Build a complete PDF document from rendered page content.
 * @param pages - Per-page content stream payloads.
 * @param pageSize - Resolved page size in points.
 * @param fontKeyByFamily - Map of fonts used by the document.
 * @param documentTitle - Optional metadata title.
 * @returns Complete PDF document string.
 */
export function buildPdf(
    pages: string[],
    pageSize: ResolvedPageSize,
    fontKeyByFamily: Map<PdfFontFamily, string>,
    documentTitle?: string
): string {
    const store = new PdfObjectStore();
    const fontResourcesParts: string[] = [];

    fontKeyByFamily.forEach((fontKey, fontFamily) => {
        const baseFont = normalisePdfFontFamily(fontFamily);
        const fontId = store.add(`<< /Type /Font /Subtype /Type1 /BaseFont /${baseFont} /Encoding /WinAnsiEncoding >>`);
        fontResourcesParts.push(`/${fontKey} ${fontId} 0 R`);
    });

    const pagesId = store.reserve();
    const pageIds: number[] = [];
    const fontResources = `<< ${fontResourcesParts.join(' ')} >>`;

    for (const content of pages) {
        // each page has its own content stream object and page object.
        const contentStream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
        const contentId = store.add(contentStream);
        const pageObject = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${fmt(pageSize.width)} ${fmt(pageSize.height)}] /Resources << /Font ${fontResources} >> /Contents ${contentId} 0 R >>`;
        const pageId = store.add(pageObject);
        pageIds.push(pageId);
    }

    const pageKids: string[] = [];

    for (const pageId of pageIds) {
        pageKids.push(`${pageId} 0 R`);
    }

    store.set(pagesId, `<< /Type /Pages /Kids [${pageKids.join(' ')}] /Count ${pageIds.length} >>`);

    const catalogId = store.add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

    const resolvedTitle = documentTitle ? normaliseText(documentTitle) : '';
    const infoId = resolvedTitle?.trim().length
        ? store.add(`<< /Title (${escapePdfString(resolvedTitle)}) >>`)
        : undefined;

    return store.build(catalogId, infoId);
}
