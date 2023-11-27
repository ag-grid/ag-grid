import type { CssColor, FontFamily, FontSize, FontStyle, FontWeight, Opacity, OverflowStrategy, PixelSize, TextWrap } from '../../chart/types';
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
    /** The color for filling shapes. */
    fill?: CssColor;
    /** The opacity of the fill color. */
    fillOpacity?: Opacity;
}
/**
 * Represents options for the stroke drawn around shapes in a chart.
 */
export interface StrokeOptions {
    /** The color for the stroke around shapes. */
    stroke?: CssColor;
    /** The width of the stroke in pixels. */
    strokeWidth?: PixelSize;
    /** The opacity of the stroke color. */
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
    /** The color for text elements. */
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
export interface AgSeriesFormatterParams<DatumType> {
    /** The data point associated with the series. */
    readonly datum: DatumType;
    /** The unique identifier of the series. */
    readonly seriesId: string;
    /** Indicates whether the element is highlighted. */
    readonly highlighted: boolean;
}
export interface AutomaticLabelLayout {
    /**
     * If the label does not fit in the container, setting this will allow the label to pick a font size between its normal `fontSize` and `minimumFontSize`
     * to fit within the container
     */
    minimumFontSize?: FontSize;
    /**
     * Text wrapping strategy for labels.
     * - `'always'` will always wrap text to fit within the tile.
     * - `'hyphenate'` is similar to `'always'`, but inserts a hyphen (`-`) if forced to wrap in the middle of a word.
     * - `'on-space'` will only wrap on white space. If there is no possibility to wrap a line on space and satisfy the tile dimensions, the text will be truncated.
     * - `'never'` disables text wrapping.
     * Default: `'on-space'`
     */
    wrapping?: TextWrap;
    /**
     * Adjusts the behaviour of labels when they overflow
     * - `'ellipsis'` will truncate the text to fit, appending an ellipsis (...)
     * - `'hide'` only displays the label if it completely fits within its bounds, and removes it if it would overflow
     */
    overflowStrategy?: OverflowStrategy;
}
