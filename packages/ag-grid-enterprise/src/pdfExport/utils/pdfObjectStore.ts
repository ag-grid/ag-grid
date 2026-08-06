import { encodeAsciiHex } from './bytes';
import type { ResolvedPageSize } from './document/layout';
import { encodePdfUnicodeString, escapePdfString, fmt } from './document/text';
import type { ResolvedPdfFont } from './fontRegistry';
import type { PdfImageResource } from './images/types';

/**
 * A clickable URI rectangle attached to one PDF page.
 */
export interface PdfLinkAnnotation {
    uri: string;
    rect: [left: number, bottom: number, right: number, top: number];
}

/**
 * Rendered content and annotations for one PDF page.
 */
export interface PdfPageContent {
    content: string;
    annotations: PdfLinkAnnotation[];
}

export interface PdfGraphicsState {
    key: string;
    opacity: number;
}

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
        // object bodies are ASCII-only (escapePdfString octal-escapes anything above 0x7e),
        // so string length equals byte length for xref offsets. This invariant is load-bearing.
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
 * @param pages - Per-page content streams and link annotations.
 * @param pageSize - Resolved page size in points.
 * @param fonts - Concrete font resources used by the document.
 * @param documentTitle - Optional metadata title.
 * @param language - Optional document language.
 * @param graphicsStates - Optional reusable transparency resources.
 * @param images - Image XObjects used by the document.
 * @returns Complete PDF document string.
 */
