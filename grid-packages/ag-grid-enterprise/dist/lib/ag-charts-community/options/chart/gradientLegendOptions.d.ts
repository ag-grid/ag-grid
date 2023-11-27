import type { AgChartLegendPosition } from './legendOptions';
import type { CssColor, FontFamily, FontSize, FontStyle, FontWeight, PixelSize } from './types';
export interface AgGradientLegendLabelFormatterParams {
    value: string;
}
export interface AgGradientLegendOptions {
    /** Whether to show the gradient legend. By default, the chart displays a gradient legend for heatmap series. */
    enabled?: boolean;
    /** Where the legend should show in relation to the chart. */
    position?: AgChartLegendPosition;
    /** Gradient bar configuration. */
    gradient?: AgGradientLegendBarOptions;
    /** The spacing in pixels to use outside the legend. */
    spacing?: PixelSize;
    /** Configuration for the legend gradient stops that consist of a color and a label. */
    stop?: AgGradientLegendStopOptions;
    /** Reverse the display order of legend items if `true`. */
    reverseOrder?: boolean;
}
export interface AgGradientLegendBarOptions {
    /** Preferred length of the gradient bar (may expand to fit labels or shrink to fit inside a chart). */
    preferredLength?: PixelSize;
    /** The thickness of the gradient bar (width for vertical or height for horizontal layout). */
    thickness?: PixelSize;
}
export interface AgGradientLegendLabelOptions {
    /** If the label text exceeds the maximum length, it will be truncated and an ellipsis will be appended to indicate this. */
    maxLength?: number;
    /** The colour of the text. */
    color?: CssColor;
    /** The font style to use for the legend. */
    fontStyle?: FontStyle;
    /** The font weight to use for the legend. */
    fontWeight?: FontWeight;
    /** The font size in pixels to use for the legend. */
    fontSize?: FontSize;
    /** The font family to use for the legend. */
    fontFamily?: FontFamily;
    /** Function used to render legend labels. Where `id` is a series ID, `itemId` is component ID within a series, such as a field name or an item index. */
    formatter?: (params: AgGradientLegendLabelFormatterParams) => string;
}
export interface AgGradientLegendStopOptions {
    /** Configuration for the legend labels. */
    label?: AgGradientLegendLabelOptions;
    /** The spacing in pixels to use between gradient and labels. */
    padding?: PixelSize;
}
