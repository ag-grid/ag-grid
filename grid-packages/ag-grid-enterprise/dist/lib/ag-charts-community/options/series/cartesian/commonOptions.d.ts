import type { CssColor, FontFamily, FontSize, FontStyle, FontWeight, Opacity, PixelSize } from '../../chart/types';
/**
 * Represents configuration options for X and Y axes in a chart.
 */
export interface AxisOptions {
    /** The key used to retrieve x-values (categories) from the data. */
    xKey: string;
    /** The key used to retrieve y-values from the data. */
    yKey: string;
    /** A descriptive label for x-values. */
    xName?: string;
    /** A descriptive label for y-values. */
    yName?: string;
}
/**
 * Represents options for filling shapes in a chart.
 */
export interface FillOptions {
    /** The colour for filling shapes. */
    fill?: CssColor;
    /** The opacity of the fill colour. */
    fillOpacity?: Opacity;
}
/**
 * Represents options for the stroke drawn around shapes in a chart.
 */
export interface StrokeOptions {
    /** The colour for the stroke around shapes. */
    stroke?: CssColor;
    /** The width of the stroke in pixels. */
    strokeWidth?: PixelSize;
    /** The opacity of the stroke colour. */
    strokeOpacity?: Opacity;
}
/**
 * Represents options for defining dashed strokes in a chart.
 */
export interface LineDashOptions {
    /** An array specifying the length in pixels of alternating dashes and gaps. */
    lineDash?: PixelSize[];
    /** The initial offset of the dashed line in pixels. */
    lineDashOffset?: PixelSize;
}
/**
 * Represents font styling options for text elements in a chart.
 */
export interface FontOptions {
    /** The colour for text elements. */
    color?: CssColor;
    /** The style for text elements (e.g., 'normal', 'italic', 'oblique'). */
    fontStyle?: FontStyle;
    /** The weight for text elements (e.g., 'normal', 'bold', 'lighter', 'bolder'). */
    fontWeight?: FontWeight;
    /** The size of the font in pixels for text elements. */
    fontSize?: FontSize;
    /** The font family for text elements. */
    fontFamily?: FontFamily;
}
/**
 * Represents toggleable options for chart elements.
 */
export interface Toggleable {
    /** Determines whether the associated elements should be displayed on the chart. */
    enabled?: boolean;
}
/**
 * Represents parameters for formatting data in a chart series.
 */
export interface AgSeriesFormatterParams<TDatum> {
    /** The data point associated with the series. */
    readonly datum: TDatum;
    /** The unique identifier of the series. */
    readonly seriesId: string;
    /** Indicates whether the element is highlighted. */
    readonly highlighted: boolean;
}
