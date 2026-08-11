// Colour maths for the style guide: normalise any computed CSS colour string to sRGB, then
// derive the WCAG contrast figures designers need to sign a token pairing off.
//
// Browsers do not serialise computed colours to a single format. `getComputedStyle` gives back
// `rgb()` for hex/named inputs, `color(srgb ...)` for a resolved `color-mix()`, and `oklch(...)`
// verbatim for an oklch author value, so anything reading a live token value has to handle all
// three rather than assuming rgb.

export interface Rgb {
    r: number;
    g: number;
    b: number;
    a: number;
}

export type WcagGrade = 'AAA' | 'AA' | 'AA Large' | 'Fail';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Splits the inside of a functional colour notation, tolerating both comma and space syntax. */
const splitComponents = (body: string): string[] =>
    body
        .replace('/', ' ')
        .split(/[,\s]+/)
        .map((part) => part.trim())
        .filter(Boolean);

/**
 * Reads a component that may be a percentage, a bare number, or `none`. `scale` is what 100%
 * means for this component, so `50%` on an 0-255 channel gives 127.5 and on an 0-1 channel gives
 * 0.5.
 */
const readComponent = (raw: string | undefined, scale: number): number => {
    if (raw == null || raw === 'none') {
        return 0;
    }
    if (raw.endsWith('%')) {
        return (Number.parseFloat(raw) / 100) * scale;
    }
    return Number.parseFloat(raw);
};

const readAlpha = (raw: string | undefined): number => (raw == null ? 1 : clamp01(readComponent(raw, 1)));

const linearToSrgb = (channel: number): number => {
    const abs = Math.abs(channel);
    const encoded = abs <= 0.0031308 ? channel * 12.92 : Math.sign(channel) * (1.055 * abs ** (1 / 2.4) - 0.055);
    return clamp01(encoded) * 255;
};

/** Oklab -> sRGB, via the linear-sRGB matrix from Björn Ottosson's reference conversion. */
const oklabToRgb = (lightness: number, aAxis: number, bAxis: number, alpha: number): Rgb => {
    const lRoot = lightness + 0.3963377774 * aAxis + 0.2158037573 * bAxis;
    const mRoot = lightness - 0.1055613458 * aAxis - 0.0638541728 * bAxis;
    const sRoot = lightness - 0.0894841775 * aAxis - 1.291485548 * bAxis;

    const l = lRoot ** 3;
    const m = mRoot ** 3;
    const s = sRoot ** 3;

    return {
        r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
        a: alpha,
    };
};

const parseHex = (value: string): Rgb | undefined => {
    const hex = value.slice(1);
    const expand = (pair: string) => Number.parseInt(pair.length === 1 ? pair + pair : pair, 16);

    if (hex.length === 3 || hex.length === 4) {
        return {
            r: expand(hex[0]),
            g: expand(hex[1]),
            b: expand(hex[2]),
            a: hex.length === 4 ? expand(hex[3]) / 255 : 1,
        };
    }
    if (hex.length === 6 || hex.length === 8) {
        return {
            r: expand(hex.slice(0, 2)),
            g: expand(hex.slice(2, 4)),
            b: expand(hex.slice(4, 6)),
            a: hex.length === 8 ? expand(hex.slice(6, 8)) / 255 : 1,
        };
    }
    return undefined;
};

/**
 * Parses a *computed* CSS colour string to sRGB. Returns undefined for anything unrecognised
 * (including `transparent` shortcuts the browser did not expand) so callers can degrade to
 * showing the raw string rather than a wrong number.
 */
