import { paramToVariableName } from 'ag-stack';

import type {
    PdfColors,
    PdfDocumentHeadingStyle,
    PdfHeaderFooter,
    PdfHeaderFooterConfig,
    PdfHeaderFooterContent,
    PdfWatermark,
} from 'ag-grid-community';
import { _createElement } from 'ag-grid-community';

import { resolveCssColorValue } from './colors';
import { isTransparentColorValue } from './pdfColor';

const PDF_COLOR_KEYS: (keyof PdfColors)[] = [
    'backgroundColor',
    'dataBackgroundColor',
    'oddRowBackgroundColor',
    'foregroundColor',
    'headerBackgroundColor',
    'headerTextColor',
    'borderColor',
];

/**
 * Merge default and override document title styles.
 * @param baseStyle - Title style from default params.
 * @param overrideStyle - Title style from export call params.
 * @returns Merged document title style.
 */
export function mergeDocumentHeadingStyle(
    baseStyle: PdfDocumentHeadingStyle | undefined,
    overrideStyle: PdfDocumentHeadingStyle | undefined
): PdfDocumentHeadingStyle | undefined {
    if (!baseStyle || !overrideStyle) {
        return overrideStyle ?? baseStyle;
    }

    return { ...baseStyle, ...overrideStyle };
}

/**
 * Resolve colour properties in a document title style.
 * @param style - Document title style.
 * @param resolveColorValue - Colour resolver used for theme variables and CSS values.
 * @returns Document title style with resolved colour fields.
 */
export function resolveDocumentHeadingStyleColors(
    style: PdfDocumentHeadingStyle | undefined,
    resolveColorValue: (value?: string) => string | undefined
): PdfDocumentHeadingStyle | undefined {
    if (!style) {
        return style;
    }

    return {
        ...style,
        color: resolveColorValue(style.color),
        backgroundColor: resolveColorValue(style.backgroundColor),
        borderColor: resolveColorValue(style.borderColor),
    };
}

/**
 * Merge default and runtime header/footer rules.
 * @param baseConfig - Header/footer configuration from default params.
 * @param overrideConfig - Header/footer configuration from export call params.
 * @returns Merged header/footer configuration.
 */
export function mergeHeaderFooterConfig(
    baseConfig: PdfHeaderFooterConfig | undefined,
    overrideConfig: PdfHeaderFooterConfig | undefined
): PdfHeaderFooterConfig | undefined {
    if (!baseConfig || !overrideConfig) {
        return overrideConfig ?? baseConfig;
    }

    const config: PdfHeaderFooterConfig = {};
    for (const rule of ['all', 'first', 'even'] as const) {
        const baseRule = baseConfig[rule];
        const overrideRule = overrideConfig[rule];
        if (baseRule || overrideRule) {
            config[rule] = { ...baseRule, ...overrideRule };
        }
    }
    return config;
}

/**
 * Resolve colour properties used by page headers and footers.
 * @param config - Header/footer configuration.
 * @param resolveColorValue - Colour resolver used for theme variables and CSS values.
 * @returns Header/footer configuration with resolved text colours.
 */
export function resolveHeaderFooterConfigColors(
    config: PdfHeaderFooterConfig | undefined,
    resolveColorValue: (value?: string) => string | undefined
): PdfHeaderFooterConfig | undefined {
    if (!config) {
        return config;
    }

    const resolved: PdfHeaderFooterConfig = {};
    for (const rule of ['all', 'first', 'even'] as const) {
        const value = config[rule];
        if (value) {
            resolved[rule] = resolveHeaderFooterColors(value, resolveColorValue);
        }
    }
    return resolved;
}

/**
 * Merge default and runtime watermark configuration.
 * @param baseWatermark - Watermark from default params.
 * @param overrideWatermark - Watermark from export call params.
 * @returns Merged watermark configuration.
 */
export function mergeWatermark(
    baseWatermark: PdfWatermark | undefined,
    overrideWatermark: PdfWatermark | undefined
): PdfWatermark | undefined {
    if (!baseWatermark || !overrideWatermark) {
        return overrideWatermark ?? baseWatermark;
    }

    return {
        ...baseWatermark,
        ...overrideWatermark,
        style: {
            ...(baseWatermark.style ?? {}),
            ...(overrideWatermark.style ?? {}),
        },
    };
}

/**
 * Resolve the watermark text colour.
 * @param watermark - Watermark configuration.
 * @param resolveColorValue - Colour resolver used for theme variables and CSS values.
 * @returns Watermark with its text colour resolved.
 */
export function resolveWatermarkColors(
    watermark: PdfWatermark | undefined,
    resolveColorValue: (value?: string) => string | undefined
): PdfWatermark | undefined {
    if (!watermark?.style) {
        return watermark;
    }

    return {
        ...watermark,
        style: {
            ...watermark.style,
            color: resolveColorValue(watermark.style.color),
        },
    };
}

function resolveHeaderFooterColors(
    value: PdfHeaderFooter,
    resolveColorValue: (value?: string) => string | undefined
): PdfHeaderFooter {
    return {
        header: resolveHeaderFooterContentColors(value.header, resolveColorValue),
        footer: resolveHeaderFooterContentColors(value.footer, resolveColorValue),
    };
}

function resolveHeaderFooterContentColors(
    content: PdfHeaderFooterContent[] | undefined,
    resolveColorValue: (value?: string) => string | undefined
): PdfHeaderFooterContent[] | undefined {
    if (!content) {
        return content;
    }

    return content.map((item) => ({
        ...item,
        style: item.style
            ? {
                  ...item.style,
                  color: resolveColorValue(item.style.color),
              }
            : undefined,
    }));
}

