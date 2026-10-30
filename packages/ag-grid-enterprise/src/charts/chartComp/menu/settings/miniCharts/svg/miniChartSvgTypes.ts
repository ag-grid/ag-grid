import type { ChartTranslationKey } from '../../../../services/chartTranslationService';

/** A colour taken from the solid fills or strokes palette at render time. */
export interface MiniChartSvgSlot {
    palette: 'fills' | 'strokes';
    index: number;
    /** Leaves the shape unpainted when the palette is shorter than `index`, instead of reusing its colours. */
    wrap?: false;
}

/** A palette slot, or a literal CSS colour for parts of an icon that do not follow the palette. */
export type MiniChartSvgPaint = MiniChartSvgSlot | string;

/**
 * An axis-aligned rectangle `[x, y, width, height]` or line `[x1, y1, x2, y2]`, snapped to device pixels when
 * drawn, as the canvas thumbnails were.
 */
export type MiniChartSvgCrispPart = { rect: number[] } | { line: number[] };

/** A series shape, drawn as an SVG path from path data or from a circle `[cx, cy, r]`. */
export type MiniChartSvgShape = MiniChartSvgShapePaint &
    (
        | {
              /** Path data, or parts snapped to device pixels; a stroked rectangle is inset by half the stroke width. */
              d: string | MiniChartSvgCrispPart[];
          }
        | { circle: number[] }
    );

interface MiniChartSvgShapePaint {
    /** Omitted means `fill="none"`. */
    fill?: MiniChartSvgPaint;
    /** Omitted means no stroke. */
    stroke?: MiniChartSvgPaint;
    /** Non-colour presentation attributes, written as-is. */
    attrs?: Record<string, string | number>;
}

export interface MiniChartSvgTemplate {
    tooltip: ChartTranslationKey;
    /** Hides the parts of the series outside this `[x, y, width, height]` rectangle. */
    clip?: number[];
    /** Cartesian axis lines by default, concentric rings for polar charts. */
    axes?: 'cartesian' | 'polar' | 'none';
    /** Draws the series over the axes instead of under them. */
    seriesOverAxes?: true;
    /** Drawn in order, so later shapes are painted over earlier ones. */
    series: MiniChartSvgShape[];
}