export const parseColour = (value: string): Rgb | undefined => {
    const trimmed = value.trim().toLowerCase();

    if (trimmed.startsWith('#')) {
        return parseHex(trimmed);
    }

    const functional = /^([a-z-]+)\((.*)\)$/.exec(trimmed);
    if (!functional) {
        return undefined;
    }

    const [, fn, body] = functional;
    const parts = splitComponents(body);

    if (fn === 'rgb' || fn === 'rgba') {
        return {
            r: readComponent(parts[0], 255),
            g: readComponent(parts[1], 255),
            b: readComponent(parts[2], 255),
            a: readAlpha(parts[3]),
        };
    }

    if (fn === 'color') {
        // Only sRGB-family spaces are handled numerically here; that covers everything the
        // design system's `color-mix(in srgb, ...)` tokens compute to.
        const space = parts[0];
        if (space !== 'srgb' && space !== 'srgb-linear') {
            return undefined;
        }
        const channels = [readComponent(parts[1], 1), readComponent(parts[2], 1), readComponent(parts[3], 1)];
        const toByte = space === 'srgb-linear' ? linearToSrgb : (channel: number) => clamp01(channel) * 255;
        return {
            r: toByte(channels[0]),
            g: toByte(channels[1]),
            b: toByte(channels[2]),
            a: readAlpha(parts[4]),
        };
    }

    if (fn === 'oklch') {
        const lightness = readComponent(parts[0], 1);
        const chroma = readComponent(parts[1], 0.4);
        const hue = (readComponent(parts[2], 360) * Math.PI) / 180;
        return oklabToRgb(lightness, chroma * Math.cos(hue), chroma * Math.sin(hue), readAlpha(parts[3]));
    }

    if (fn === 'oklab') {
        return oklabToRgb(
            readComponent(parts[0], 1),
            readComponent(parts[1], 0.4),
            readComponent(parts[2], 0.4),
            readAlpha(parts[3])
        );
    }

    return undefined;
};

export const toHex = ({ r, g, b, a }: Rgb): string => {
    const byte = (channel: number) =>
        Math.round(clamp01(channel / 255) * 255)
            .toString(16)
            .padStart(2, '0');
    const alpha = a < 1 ? byte(a * 255) : '';
    return `#${byte(r)}${byte(g)}${byte(b)}${alpha}`;
};

/**
 * Flattens a translucent colour onto an opaque backdrop. Contrast ratios are only meaningful
 * between opaque colours, and several tokens (shadows, focus rings, `color-mix` blends against
 * `transparent`) carry alpha.
 */
export const flattenOnto = (colour: Rgb, backdrop: Rgb): Rgb => ({
    r: colour.r * colour.a + backdrop.r * (1 - colour.a),
    g: colour.g * colour.a + backdrop.g * (1 - colour.a),
    b: colour.b * colour.a + backdrop.b * (1 - colour.a),
    a: 1,
});

/** WCAG 2.1 relative luminance. */
export const relativeLuminance = ({ r, g, b }: Rgb): number => {
    const channel = (byte: number) => {
        const normalised = clamp01(byte / 255);
        return normalised <= 0.03928 ? normalised / 12.92 : ((normalised + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** WCAG 2.1 contrast ratio, 1-21. Both colours are flattened onto `backdrop` first. */
export const contrastRatio = (foreground: Rgb, background: Rgb, backdrop: Rgb = background): number => {
    const fg = relativeLuminance(flattenOnto(foreground, flattenOnto(background, backdrop)));
    const bg = relativeLuminance(flattenOnto(background, backdrop));
    const lighter = Math.max(fg, bg);
    const darker = Math.min(fg, bg);
    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Grades a ratio against WCAG 2.1 text thresholds. `large` covers text at 24px, or 18.66px when
 * bold - the point where 1.4.3 relaxes from 4.5:1 to 3:1.
 */
export const gradeContrast = (ratio: number, large = false): WcagGrade => {
    if (ratio >= 7 && !large) {
        return 'AAA';
    }
    if (ratio >= 4.5) {
        return large ? 'AAA' : 'AA';
    }
    if (ratio >= 3) {
        return large ? 'AA' : 'AA Large';
    }
    return 'Fail';
};

export const formatRatio = (ratio: number): string => `${Math.round(ratio * 100) / 100}:1`;

/** True when the colour is dark enough that white text sits better on it than black. */
export const prefersLightText = (colour: Rgb): boolean => relativeLuminance(colour) < 0.35;
