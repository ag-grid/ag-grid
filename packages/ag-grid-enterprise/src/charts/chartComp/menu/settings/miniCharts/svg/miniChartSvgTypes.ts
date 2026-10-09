import type { ChartTranslationKey } from '../../../../services/chartTranslationService';

/** A colour taken from the solid fills or strokes palette at render time. */
export interface MiniChartSvgSlot {
    palette: 'fills' | 'strokes';
    index: number;
}

/** A palette slot, or a literal CSS colour for parts of an icon that do not follow the palette. */
export type MiniChartSvgPaint = MiniChartSvgSlot | string;

/** A series shape, drawn as an SVG path. */
export interface MiniChartSvgShape {
    d: string;
    /** Omitted means `fill="none"`. */
    fill?: MiniChartSvgPaint;
    /** Omitted means no stroke. */
    stroke?: MiniChartSvgPaint;
    /** Non-colour presentation attributes, written as-is. */
    attrs?: Record<string, string | number>;
}

export interface MiniChartSvgTemplate {
    tooltip: ChartTranslationKey;
    /** Hides the parts of the series that fall outside the plot area. */
    clip?: true;
    /** Cartesian axis lines by default, concentric rings for polar charts. */
    axes?: 'cartesian' | 'polar' | 'none';
    /** Draws the series over the axes instead of under them. */
    seriesOverAxes?: true;
    /** Drawn in order, so later shapes are painted over earlier ones. */
    series: MiniChartSvgShape[];
}
