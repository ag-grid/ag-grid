import type { AgAxisLabelFormatterParams } from './axisOptions';
import type { CssColor, FontFamily, FontSize, FontStyle, FontWeight, Opacity, PixelSize, Ratio } from './types';
export interface AgNavigatorMiniChartIntervalOptions {
    /** Maximum gap in pixels between labels. */
    minSpacing?: PixelSize;
    /** Maximum gap in pixels between labels. */
    maxSpacing?: PixelSize;
    /** Array of values in axis units to display as labels along the axis. The values in this array must be compatible with the axis type. */
    values?: any[];
    /** The step value between labels, specified as a number or time interval. If the configured interval results in too many labels given the chart size, it will be ignored. */
    step?: number;
}
export interface AgNavigatorMiniChartLabelOptions {
    /** Configuration for interval between the Mini Chart's axis labels. */
    interval?: AgNavigatorMiniChartIntervalOptions;
    /** Set to `false` to hide the axis labels. */
    enabled?: boolean;
    /** The font style to use for the labels. */
    fontStyle?: FontStyle;
    /** The font weight to use for the labels. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the labels. */
    fontSize?: FontSize;
    /** The font family to use for the labels. */
    fontFamily?: FontFamily;
    /** Padding in pixels between the axis labels and the Mini Chart. */
    padding?: PixelSize;
    /** The colour to use for the labels. */
    color?: CssColor;
    /** Avoid axis label collision by automatically reducing the number of labels displayed. If set to `false`, axis labels may collide. */
    avoidCollisions?: boolean;
    /** Format string used when rendering labels. */
    format?: string;
    /** Function used to render axis labels. If `value` is a number, `fractionDigits` will also be provided, which indicates the number of fractional digits used in the step between intervals; for example, a tick step of `0.0005` would have `fractionDigits` set to `4`. */
    formatter?: (params: AgAxisLabelFormatterParams) => string | undefined;
}
export interface AgNavigatorMiniChartPadding {
    /** Padding between the top edge of the Navigator and the Mini Chart series. */
    top?: number;
    /** Padding between the bottom edge of the Navigator and the Mini Chart series. */
    bottom?: number;
}
export interface AgNavigatorMiniChartOptions {
    /** Whether to show a Mini Chart in the Navigator. */
    enabled?: boolean;
    /** Configuration for the Mini Chart's axis labels. */
    label?: AgNavigatorMiniChartLabelOptions;
    /** Configuration for the padding inside the Mini Chart. */
    padding?: AgNavigatorMiniChartPadding;
}
export interface AgNavigatorMaskOptions {
    /** The fill colour used by the mask. */
    fill?: CssColor;
    /** The stroke colour used by the mask. */
    stroke?: CssColor;
    /** The stroke width used by the mask. */
    strokeWidth?: PixelSize;
    /** The opacity of the mask's fill in the `[0, 1]` interval, where `0` is effectively no masking. */
    fillOpacity?: Opacity;
}
export interface AgNavigatorHandleOptions {
    /** The fill colour used by the handle. */
    fill?: CssColor;
    /** The stroke colour used by the handle. */
    stroke?: CssColor;
    /** The stroke width used by the handle. */
    strokeWidth?: PixelSize;
    /** The width of the handle. */
    width?: PixelSize;
    /** The height of the handle. */
    height?: PixelSize;
    /** The distance between the handle's grip lines. */
    gripLineGap?: PixelSize;
    /** The length of the handle's grip lines. */
    gripLineLength?: PixelSize;
}
export interface AgNavigatorOptions {
    /** Whether to show the Navigator. */
    enabled?: boolean;
    /** The height of the Navigator. */
    height?: PixelSize;
    /** The distance between the Navigator and the bottom axis of the chart. */
    margin?: PixelSize;
    /** The start of the visible range in the `[0, 1]` interval. */
    min?: Ratio;
    /** The end of the visible range in the `[0, 1]` interval. */
    max?: Ratio;
    /** Configuration for the Navigator's visible range mask. */
    mask?: AgNavigatorMaskOptions;
    /** Configuration for the Navigator's left handle. */
    minHandle?: AgNavigatorHandleOptions;
    /** Configuration for the Navigator's right handle. */
    maxHandle?: AgNavigatorHandleOptions;
    /** Mini Chart options. */
    miniChart?: AgNavigatorMiniChartOptions;
}
