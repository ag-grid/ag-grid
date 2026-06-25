import type { PdfExportStyles } from 'ag-grid-community';

import type { PdfRowType } from '../pdfSerializingSession';

export type PdfRgb = { r: number; g: number; b: number };

type PdfRgba = PdfRgb & { a: number };

export type PdfStyleColors = {
    pageBackground?: PdfRgb;
    dataBackground?: PdfRgb;
    oddRowBackground?: PdfRgb;
    headerBackground?: PdfRgb;
    border?: PdfRgb;
    foreground?: PdfRgb;
    headerText?: PdfRgb;
};

export type PdfRowStyles = {
    background?: PdfRgb;
    border?: PdfRgb;
    text?: PdfRgb;
};

type PdfBaseExportStyles = Required<
    Pick<
        PdfExportStyles,
        | 'backgroundColor'
        | 'dataBackgroundColor'
        | 'oddRowBackgroundColor'
        | 'foregroundColor'
        | 'headerBackgroundColor'
        | 'headerTextColor'
        | 'borderColor'
    >
>;

const DEFAULT_PDF_STYLES: PdfBaseExportStyles = {
    backgroundColor: '#ffffff',
    dataBackgroundColor: '#ffffff',
    oddRowBackgroundColor: '#ffffff',
    foregroundColor: '#000000',
    headerBackgroundColor: '#ffffff',
    headerTextColor: '#000000',
    borderColor: '#000000',
};

/**
 * Resolve configured/exported style colour strings to RGB values.
 * @param styles - Optional PDF style overrides.
 * @returns Fully resolved colour bundle used by the PDF renderer.
 */
export function resolvePdfStyleColors(styles?: PdfExportStyles): PdfStyleColors {
    const resolvedStyles = { ...DEFAULT_PDF_STYLES, ...(styles ?? {}) };

    const pageBackground = resolveColor(resolvedStyles.backgroundColor, DEFAULT_PDF_STYLES.backgroundColor);
    const dataBackground = resolveColor(
        resolvedStyles.dataBackgroundColor,
        resolvedStyles.backgroundColor || DEFAULT_PDF_STYLES.dataBackgroundColor
    );
    const oddRowBackground = resolveColor(
        resolvedStyles.oddRowBackgroundColor,
        resolvedStyles.dataBackgroundColor || DEFAULT_PDF_STYLES.oddRowBackgroundColor
    );
    const headerBackground = resolveColor(
        resolvedStyles.headerBackgroundColor,
        resolvedStyles.backgroundColor || DEFAULT_PDF_STYLES.headerBackgroundColor
    );
    const border = resolveColor(
        resolvedStyles.borderColor,
        DEFAULT_PDF_STYLES.borderColor,
        pageBackground ?? dataBackground
    );
    const foreground = resolveColor(
        resolvedStyles.foregroundColor,
        DEFAULT_PDF_STYLES.foregroundColor,
        dataBackground ?? pageBackground
    );
    const headerText = resolveColor(
        resolvedStyles.headerTextColor,
        DEFAULT_PDF_STYLES.headerTextColor,
        headerBackground ?? pageBackground
    );

    return {
        pageBackground,
        dataBackground,
        oddRowBackground,
        headerBackground,
        border,
        foreground,
        headerText,
    };
}

/**
 * Resolve row-level default colours for a given row type.
 * @param rowType - Row type being rendered.
 * @param styles - Resolved document colours.
 * @param bodyRowIndex - Zero-based body row index.
 * @returns Row-level style colours.
 */
export function getRowStyles(rowType: PdfRowType, styles: PdfStyleColors, bodyRowIndex: number): PdfRowStyles {
    if (rowType === 'HEADER' || rowType === 'HEADER_GROUPING') {
        return {
            background: styles.headerBackground,
            border: styles.border,
            text: styles.headerText ?? styles.foreground,
        };
    }

    if (rowType === 'CUSTOM') {
        return {
            background: styles.dataBackground,
            border: styles.border,
            text: styles.foreground,
        };
    }

    if (rowType === 'BODY') {
        return {
            background:
                bodyRowIndex % 2 === 1 ? (styles.oddRowBackground ?? styles.dataBackground) : styles.dataBackground,
            border: styles.border,
            text: styles.foreground,
        };
    }

    return {
        background: styles.dataBackground,
        border: styles.border,
        text: styles.foreground,
    };
}

/**
 * Resolve an optional colour value with fallback/blending support.
 * @param value - Optional colour string.
 * @param fallback - Fallback RGB colour.
 * @param blendWith - Optional background colour used for alpha blending.
 * @returns Resolved RGB colour, or `undefined`.
 */
export function resolveOptionalColor(
    value: string | undefined,
    fallback: PdfRgb | undefined,
    blendWith?: PdfRgb
): PdfRgb | undefined {
    if (!value) {
        return fallback;
    }

    const parsed = parseColor(value);
    if (parsed === null) {
        return undefined;
    }
    if (!parsed) {
        return fallback;
    }
    if (parsed.a <= 0) {
        return undefined;
    }

    return blendWith && parsed.a < 1 ? blendColors(parsed, blendWith) : stripAlpha(parsed);
}

