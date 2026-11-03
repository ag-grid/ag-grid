/**
 * The series palette: an ordered list of fill/stroke pairs, plus the three
 * semantic accents. Host-agnostic, since AG Charts' `AgChartTheme.palette` and
 * Studio's numbered theme params both reduce to it, each adapting at its own
 * boundary. Colours are plain strings - `fills` also admits gradients and
 * patterns, which hosts narrow away rather than the editor defending against.
 */
import { RGBAColor } from '../../theming/RGBAColor';

export interface PaletteAccent {
    fill?: string;
    stroke?: string;
    /** As `Palette.strokesDerived`, for this one pair. */
    strokeDerived?: boolean;
}

export type PaletteAccentKey = 'up' | 'down' | 'neutral';

export const PALETTE_ACCENT_KEYS: PaletteAccentKey[] = ['up', 'down', 'neutral'];

export interface Palette {
    fills: string[];
    strokes: string[];
    /**
     * Which strokes follow their fill rather than having been chosen, paired by
     * index with `strokes`. A derived stroke is recomputed from its fill on every
     * read, so its stored colour is ignored. Absent means derived.
     */
    strokesDerived?: boolean[];
    up?: PaletteAccent;
    down?: PaletteAccent;
    neutral?: PaletteAccent;
}

/**
 * How much of a fill's lightness a derived stroke keeps. Fitted against the ten
 * hand-tuned `ag-default` strokes; a scale rather than a subtraction, so a dark
 * fill yields a slightly darker stroke instead of collapsing to black.
 */
const DERIVED_STROKE_LIGHTNESS = 0.6;

/**
 * How far towards white a derived stroke moves on a dark theme. Fitted against
 * the hand-tuned `ag-default-dark` strokes, which lighten rather than darken.
 */
const DERIVED_DARK_STROKE_LIGHTEN = 0.25;

/** Strokes darken their fill on a light theme and lighten it on a dark one. */
export type StrokeDirection = 'darken' | 'lighten';

/** Components in 0..1, hue included. */
const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const chroma = max - min;
    if (chroma === 0) return [0, 0, lightness];

    let hue;
    if (max === r) {
        hue = ((g - b) / chroma) % 6;
    } else if (max === g) {
        hue = (b - r) / chroma + 2;
    } else {
        hue = (r - g) / chroma + 4;
    }
    hue /= 6;
    if (hue < 0) hue += 1;

    return [hue, chroma / (1 - Math.abs(2 * lightness - 1)), lightness];
};

const hslToRgb = (hue: number, saturation: number, lightness: number): [number, number, number] => {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const second = chroma * (1 - Math.abs(((hue * 6) % 2) - 1));
    const offset = lightness - chroma / 2;
    const sector = Math.floor(hue * 6) % 6;
    const [r, g, b] = [
        [chroma, second, 0],
        [second, chroma, 0],
        [0, chroma, second],
        [0, second, chroma],
        [second, 0, chroma],
        [chroma, 0, second],
    ][sector];
    return [r + offset, g + offset, b + offset];
};

/**
 * The stroke a fill implies: the same colour, darker or lighter. An unparseable
 * fill is returned unchanged, which draws a stroke nobody notices rather than a guess.
 */
export const deriveStroke = (fill: string, direction: StrokeDirection = 'darken'): string => {
    const color = RGBAColor.parseCss(fill);
    if (!color) return fill;
    const [hue, saturation, lightness] = rgbToHsl(color.r, color.g, color.b);
    const strokeLightness =
        direction === 'darken'
            ? lightness * DERIVED_STROKE_LIGHTNESS
            : lightness + (1 - lightness) * DERIVED_DARK_STROKE_LIGHTEN;
    const [r, g, b] = hslToRgb(hue, saturation, strokeLightness);
    return new RGBAColor(r, g, b, color.a).toCSSHex();
};

/** No fill to derive from leaves the stroke unset rather than inventing one. */
const deriveAccentStroke = (fill: string | undefined, direction?: StrokeDirection) =>
    fill ? deriveStroke(fill, direction) : undefined;

/** "No palette of our own" - the host falls back to its base theme's colours. */
export const EMPTY_PALETTE: Palette = { fills: [], strokes: [] };

/**
 * Fills and strokes are index-paired, so the editor works in series slots rather
 * than in two parallel lists that a slot insertion could knock out of step.
 */
export interface SeriesColor {
    fill: string;
    stroke: string;
    /** Optional so a caller building a palette from scratch can leave it to the default. */
    strokeDerived?: boolean;
}

/** Absent means derived - see `Palette.strokesDerived`. */
export const strokeIsDerived = (derived: boolean | undefined): boolean => derived ?? true;

export const toSeriesColors = (
    { fills, strokes, strokesDerived }: Palette,
    direction: StrokeDirection = 'darken'
): SeriesColor[] =>
    fills.map((fill, index) => {
        const strokeDerived = strokeIsDerived(strokesDerived?.[index]);
        const stroke = strokeDerived ? undefined : strokes[index];
        return { fill, stroke: stroke ?? deriveStroke(fill, direction), strokeDerived };
    });

export const fromSeriesColors = (palette: Palette, colors: SeriesColor[]): Palette => ({
    ...palette,
    fills: colors.map(({ fill }) => fill),
    strokes: colors.map(({ stroke }) => stroke),
    strokesDerived: colors.map(({ strokeDerived }) => strokeIsDerived(strokeDerived)),
});

/**
 * A slot with its fill replaced, and its stroke too where the stroke was only
 * ever following the fill.
 */
