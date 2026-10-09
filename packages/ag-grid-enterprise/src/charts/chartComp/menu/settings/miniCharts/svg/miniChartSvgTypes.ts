import type { ChartTranslationKey } from '../../../../services/chartTranslationService';

/** A colour taken from the solid fills or strokes palette at render time. */
export interface MiniChartSvgSlot {
    palette: 'fills' | 'strokes';
    index: number;
}

/** A series shape, drawn as an SVG path. */
export interface MiniChartSvgShape {
    d: string;
    /** Omitted means `fill="none"`. */
    fill?: MiniChartSvgSlot;
    /** Omitted means no stroke. */
    stroke?: MiniChartSvgSlot;
    /** Non-colour presentation attributes, written as-is. */
    attrs?: Record<string, string | number>;
}

export interface MiniChartSvgTemplate {
    tooltip: ChartTranslationKey;
    /** Hides the parts of the series that fall outside the plot area. */
    clip?: true;
    /** Drawn in order, so later shapes are painted over earlier ones. The axes are drawn over all of them. */
    series: MiniChartSvgShape[];
}