/**
 * Format an RGB colour as PDF colour operands.
 * @param color - RGB colour.
 * @returns Space-separated decimal RGB values in 0..1 range.
 */
export function formatColor(color: PdfRgb): string {
    const r = (color.r / 255).toFixed(3);
    const g = (color.g / 255).toFixed(3);
    const b = (color.b / 255).toFixed(3);
    return `${r} ${g} ${b}`;
}

/**
 * Check if a colour string resolves to a transparent value.
 * @param value - Colour string.
 * @returns `true` when the colour is transparent or explicitly invalid.
 */
export function isTransparentColorValue(value: string): boolean {
    const parsed = parseColor(value);
    if (parsed === null) {
        return true;
    }

    return !!parsed && parsed.a <= 0;
}

/**
 * Resolve a required colour with a string fallback.
 * @param value - Optional colour string.
 * @param fallback - Fallback colour string.
 * @param blendWith - Optional background colour used for alpha blending.
 * @returns Resolved RGB colour, or `undefined` when unresolved/transparent.
 */
function resolveColor(value: string | undefined, fallback: string, blendWith?: PdfRgb): PdfRgb | undefined {
    if (value) {
        const parsed = parseColor(value);
        if (parsed === null) {
            return undefined;
        }
        if (parsed && parsed.a <= 0) {
            return undefined;
        }
        if (parsed && parsed.a > 0) {
            return blendWith && parsed.a < 1 ? blendColors(parsed, blendWith) : stripAlpha(parsed);
        }
    }

    const parsedFallback = parseColor(fallback);
    if (!parsedFallback || parsedFallback === null || parsedFallback.a <= 0) {
        return undefined;
    }

    return blendWith && parsedFallback.a < 1 ? blendColors(parsedFallback, blendWith) : stripAlpha(parsedFallback);
}

/**
 * Parse supported CSS colour syntaxes into RGBA.
 * @param value - Colour string.
 * @returns Parsed RGBA, `null` for explicit transparent/none, or `undefined` when unsupported.
 */
function parseColor(value: string): PdfRgba | null | undefined {
    const normalised = value.trim().toLowerCase();
    if (!normalised || normalised === 'transparent' || normalised === 'none') {
        return null;
    }

    const srgbMatch = normalised.match(/^color\(\s*srgb\s+(.+)\)$/);
    if (srgbMatch) {
        // support css color() syntax with optional slash alpha channel.
        const raw = srgbMatch[1].trim();
        const [channelPart, alphaPart] = raw.split('/').map((part) => part.trim());
        const channels = channelPart.split(/\s+/).filter(Boolean);
        if (channels.length < 3) {
            return undefined;
        }

        const r = parseColorChannel(channels[0], true);
        const g = parseColorChannel(channels[1], true);
        const b = parseColorChannel(channels[2], true);
        if (r == null || g == null || b == null) {
            return undefined;
        }

        const a = alphaPart ? parseAlpha(alphaPart) : 1;
        return { r, g, b, a: a ?? 1 };
    }

    if (normalised.startsWith('#')) {
        const hex = normalised.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            const r = Number.parseInt(hex[0] + hex[0], 16);
            const g = Number.parseInt(hex[1] + hex[1], 16);
            const b = Number.parseInt(hex[2] + hex[2], 16);
            const a = hex.length === 4 ? Number.parseInt(hex[3] + hex[3], 16) / 255 : 1;
            return { r, g, b, a };
        }

        if (hex.length === 6 || hex.length === 8) {
            const r = Number.parseInt(hex.slice(0, 2), 16);
            const g = Number.parseInt(hex.slice(2, 4), 16);
            const b = Number.parseInt(hex.slice(4, 6), 16);
            const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
            return { r, g, b, a };
        }

        return undefined;
    }

    const rgbMatch = normalised.match(/^rgba?\((.+)\)$/);
    if (rgbMatch) {
        const inner = rgbMatch[1].trim();
        let channels: string[];
        let alphaPart: string | undefined;

        if (inner.includes(',')) {
            // legacy comma-separated rgb()/rgba() syntax.
            const parts = inner.split(',').map((part) => part.trim());
            if (parts.length < 3) {
                return undefined;
            }
            channels = parts.slice(0, 3);
            alphaPart = parts[3];
        } else {
            // modern space-separated rgb() syntax, optional "/ alpha".
            const [channelPart, optionalAlpha] = inner.split('/').map((part) => part.trim());
            channels = channelPart.split(/\s+/).filter(Boolean);
            alphaPart = optionalAlpha;
            if (channels.length < 3) {
                return undefined;
            }
        }

        const [r, g, b] = channels.slice(0, 3).map((part) => parseColorChannel(part, false));
        if (r == null || g == null || b == null) {
            return undefined;
        }

        const a = alphaPart ? parseAlpha(alphaPart) : 1;
        return { r, g, b, a: a ?? 1 };
    }

    const hslMatch = normalised.match(/^hsla?\((.+)\)$/);
    if (hslMatch) {
        const inner = hslMatch[1].trim();
        let channels: string[];
        let alphaPart: string | undefined;

        if (inner.includes(',')) {
            // legacy comma-separated hsl()/hsla() syntax.
            const parts = inner.split(',').map((part) => part.trim());
            if (parts.length < 3) {
                return undefined;
            }
            channels = parts.slice(0, 3);
            alphaPart = parts[3];
        } else {
            // modern space-separated hsl() syntax, optional "/ alpha".
            const [channelPart, optionalAlpha] = inner.split('/').map((part) => part.trim());
            channels = channelPart.split(/\s+/).filter(Boolean);
            alphaPart = optionalAlpha;
            if (channels.length < 3) {
                return undefined;
            }
        }

        const h = Number.parseFloat(channels[0]);
        const s = parsePercent(channels[1]);
        const l = parsePercent(channels[2]);
        if (!Number.isFinite(h) || s == null || l == null) {
            return undefined;
        }

        const rgb = hslToRgb(h, s, l);
        const a = alphaPart ? parseAlpha(alphaPart) : 1;
        return { ...rgb, a: a ?? 1 };
    }

    return undefined;
}

