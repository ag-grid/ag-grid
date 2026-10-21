import type { AgColorType } from 'ag-charts-types';

const FALLBACK_COLOR = 'gray';

/** Reduces palette entries to solid colours: a gradient to its first stop, a pattern to its fill. */
export function toSolidColors(palette: AgColorType[]): string[] {
    const fallback = palette.find((entry): entry is string => typeof entry === 'string') ?? FALLBACK_COLOR;

    return palette.map((entry) => {
        if (typeof entry === 'string') {
            return entry;
        }
        const { colorStops, fill } = entry as { colorStops?: { color?: unknown }[]; fill?: unknown };
        const stopColor = colorStops?.[0]?.color;
        if (typeof stopColor === 'string') {
            return stopColor;
        }
        return typeof fill === 'string' ? fill : fallback;
    });
}
