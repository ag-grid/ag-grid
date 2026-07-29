import type { PdfExportParams, PdfWatermarkPageSelection } from 'ag-grid-community';

import type { PdfFontRegistry, ResolvedPdfFont } from '../fontRegistry';
import type { PdfRgb, PdfStyleColors } from '../pdfColor';
import { resolveOptionalColor } from '../pdfColor';
import type { PdfGraphicsState } from '../pdfObjectStore';
import type { ResolvedPageSize } from './layout';
import { resolveFiniteNumber } from './numbers';

const DEFAULT_WATERMARK_OPACITY = 0.12;
const DEFAULT_WATERMARK_ROTATION = -45;
const DEFAULT_WATERMARK_COLOR: PdfRgb = { r: 128, g: 128, b: 128 };
const WATERMARK_GRAPHICS_STATE_KEY = 'GSWatermark';

export type ResolvedPdfWatermark = {
    text: string;
    opacity: number;
    rotation: number;
    pages: PdfWatermarkPageSelection;
    fontSize: number;
    lineHeight: number;
    font: ResolvedPdfFont;
    direction: NonNullable<PdfExportParams['direction']>;
    language?: string;
    color: PdfRgb;
    graphicsState?: PdfGraphicsState;
};

/**
 * Resolve a watermark into rendering-ready values.
 * @param params - PDF export parameters.
 * @param pageSize - Resolved PDF page size.
 * @param styleColors - Resolved PDF colours.
 * @param bodyFont - Default document font.
 * @param fontRegistry - Font registry used by the document.
 * @returns Resolved watermark, or `undefined` when no visible text is configured.
 */
export function resolveWatermark(
    params: PdfExportParams,
    pageSize: ResolvedPageSize,
    styleColors: PdfStyleColors,
    bodyFont: ResolvedPdfFont,
    fontRegistry: PdfFontRegistry
): ResolvedPdfWatermark | undefined {
    const watermark = params.watermark;
    const text = watermark?.text.trim() ?? '';
    const opacity = Math.max(0, Math.min(resolveFiniteNumber(watermark?.opacity, DEFAULT_WATERMARK_OPACITY), 1));
    if (!text || opacity <= 0) {
        return undefined;
    }

    const style = watermark?.style;
    const defaultFontSize = Math.min(pageSize.width, pageSize.height) / 6;
    const fontSize = resolveFiniteNumber(style?.fontSize, defaultFontSize, Number.EPSILON);
    const font = fontRegistry.resolve(
        style?.fontFamily,
        style?.fontWeight ?? 700,
        style?.fontStyle ?? bodyFont.style,
        bodyFont.family
    );
    const lineHeight = resolveFiniteNumber(
        style?.lineHeight,
        fontRegistry.getNaturalLineHeight(fontSize, font),
        Number.EPSILON
    );
    const blendWith = styleColors.pageBackground ?? styleColors.dataBackground;

    return {
        text,
        opacity,
        rotation: resolveFiniteNumber(watermark?.rotation, DEFAULT_WATERMARK_ROTATION),
        pages: watermark?.pages ?? 'all',
        fontSize,
        lineHeight,
        font,
        direction: style?.direction ?? params.direction ?? 'auto',
        language: style?.language ?? params.language,
        color: resolveOptionalColor(style?.color, DEFAULT_WATERMARK_COLOR, blendWith) ?? DEFAULT_WATERMARK_COLOR,
        graphicsState:
            opacity < 1
                ? {
                      key: WATERMARK_GRAPHICS_STATE_KEY,
                      opacity,
                  }
                : undefined,
    };
}

/**
 * Check whether a watermark applies to a page.
 * @param watermark - Resolved watermark.
 * @param pageNumber - One-based page number.
 * @returns Whether the watermark should be rendered.
 */
export function shouldRenderWatermark(watermark: ResolvedPdfWatermark, pageNumber: number): boolean {
    if (watermark.pages === 'first') {
        return pageNumber === 1;
    }
    if (watermark.pages === 'odd') {
        return pageNumber % 2 === 1;
    }
    if (watermark.pages === 'even') {
        return pageNumber % 2 === 0;
    }
    return true;
}
