import type { PdfExportParams, PdfExportStyles } from 'ag-grid-community';
import { _paramToVariableName } from 'ag-grid-community';

import { isTransparentColorValue, resolveCssColorValue } from './colors';

const PDF_STYLE_COLOR_KEYS: (keyof PdfExportStyles)[] = [
    'backgroundColor',
    'dataBackgroundColor',
    'oddRowBackgroundColor',
    'foregroundColor',
    'headerBackgroundColor',
    'headerTextColor',
    'borderColor',
];

/**
 * Merge default and override document title values.
 * Supports both string and `PdfCell` forms while preserving existing style/data fields.
 * @param baseTitle - Title from default params.
 * @param overrideTitle - Title from export call params.
 * @returns Merged document title value.
 */
export function mergeDocumentTitle(
    baseTitle: PdfExportParams['documentTitle'],
    overrideTitle: PdfExportParams['documentTitle']
): PdfExportParams['documentTitle'] {
    if (overrideTitle == null) {
        return baseTitle;
    }

    if (typeof overrideTitle === 'string') {
        if (baseTitle && typeof baseTitle !== 'string') {
            return {
                ...baseTitle,
                data: {
                    ...(baseTitle.data ?? {}),
                    value: overrideTitle,
                },
            };
        }
        return overrideTitle;
    }

    const baseCell = typeof baseTitle === 'string' ? undefined : baseTitle;
    const mergedData = {
        ...(baseCell?.data ?? {}),
        ...(overrideTitle.data ?? {}),
    };
    const baseValue = typeof baseTitle === 'string' ? baseTitle : baseCell?.data?.value;
    if (mergedData.value == null && baseValue != null) {
        mergedData.value = baseValue;
    }

    return {
        ...(baseCell ?? {}),
        ...overrideTitle,
        data: mergedData,
        style: {
            ...(baseCell?.style ?? {}),
            ...(overrideTitle.style ?? {}),
        },
    };
}

/**
 * Resolve colour properties in a `documentTitle` cell style.
 * @param documentTitle - Document title value.
 * @param resolveColorValue - Colour resolver used for theme variables and CSS values.
 * @returns Document title with resolved colour fields.
 */
export function resolveDocumentTitleColors(
    documentTitle: PdfExportParams['documentTitle'],
    resolveColorValue: (value?: string) => string | undefined
): PdfExportParams['documentTitle'] {
    if (!documentTitle || typeof documentTitle === 'string') {
        return documentTitle;
    }

    const style = documentTitle.style;
    if (!style) {
        return documentTitle;
    }

    return {
        ...documentTitle,
        style: {
            ...style,
            color: resolveColorValue(style.color),
            backgroundColor: resolveColorValue(style.backgroundColor),
            borderColor: resolveColorValue(style.borderColor),
        },
    };
}

/**
 * Merge theme/default/override PDF styles and resolve colour tokens.
 * @param themeStyles - Styles inferred from the active grid theme.
 * @param baseStyles - Styles from default export params.
 * @param overrideStyles - Styles from runtime export params.
 * @param resolveColorValue - Colour resolver used for theme variables and CSS values.
 * @returns Resolved PDF style object.
 */
export function resolvePdfStyles(
    themeStyles: PdfExportStyles,
    baseStyles: PdfExportStyles | undefined,
    overrideStyles: PdfExportStyles | undefined,
    resolveColorValue: (value?: string) => string | undefined
): PdfExportStyles {
    const mergedStyles: PdfExportStyles = {
        ...themeStyles,
        ...baseStyles,
        ...overrideStyles,
    };

    PDF_STYLE_COLOR_KEYS.forEach((key) => {
        const value = mergedStyles[key];
        if (!value) {
            return;
        }
        mergedStyles[key] = resolveColorValue(value) ?? value;
    });

    return mergedStyles;
}

/**
 * Read theme colour variables from the grid root and map them to PDF style keys.
 * @param eRootDiv - Grid root element.
 * @returns Theme-derived PDF style overrides.
 */
export function getThemePdfStyles(eRootDiv: HTMLElement | undefined): PdfExportStyles {
    if (!eRootDiv || typeof getComputedStyle !== 'function') {
        return {};
    }

    const styles = getComputedStyle(eRootDiv);
    const themeStyles: PdfExportStyles = {};
    PDF_STYLE_COLOR_KEYS.forEach((param) => {
        const cssVar = _paramToVariableName(param);
        const value = styles.getPropertyValue(cssVar).trim();
        if (!value) {
            return;
        }

        const resolved = resolveCssColor(value, eRootDiv);
        if (resolved) {
            themeStyles[param] = resolved;
        }
    });

    // header background can come from class-level styling rather than css vars, so sample the real element too.
    const headerBackground = getElementStyleColor(eRootDiv, '.ag-header', 'backgroundColor');
    if (headerBackground) {
        themeStyles.headerBackgroundColor = headerBackground;
    }

    return themeStyles;
}

/**
 * Resolve an arbitrary CSS colour string to a computed colour.
 * @param value - Raw CSS colour value.
 * @param eRootDiv - Grid root element used as the probe container.
 * @returns Computed colour string, empty string when invalid.
 */
export function resolveCssColor(value: string, eRootDiv: HTMLElement | undefined): string {
    if (typeof document === 'undefined') {
        return value;
    }
    if (!eRootDiv || typeof getComputedStyle !== 'function') {
        return value;
    }

    const probe = document.createElement('span');
    probe.style.color = value;
    if (!probe.style.color) {
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
 * Read a computed colour from a descendant element.
 * @param eRootDiv - Grid root element.
 * @param selector - Descendant selector to probe.
 * @param property - Colour property name.
 * @returns Resolved colour string, or `undefined` when missing/transparent.
 */
export function getElementStyleColor(
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