export const withFill = (color: SeriesColor, fill: string): SeriesColor => ({
    ...color,
    fill,
    stroke: strokeIsDerived(color.strokeDerived) ? deriveStroke(fill) : color.stroke,
});

/** A slot with a stroke the user chose, which is what stops it following the fill. */
export const withStroke = (color: SeriesColor, stroke: string): SeriesColor => ({
    ...color,
    stroke,
    strokeDerived: false,
});

/**
 * A slot linked back to its fill, or cut loose from it. Linking recomputes
 * immediately rather than waiting for the next fill edit, a control that
 * visibly changes nothing reading as broken.
 */
export const withDerivedStroke = (color: SeriesColor, derived: boolean): SeriesColor => ({
    ...color,
    strokeDerived: derived,
    stroke: derived ? deriveStroke(color.fill) : color.stroke,
});

/** An accent pair as shown, its stroke derived from its fill unless chosen. */
export const resolveAccent = (
    accent: PaletteAccent | undefined,
    direction: StrokeDirection = 'darken'
): PaletteAccent | undefined =>
    accent && strokeIsDerived(accent.strokeDerived)
        ? { ...accent, stroke: deriveAccentStroke(accent.fill, direction) }
        : accent;

/** The same three rules, for an accent pair, whose colours may both be unset. */
export const withAccentFill = (accent: PaletteAccent | undefined, fill: string | undefined): PaletteAccent => ({
    ...accent,
    fill,
    stroke: strokeIsDerived(accent?.strokeDerived) ? deriveAccentStroke(fill) : accent?.stroke,
});

export const withAccentStroke = (accent: PaletteAccent | undefined, stroke: string | undefined): PaletteAccent => ({
    ...accent,
    stroke,
    strokeDerived: false,
});

export const withDerivedAccentStroke = (accent: PaletteAccent | undefined, derived: boolean): PaletteAccent => ({
    ...accent,
    strokeDerived: derived,
    stroke: derived ? deriveAccentStroke(accent?.fill) : accent?.stroke,
});

export const withAccentColors = (palette: Palette, key: PaletteAccentKey, value: PaletteAccent): Palette => ({
    ...palette,
    [key]: value,
});

/**
 * The palette as AG Charts takes it, without the editor's own bookkeeping.
 * Hosts must go through this on the way to a theme: the shape is otherwise a
 * structural subset of `AgChartThemePalette`, so an extra key would ride along
 * unnoticed into the theme a user copies.
 */
export const toThemePalette = (palette: Palette, direction: StrokeDirection = 'darken') => {
    const colors = toSeriesColors(palette, direction);
    const [up, down, neutral] = PALETTE_ACCENT_KEYS.map((key) => resolveAccent(palette[key], direction));
    return {
        fills: palette.fills,
        strokes: colors.map(({ stroke }) => stroke),
        ...(accentHasColour(up) ? { up: toThemeAccent(up) } : {}),
        ...(accentHasColour(down) ? { down: toThemeAccent(down) } : {}),
        ...(accentHasColour(neutral) ? { neutral: toThemeAccent(neutral) } : {}),
    };
};

/**
 * A cleared accent is omitted, not emitted empty: any of `up`, `down` or
 * `neutral` makes this a full palette, where rising candles draw solid.
 */
const accentHasColour = (accent: PaletteAccent | undefined): accent is PaletteAccent =>
    accent != null && (accent.fill != null || accent.stroke != null);

const toThemeAccent = ({ fill, stroke }: PaletteAccent) => ({ fill, stroke });

/**
 * A stored palette, with anything it has no opinion on taken from another. The
 * semantic accents are why: a palette carrying none of `up`, `down` or
 * `neutral` is an *indexed* palette to AG Charts, which draws rising candles
 * hollow. Absent, not empty - a cleared colour is an opinion, and stays cleared.
 */
export const withPaletteDefaults = (palette: Palette, defaults: Palette): Palette => ({ ...defaults, ...palette });

export const paletteIsEmpty = (palette: Palette): boolean =>
    palette.fills.length === 0 && palette.strokes.length === 0 && !palette.up && !palette.down && !palette.neutral;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value != null && !Array.isArray(value);

const readColor = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);

const readAccent = (value: unknown): PaletteAccent | undefined => {
    if (!isRecord(value)) {
        return undefined;
    }
    const stroke = readColor(value.stroke);
    return { fill: readColor(value.fill), stroke, strokeDerived: stroke == null };
};

/**
 * An AG Charts theme palette in the editor's shape, the inverse of
 * `toThemePalette`: fills no colour picker can show are dropped with their
 * strokes, a stroke the theme names is kept as chosen, and one it leaves out
 * is derived from its fill.
 */
export const fromThemePalette = (themePalette: unknown): Palette | undefined => {
    if (!isRecord(themePalette)) {
        return undefined;
    }
    const fills = Array.isArray(themePalette.fills) ? themePalette.fills : [];
    const strokes = Array.isArray(themePalette.strokes) ? themePalette.strokes : [];
    const colors: SeriesColor[] = [];
    fills.forEach((fill, index) => {
        if (typeof fill === 'string') {
            const stroke = readColor(strokes[index]);
            colors.push({ fill, stroke: stroke ?? deriveStroke(fill), strokeDerived: stroke == null });
        }
    });
    const palette = fromSeriesColors(
        {
            ...EMPTY_PALETTE,
            up: readAccent(themePalette.up),
            down: readAccent(themePalette.down),
            neutral: readAccent(themePalette.neutral),
        },
        colors
    );
    return paletteIsEmpty(palette) ? undefined : palette;
};