export function buildPdf(
    pages: PdfPageContent[],
    pageSize: ResolvedPageSize,
    fonts: ResolvedPdfFont[],
    documentTitle?: string,
    language?: string,
    graphicsStates: PdfGraphicsState[] = [],
    images: PdfImageResource[] = []
): string {
    const store = new PdfObjectStore();
    const fontResourcesParts: string[] = [];
    const graphicsStateResourceParts: string[] = [];
    const imageResourceParts: string[] = [];

    for (const font of fonts) {
        const fontId = font.trueType ? addTrueTypeFontResource(store, font) : addBuiltInFontResource(store, font);
        fontResourcesParts.push(`/${font.key} ${fontId} 0 R`);
    }

    for (const graphicsState of graphicsStates) {
        const opacity = Math.max(0, Math.min(graphicsState.opacity, 1));
        const graphicsStateId = store.add(`<< /Type /ExtGState /ca ${fmt(opacity)} /CA ${fmt(opacity)} /BM /Normal >>`);
        graphicsStateResourceParts.push(`/${graphicsState.key} ${graphicsStateId} 0 R`);
    }

    for (const image of images) {
        const imageId = addImageResource(store, image);
        imageResourceParts.push(`/${image.key} ${imageId} 0 R`);
    }

    const pagesId = store.reserve();
    const pageIds: number[] = [];
    const fontResources = `<< ${fontResourcesParts.join(' ')} >>`;
    const graphicsStateResources = graphicsStateResourceParts.length
        ? ` /ExtGState << ${graphicsStateResourceParts.join(' ')} >>`
        : '';
    const imageResources = imageResourceParts.length ? ` /XObject << ${imageResourceParts.join(' ')} >>` : '';

    for (const page of pages) {
        // each page has its own content stream object and page object.
        // content is ASCII-only, so string length equals the byte length required by /Length.
        const content = page.content;
        const contentStream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
        const contentId = store.add(contentStream);
        const annotationRefs: string[] = [];
        for (const annotation of page.annotations) {
            const [left, bottom, right, top] = annotation.rect;
            const rect = `${fmt(left)} ${fmt(bottom)} ${fmt(right)} ${fmt(top)}`;
            const uri = escapePdfString(encodePdfUri(annotation.uri));
            const annotationId = store.add(
                `<< /Type /Annot /Subtype /Link /Rect [${rect}] /Border [0 0 0] /A << /S /URI /URI (${uri}) >> >>`
            );
            annotationRefs.push(`${annotationId} 0 R`);
        }
        const annotations = annotationRefs.length ? ` /Annots [${annotationRefs.join(' ')}]` : '';
        const pageObject = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${fmt(pageSize.width)} ${fmt(pageSize.height)}] /Resources << /Font ${fontResources}${graphicsStateResources}${imageResources} >> /Contents ${contentId} 0 R${annotations} >>`;
        const pageId = store.add(pageObject);
        pageIds.push(pageId);
    }

    const pageKids: string[] = [];

    for (const pageId of pageIds) {
        pageKids.push(`${pageId} 0 R`);
    }

    store.set(pagesId, `<< /Type /Pages /Kids [${pageKids.join(' ')}] /Count ${pageIds.length} >>`);

    const documentLanguage = language?.trim();
    const languageEntry = documentLanguage ? ` /Lang (${escapePdfString(documentLanguage)})` : '';
    const catalogId = store.add(`<< /Type /Catalog /Pages ${pagesId} 0 R${languageEntry} >>`);

    const resolvedTitle = documentTitle?.trim() ?? '';
    const infoId = resolvedTitle.length
        ? store.add(`<< /Title ${encodePdfMetadataString(resolvedTitle)} >>`)
        : undefined;

    return store.build(catalogId, infoId);
}

function addImageResource(store: PdfObjectStore, image: PdfImageResource): number {
    let alphaId: number | undefined;
    if (image.alpha) {
        const encodedAlpha = encodeAsciiHex(image.alpha);
        alphaId = store.add(
            `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} ` +
                `/ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /ASCIIHexDecode ` +
                `/Length ${encodedAlpha.length} >>\nstream\n${encodedAlpha}\nendstream`
        );
    }

    const encodedImage = encodeAsciiHex(image.data);
    const filters = image.filter ? `/Filter [/ASCIIHexDecode /${image.filter}]` : '/Filter /ASCIIHexDecode';
    const softMask = alphaId ? ` /SMask ${alphaId} 0 R` : '';
    return store.add(
        `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} ` +
            `/ColorSpace /${image.colorSpace} /BitsPerComponent ${image.bitsPerComponent} ${filters}` +
            `${softMask} /Length ${encodedImage.length} >>\nstream\n${encodedImage}\nendstream`
    );
}

function encodePdfMetadataString(value: string): string {
    if (/^[\x20-\x7e]*$/.test(value)) {
        return `(${escapePdfString(value)})`;
    }

    return encodePdfUnicodeString(value);
}

function addBuiltInFontResource(store: PdfObjectStore, font: ResolvedPdfFont): number {
    const baseFont = font.builtInFamily ?? 'Helvetica';
    return store.add(`<< /Type /Font /Subtype /Type1 /BaseFont /${baseFont} /Encoding /WinAnsiEncoding >>`);
}

function addTrueTypeFontResource(store: PdfObjectStore, font: ResolvedPdfFont): number {
    const trueType = font.trueType!;
    const embeddedFontName = trueType.canSubset ? `AGGRID+${trueType.postScriptName}` : trueType.postScriptName;
    const subset = trueType.createSubset(Array.from(font.mappingByCid.values(), (mapping) => mapping.glyphId));
    const encodedFont = encodeAsciiHex(subset);
    const fontFileId = store.add(
        `<< /Length ${encodedFont.length} /Length1 ${subset.length} /Filter /ASCIIHexDecode >>\nstream\n${encodedFont}\nendstream`
    );
    const scale = 1000 / trueType.unitsPerEm;
    const bbox = trueType.bbox.map((value) => fmt(value * scale)).join(' ');
    const flags = font.style === 'normal' && !trueType.italicAngle ? 4 : 68;
    const descriptorId = store.add(
        `<< /Type /FontDescriptor /FontName /${embeddedFontName} /Flags ${flags} ` +
            `/FontBBox [${bbox}] /ItalicAngle ${fmt(trueType.italicAngle)} ` +
            `/Ascent ${fmt(trueType.ascent * scale)} /Descent ${fmt(trueType.descent * scale)} ` +
            `/CapHeight ${fmt(trueType.capHeight * scale)} /StemV 80 /FontWeight ${font.weight} ` +
            `/FontFile2 ${fontFileId} 0 R >>`
    );
    const widths = createCidWidths(font);
    const cidToGid = createCidToGidMap(font);
    const cidToGidId = store.add(
        `<< /Length ${cidToGid.length} /Filter /ASCIIHexDecode >>\nstream\n${cidToGid}\nendstream`
    );
    const descendantId = store.add(
        `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${embeddedFontName} ` +
            `/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> ` +
            `/FontDescriptor ${descriptorId} 0 R /DW 1000${widths ? ` /W [${widths}]` : ''} ` +
            `/CIDToGIDMap ${cidToGidId} 0 R >>`
    );
    const toUnicode = createToUnicodeCMap(font);
    const toUnicodeId = store.add(`<< /Length ${toUnicode.length} >>\nstream\n${toUnicode}\nendstream`);
    return store.add(
        `<< /Type /Font /Subtype /Type0 /BaseFont /${embeddedFontName} /Encoding /Identity-H ` +
            `/DescendantFonts [${descendantId} 0 R] /ToUnicode ${toUnicodeId} 0 R >>`
    );
}

function createCidWidths(font: ResolvedPdfFont): string {
    const trueType = font.trueType!;
    const mappings = Array.from(font.mappingByCid.entries()).sort(([left], [right]) => left - right);
    const parts: string[] = [];
    const scale = 1000 / trueType.unitsPerEm;

    for (const [cid, mapping] of mappings) {
        parts.push(`${cid} [${fmt(trueType.getAdvanceWidth(mapping.glyphId) * scale)}]`);
    }
    return parts.join(' ');
}

function createToUnicodeCMap(font: ResolvedPdfFont): string {
    const mappings: string[] = [];
    for (const [cid, mapping] of font.mappingByCid) {
        if (!mapping.unicode) {
            continue;
        }
        mappings.push(`<${toHex(cid, 4)}> ${encodePdfUnicodeString(mapping.unicode, false)}`);
    }

    const parts = [
        '/CIDInit /ProcSet findresource begin',
        '12 dict begin',
        'begincmap',
        '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
        '/CMapName /Adobe-Identity-UCS def',
        '/CMapType 2 def',
        '1 begincodespacerange',
        '<0000> <FFFF>',
        'endcodespacerange',
    ];

    for (let start = 0; start < mappings.length; start += 100) {
        const chunk = mappings.slice(start, start + 100);
        parts.push(`${chunk.length} beginbfchar`, ...chunk, 'endbfchar');
    }
    parts.push('endcmap', 'CMapName currentdict /CMap defineresource pop', 'end', 'end');
    return parts.join('\n');
}

function createCidToGidMap(font: ResolvedPdfFont): string {
    const maximumCid = font.mappingByCid.size;
    const bytes = new Uint8Array((maximumCid + 1) * 2);
    const view = new DataView(bytes.buffer);
    for (const [cid, mapping] of font.mappingByCid) {
        view.setUint16(cid * 2, mapping.glyphId, false);
    }
    return encodeAsciiHex(bytes);
}

function toHex(value: number, length: number): string {
    return value.toString(16).toUpperCase().padStart(length, '0');
}

/**
 * Encode URI characters while preserving valid percent escapes supplied by the user.
 * @param uri - User-provided URI.
 * @returns An ASCII URI suitable for a PDF URI action.
 */
function encodePdfUri(uri: string): string {
    const encodedUri = encodeURI(replaceUnpairedSurrogates(uri));
    return encodedUri.replace(/%25([0-9a-f]{2})/gi, '%$1');
}

/**
 * Replace unpaired UTF-16 surrogates so URI encoding cannot throw.
 * @param value - Source string that may contain malformed UTF-16.
 * @returns A well-formed string with malformed code units replaced.
 */
function replaceUnpairedSurrogates(value: string): string {
    let result = '';

    for (let i = 0; i < value.length; i++) {
        const codeUnit = value.charCodeAt(i);

        if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
            const nextCodeUnit = value.charCodeAt(i + 1);
            if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
                result += value[i] + value[i + 1];
                i++;
            } else {
                result += '\ufffd';
            }
        } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
            result += '\ufffd';
        } else {
            result += value[i];
        }
    }

    return result;
}
