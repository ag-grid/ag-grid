import type {
    PdfExportParams,
    PdfHeaderFooter,
    PdfHeaderFooterConfig,
    PdfHeaderFooterContent,
} from 'ag-grid-community';

import type { PdfFontRegistry, ResolvedPdfFont } from '../fontRegistry';
import type { PdfImageRegistry } from '../imageRegistry';
import type { ResolvedPdfImage } from '../images/types';
import type { PdfStyleColors } from '../pdfColor';
import { resolveOptionalColor } from '../pdfColor';
import type { ResolvedCellStyle } from './measurement';
import { resolveFiniteNumber } from './numbers';

const PAGE_FURNITURE_PADDING = 4;
const DEFAULT_PAGE_TEXT_SIZE = 9;

export type PdfHeaderFooterPosition = 'Left' | 'Center' | 'Right';

export type ResolvedPageFurnitureContent = {
    value: string;
    position: PdfHeaderFooterPosition;
    style: ResolvedCellStyle;
    image?: ResolvedPdfImage;
};

export type ResolvedPageFurniture = {
    header: ResolvedPageFurnitureContent[];
    footer: ResolvedPageFurnitureContent[];
    headerHeight: number;
    footerHeight: number;
};

type ResolvedPageFurnitureConfig = {
    all?: ResolvedPageFurniture;
    first?: ResolvedPageFurniture;
    even?: ResolvedPageFurniture;
};

export type PdfPagePlaceholderValues = {
    pageNumber: number;
    totalPages: number;
    date: string;
    time: string;
};

/**
 * Resolve page header and footer rules before pagination.
 * @param config - Header and footer configuration.
 * @param params - PDF export parameters.
 * @param styleColors - Resolved PDF colours.
 * @param bodyFont - Default document font.
 * @param fontRegistry - Font registry used by the document.
 * @param imageRegistry - Image registry used by the document.
 * @returns Resolved page furniture rules.
 */
export function resolvePageFurnitureConfig(
    config: PdfHeaderFooterConfig | undefined,
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    bodyFont: ResolvedPdfFont,
    fontRegistry: PdfFontRegistry,
    imageRegistry: PdfImageRegistry
): ResolvedPageFurnitureConfig {
    const resolved: ResolvedPageFurnitureConfig = {};
    if (!config) {
        return resolved;
    }

    for (const rule of ['all', 'first', 'even'] as const) {
        const value = config[rule];
        if (value) {
            resolved[rule] = resolvePageFurniture(value, params, styleColors, bodyFont, fontRegistry, imageRegistry);
        }
    }
    return resolved;
}

/**
 * Select the page-specific header and footer rule.
 * @param config - Resolved page furniture rules.
 * @param pageNumber - One-based page number.
 * @returns Page furniture for the requested page.
 */
export function getPageFurnitureForPage(
    config: ResolvedPageFurnitureConfig,
    pageNumber: number
): ResolvedPageFurniture {
    if (pageNumber === 1 && config.first) {
        return config.first;
    }
    if (pageNumber % 2 === 0 && config.even) {
        return config.even;
    }
    return config.all ?? { header: [], footer: [], headerHeight: 0, footerHeight: 0 };
}

/**
 * Resolve supported placeholders in page header and footer text.
 * @param value - Header or footer template.
 * @param placeholders - Values for the current page.
 * @returns Text with supported placeholders replaced.
 */
export function resolvePagePlaceholders(value: string, placeholders: PdfPagePlaceholderValues): string {
    const replacements: Record<string, string> = {
        Page: String(placeholders.pageNumber),
        Pages: String(placeholders.totalPages),
        Date: placeholders.date,
        Time: placeholders.time,
    };

    return value.replace(/&\[(Page|Pages|Date|Time)\]/g, (_match, name: string) => replacements[name]);
}

/**
 * Capture date and time strings once so every page in an export is consistent.
 * @param date - Export start date.
 * @param language - Optional BCP 47 language tag.
 * @returns Localised date and time strings.
 */