/**
 * Parse a colour channel token to 0..255.
 * @param value - Channel token.
 * @param scaleUnitless - Whether 0..1 values should be scaled to 0..255.
 * @returns Parsed channel, or `null` when invalid.
 */
function parseColorChannel(value: string, scaleUnitless: boolean): number | null {
    const trimmed = value.trim();
    const isPercent = trimmed.endsWith('%');
    const numeric = Number.parseFloat(trimmed);

    if (!Number.isFinite(numeric)) {
        return null;
    }

    if (isPercent) {
        return clampChannel((numeric / 100) * 255);
    }

    if (scaleUnitless && numeric >= 0 && numeric <= 1) {
        return clampChannel(numeric * 255);
    }

    return clampChannel(numeric);
}

/**
 * Parse an alpha token to 0..1.
 * @param value - Alpha token.
 * @returns Parsed alpha, or `null` when invalid.
 */
function parseAlpha(value: string): number | null {
    const trimmed = value.trim();
    const isPercent = trimmed.endsWith('%');
    const numeric = Number.parseFloat(trimmed);

    if (!Number.isFinite(numeric)) {
        return null;
    }

    if (isPercent) {
        return clampAlpha(numeric / 100);
    }

    return clampAlpha(numeric);
}

/**
 * Parse a percentage token to 0..1.
 * @param value - Percentage token (for example `60%`).
 * @returns Parsed ratio, or `null` when invalid.
 */
function parsePercent(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed.endsWith('%')) {
        return null;
    }

    const numeric = Number.parseFloat(trimmed.slice(0, -1));
    if (!Number.isFinite(numeric)) {
        return null;
    }

    return Math.max(0, Math.min(1, numeric / 100));
}

/**
 * Convert HSL values to RGB.
 * @param h - Hue in degrees.
 * @param s - Saturation in 0..1.
 * @param l - Lightness in 0..1.
 * @returns RGB colour.
 */
function hslToRgb(h: number, s: number, l: number): PdfRgb {
    const hue = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = l - c / 2;

    let rPrime = 0;
    let gPrime = 0;
    let bPrime = 0;

    if (hue < 60) {
        rPrime = c;
        gPrime = x;
    } else if (hue < 120) {
        rPrime = x;
        gPrime = c;
    } else if (hue < 180) {
        gPrime = c;
        bPrime = x;
    } else if (hue < 240) {
        gPrime = x;
        bPrime = c;
    } else if (hue < 300) {
        rPrime = x;
        bPrime = c;
    } else {
        rPrime = c;
        bPrime = x;
    }

    return {
        r: clampChannel((rPrime + m) * 255),
        g: clampChannel((gPrime + m) * 255),
        b: clampChannel((bPrime + m) * 255),
    };
}

/**
 * Clamp and round a channel value to 0..255.
 * @param value - Raw channel value.
 * @returns Clamped channel value.
 */
function clampChannel(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Clamp an alpha value to 0..1.
 * @param value - Raw alpha value.
 * @returns Clamped alpha value.
 */
function clampAlpha(value: number): number {
    return Math.max(0, Math.min(1, value));
}

/**
 * Drop alpha from an RGBA colour.
 * @param color - RGBA colour.
 * @returns RGB colour.
 */
function stripAlpha(color: PdfRgba): PdfRgb {
    return {
        r: color.r,
        g: color.g,
        b: color.b,
    };
}

/**
 * Alpha-blend a foreground RGBA colour over an RGB background.
 * @param foreground - Foreground colour.
 * @param background - Background colour.
 * @returns Blended RGB colour.
 */
function blendColors(foreground: PdfRgba, background: PdfRgb): PdfRgb {
    const alpha = clampAlpha(foreground.a);

    return {
        r: clampChannel(foreground.r * alpha + background.r * (1 - alpha)),
        g: clampChannel(foreground.g * alpha + background.g * (1 - alpha)),
        b: clampChannel(foreground.b * alpha + background.b * (1 - alpha)),
    };
}
