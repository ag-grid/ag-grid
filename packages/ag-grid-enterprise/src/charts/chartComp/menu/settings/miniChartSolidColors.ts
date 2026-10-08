import type { AgColorType } from 'ag-charts-types';

const FALLBACK_COLOR = 'gray';

/**
 * Reduces each palette entry to one solid colour for the settings panel thumbnails: a string as-is, a gradient
 * to its first stop's colour, a pattern to its fill colour, and anything else (e.g. an image) to the first string
 * colour in the palette, else `gray`.
 */
export function toSolidColors(palette: AgColorType[]): string[] {
    let fallback: string | undefined;
    const getFallback = () => (fallback ??= palette.find((entry) => typeof entry === 'string') ?? FALLBACK_COLOR);

    return palette.map((entry) => {
        if (typeof entry === 'string') {
            return entry;
        }
        const { colorStops, fill } = entry as { colorStops?: { color?: unknown }[]; fill?: unknown };
        const stopColor = colorStops?.[0]?.color;
        if (typeof stopColor === 'string') {
            return stopColor;
        }
        return typeof fill === 'string' ? fill : getFallback();
    });
}