export function getPageDateTime(date: Date, language?: string): Pick<PdfPagePlaceholderValues, 'date' | 'time'> {
    try {
        const dateValue = new Intl.DateTimeFormat(language, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }).format(date);
        const timeValue = new Intl.DateTimeFormat(language, {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
        return {
            date: normaliseDateTimeSpacing(dateValue),
            time: normaliseDateTimeSpacing(timeValue),
        };
    } catch {
        return {
            date: normaliseDateTimeSpacing(date.toLocaleDateString()),
            time: normaliseDateTimeSpacing(date.toLocaleTimeString()),
        };
    }
}

function normaliseDateTimeSpacing(value: string): string {
    return value.replace(/[\u00a0\u202f]/g, ' ');
}

function resolvePageFurniture(
    value: PdfHeaderFooter,
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    bodyFont: ResolvedPdfFont,
    fontRegistry: PdfFontRegistry,
    imageRegistry: PdfImageRegistry
): ResolvedPageFurniture {
    const header = resolvePageFurnitureContent(
        value.header,
        params,
        styleColors,
        bodyFont,
        fontRegistry,
        imageRegistry
    );
    const footer = resolvePageFurnitureContent(
        value.footer,
        params,
        styleColors,
        bodyFont,
        fontRegistry,
        imageRegistry
    );

    return {
        header,
        footer,
        headerHeight: getPageFurnitureHeight(header),
        footerHeight: getPageFurnitureHeight(footer),
    };
}

function resolvePageFurnitureContent(
    content: PdfHeaderFooterContent[] | undefined,
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    bodyFont: ResolvedPdfFont,
    fontRegistry: PdfFontRegistry,
    imageRegistry: PdfImageRegistry
): ResolvedPageFurnitureContent[] {
    if (!content?.length) {
        return [];
    }

    const resolved: ResolvedPageFurnitureContent[] = [];
    const fallbackTextColor = styleColors.foreground ?? { r: 0, g: 0, b: 0 };
    const blendWith = styleColors.pageBackground ?? styleColors.dataBackground;
    const defaultPositions: PdfHeaderFooterPosition[] = ['Left', 'Center', 'Right'];
    const count = Math.min(content.length, 3);

    for (let index = 0; index < count; index++) {
        const item = content[index];
        const itemStyle = item.style;
        const fontSize = resolveFiniteNumber(itemStyle?.fontSize, DEFAULT_PAGE_TEXT_SIZE, Number.EPSILON);
        const font = fontRegistry.resolve(
            itemStyle?.fontFamily,
            itemStyle?.fontWeight ?? bodyFont.weight,
            itemStyle?.fontStyle ?? bodyFont.style,
            bodyFont.family
        );
        const lineHeight = resolveFiniteNumber(
            itemStyle?.lineHeight,
            fontRegistry.getNaturalLineHeight(fontSize, font),
            Number.EPSILON
        );
        const position = item.position ?? defaultPositions[index];
        let alignment: 'left' | 'center' | 'right' = 'left';
        if (position === 'Center') {
            alignment = 'center';
        } else if (position === 'Right') {
            alignment = 'right';
        }

        resolved.push({
            value: item.value ?? '',
            position,
            image: item.image ? imageRegistry.resolve(item.image) : undefined,
            style: {
                fontSize,
                fontFamily: font.family,
                fontWeight: font.weight,
                fontStyle: font.style,
                font,
                fontRegistry,
                direction: itemStyle?.direction ?? params.direction ?? 'auto',
                language: itemStyle?.language ?? params.language,
                lineHeight,
                maxLines: 1,
                overflow: 'ellipsis',
                alignment,
                alignmentExplicit: true,
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
                textColor: resolveOptionalColor(itemStyle?.color, fallbackTextColor, blendWith) ?? fallbackTextColor,
                borderWidth: 0,
                wrapText: false,
                preserveLineBreaks: false,
                preserveSpaces: false,
            },
        });
    }

    return resolved;
}

function getPageFurnitureHeight(content: ResolvedPageFurnitureContent[]): number {
    let contentHeight = 0;
    for (const item of content) {
        const textHeight = item.value ? item.style.lineHeight : 0;
        contentHeight = Math.max(contentHeight, textHeight, item.image?.height ?? 0);
    }
    return contentHeight ? contentHeight + PAGE_FURNITURE_PADDING * 2 : 0;
}
