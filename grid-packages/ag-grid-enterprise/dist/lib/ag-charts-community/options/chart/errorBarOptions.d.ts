import type { AgCartesianSeriesTooltipRendererParams } from '../series/cartesian/cartesianSeriesTooltipOptions';
import type { LineDashOptions, StrokeOptions } from '../series/cartesian/commonOptions';
import type { AgChartCallbackParams } from './callbackOptions';
import type { PixelSize, Ratio } from './types';
export interface AgErrorBarFormatterParams extends Omit<AgChartCallbackParams<any>, 'itemId'>, SeriesKeyOptions, SeriesNameOptions, ErrorBarKeyOptions, ErrorBarNameOptions {
    readonly highlighted: boolean;
}
interface ErrorBarStylingOptions extends StrokeOptions, LineDashOptions {
    /** Whether to display the error bars. */
    visible?: boolean;
}
interface ErrorBarCapLengthOptions {
    /** Absolute length of caps in pixels. */
    length?: PixelSize;
    /** Length of caps relative to the shape used by the series. */
    lengthRatio?: Ratio;
}
interface SeriesKeyOptions {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-values from the data. */
    yKey?: string;
}
interface SeriesNameOptions {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
}
interface ErrorBarKeyOptions {
    /** The key to use to retrieve lower bound error values from the x axis data. */
    xLowerKey?: string;
    /** The key to use to retrieve upper bound error values from the x axis data. */
    xUpperKey?: string;
    /** The key to use to retrieve lower bound error values from the y axis data. */
    yLowerKey?: string;
    /** The key to use to retrieve upper bound error values from the y axis data. */
    yUpperKey?: string;
}
interface ErrorBarNameOptions {
    /** Human-readable description of the lower bound error value for the x axis. This is the value to use in tooltips or labels. */
    xLowerName?: string;
    /** Human-readable description of the upper bound error value for the x axis. This is the value to use in tooltips or labels. */
    xUpperName?: string;
    /** Human-readable description of the lower bound error value for the y axis. This is the value to use in tooltips or labels. */
    yLowerName?: string;
    /** Human-readable description of the upper bound error value for the y axis. This is the value to use in tooltips or labels. */
    yUpperName?: string;
}
interface ErrorBarCapFormatterOption {
    /** Function used to return formatting for individual caps, based on the given parameters. If the current error bar is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgErrorBarFormatterParams) => AgErrorBarOptions['cap'] | undefined;
}
interface ErrorBarFormatterOption {
    /** Function used to return formatting for individual error bars, based on the given parameters. If the current error bar is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgErrorBarFormatterParams) => AgErrorBarOptions | undefined;
}
interface ErrorBarCapOptions extends ErrorBarCapFormatterOption, ErrorBarCapLengthOptions, ErrorBarStylingOptions {
}
export interface AgErrorBarThemeableOptions extends ErrorBarStylingOptions {
    /** Options to style error bars' caps */
    cap?: ErrorBarCapOptions;
}
export declare const AgErrorBarSupportedSeriesTypes: readonly ["bar", "line", "scatter"];
export interface AgErrorBarOptions extends ErrorBarKeyOptions, ErrorBarNameOptions, ErrorBarFormatterOption, AgErrorBarThemeableOptions {
}
export interface AgErrorBarTooltipParams extends AgCartesianSeriesTooltipRendererParams<any>, ErrorBarKeyOptions, ErrorBarNameOptions {
}
export {};