/**
 * Merge theme/default/override PDF colours and resolve colour tokens.
 * @param themeColors - Colours inferred from the active grid theme.
 * @param baseColors - Colours from default export params.
 * @param overrideColors - Colours from runtime export params.
 * @param resolveColorValue - Colour resolver used for theme variables and CSS values.
 * @returns Resolved PDF colour object.
 */
export function resolvePdfColors(
    themeColors: PdfColors,
    baseColors: PdfColors | undefined,
    overrideColors: PdfColors | undefined,
    resolveColorValue: (value?: string) => string | undefined
): PdfColors {
    const mergedColors: PdfColors = {
        ...themeColors,
        ...baseColors,
        ...overrideColors,
    };

    const dataBackgroundIsOverridden =
        baseColors?.dataBackgroundColor != null || overrideColors?.dataBackgroundColor != null;
    const oddRowBackgroundIsOverridden =
        baseColors?.oddRowBackgroundColor != null || overrideColors?.oddRowBackgroundColor != null;
    const themeOddRowBackgroundIsInherited =
        themeColors.oddRowBackgroundColor == null ||
        themeColors.oddRowBackgroundColor === themeColors.dataBackgroundColor;
    const preserveOddRowBackgroundInheritance =
        dataBackgroundIsOverridden && !oddRowBackgroundIsOverridden && themeOddRowBackgroundIsInherited;
    // preserve the theme's odd-row -> data-background fallback after applying export overrides.
    mergedColors.oddRowBackgroundColor = preserveOddRowBackgroundInheritance
        ? mergedColors.dataBackgroundColor
        : mergedColors.oddRowBackgroundColor;

    for (const key of PDF_COLOR_KEYS) {
        const value = mergedColors[key];
        if (!value) {
            continue;
        }
        mergedColors[key] = resolveColorValue(value) ?? value;
    }

    return mergedColors;
}

/**
 * Read theme colour variables from the grid root and map them to PDF colour keys.
 * @param eRootDiv - Grid root element.
 * @returns Theme-derived PDF colour overrides.
 */
export function getThemePdfColors(eRootDiv: HTMLElement | undefined): PdfColors {
    if (!eRootDiv || typeof getComputedStyle !== 'function') {
        return {};
    }

    const styles = getComputedStyle(eRootDiv);
    const themeStyles: PdfColors = {};

    for (const param of PDF_COLOR_KEYS) {
        const cssVar = paramToVariableName(param);
        const value = styles.getPropertyValue(cssVar).trim();
        if (!value) {
            continue;
        }

        const resolved = resolveCssColor(value, eRootDiv);
        if (resolved) {
            themeStyles[param] = resolved;
        }
    }

    // legacy themes expose header text through --ag-header-foreground-color, so sample the real element.
    const headerText = getElementStyleColor(eRootDiv, '.ag-header', 'color');
    if (headerText) {
        themeStyles.headerTextColor = headerText;
    }

    // header background can come from class-level styling rather than css vars, so sample the real element too.
    const headerBackground = getElementStyleColor(eRootDiv, '.ag-header', 'backgroundColor');
    if (headerBackground) {
        themeStyles.headerBackgroundColor = headerBackground;
    }

    return themeStyles;
}

/**
 * Resolve a theme-aware colour value.
 * @param value - Raw colour value.
 * @param eRootDiv - Grid root element used for CSS variable resolution.
 * @returns Resolved colour string, or `undefined`.
 */
export function resolveThemeColorValue(
    value: string | undefined,
    eRootDiv: HTMLElement | undefined
): string | undefined {
    return resolveCssColorValue(value, (rawValue) => {
        if (!rawValue) {
            return undefined;
        }

        const resolved = resolveCssColor(rawValue, eRootDiv);
        return resolved || undefined;
    });
}

/**
 * Resolve an arbitrary CSS colour string to a computed colour.
 * @param value - Raw CSS colour value.
 * @param eRootDiv - Grid root element used as the probe container.
 * @returns Computed colour string, empty string when invalid.
 */
function resolveCssColor(value: string, eRootDiv: HTMLElement | undefined): string {
    if (typeof document === 'undefined') {
        return value;
    }
    if (!eRootDiv || typeof getComputedStyle !== 'function') {
        return value;
    }

    const probe = _createElement({ tag: 'span' });
    const isCssVariable = /\bvar\(/i.test(value);
    probe.style.color = value;

    if (!probe.style.color && !isCssVariable) {
        return '';
    }

    // keep the probe off-screen to avoid layout impact while still letting the browser resolve the colour.
    probe.style.position = 'absolute';
    probe.style.left = '-99999px';
    probe.style.top = '-99999px';
    probe.style.visibility = 'hidden';

    eRootDiv.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    probe.remove();

    return computed || '';
}

/**
 * Read a computed colour from a descendant element.
 * @param eRootDiv - Grid root element.
 * @param selector - Descendant selector to probe.
 * @param property - Colour property name.
 * @returns Resolved colour string, or `undefined` when missing/transparent.
 */
function getElementStyleColor(
    eRootDiv: HTMLElement | undefined,
    selector: string,
    property: 'backgroundColor' | 'color'
): string | undefined {
    if (!eRootDiv || typeof getComputedStyle !== 'function') {
        return undefined;
    }

    const element = eRootDiv.querySelector<HTMLElement>(selector);
    if (!element) {
        return undefined;
    }

    const value = getComputedStyle(element)[property].trim();
    if (!value || isTransparentColorValue(value)) {
        return undefined;
    }

    return value;
}
