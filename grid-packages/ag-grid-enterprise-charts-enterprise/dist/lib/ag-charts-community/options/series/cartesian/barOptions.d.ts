import type { AgChartCallbackParams } from '../../chart/callbackOptions';
import type { AgDropShadowOptions } from '../../chart/dropShadowOptions';
import type { AgErrorBarOptions, AgErrorBarThemeableOptions } from '../../chart/errorBarOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip, AgSeriesTooltipRendererParams } from '../../chart/tooltipOptions';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions } from '../seriesOptions';
import type { AgErrorBoundSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { FillOptions, LineDashOptions, StrokeOptions } from './commonOptions';
export type AgBarSeriesLabelPlacement = 'inside' | 'outside';
export interface AgBarSeriesLabelOptions<TDatum, TParams> extends AgChartLabelOptions<TDatum, TParams> {
    /** Where to render series labels relative to the segments. */
    placement?: AgBarSeriesLabelPlacement;
}
export interface AgBarSeriesFormatterParams<TDatum> extends AgChartCallbackParams<TDatum>, AgBarSeriesOptionsKeys, FillOptions, StrokeOptions, LineDashOptions {
    readonly highlighted: boolean;
    readonly stackGroup?: string;
}
export interface AgBarSeriesStyle extends FillOptions, StrokeOptions, LineDashOptions {
}
export type AgBarSeriesLabelFormatterParams = AgBarSeriesOptionsKeys & AgBarSeriesOptionsNames;
export interface AgBarSeriesTooltipRendererParams<TDatum = any> extends AgBarSeriesOptionsKeys, AgBarSeriesOptionsNames, AgErrorBoundSeriesTooltipRendererParams, AgSeriesTooltipRendererParams<TDatum> {
    readonly stackGroup?: string;
}
export interface AgBarSeriesThemeableOptions<TDatum = any> extends AgBarSeriesStyle, AgBaseCartesianThemeableOptions<TDatum> {
    /**
     * Bar rendering direction.
     *
     * __Note:__ This option affects the layout direction of X and Y data values.
     */
    direction?: 'horizontal' | 'vertical';
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Configuration for the labels shown on bars. */
    label?: AgBarSeriesLabelOptions<TDatum, AgBarSeriesLabelFormatterParams>;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgBarSeriesTooltipRendererParams>;
    /** Function used to return formatting for individual bars, based on the given parameters. If the current bar is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgBarSeriesFormatterParams<TDatum>) => AgBarSeriesStyle;
    /** Configuration for the Error Bars. */
    errorBar?: AgErrorBarThemeableOptions;
}
export interface AgBarSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-values from the data. */
    yKey: string;
}
export interface AgBarSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** Human-readable description of the y-values. If supplied, a corresponding `yName` will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
    /** Human-readable description of the y-values. If supplied, matching items with the same value will be toggled together. */
    legendItemName?: string;
}
export interface AgBarSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgBarSeriesOptionsKeys, AgBarSeriesOptionsNames, AgBarSeriesThemeableOptions<TDatum> {
    /** Configuration for the Bar Series. */
    type: 'bar';
    /** Whether to group together (adjacently) separate bars. */
    grouped?: boolean;
    /** An option indicating if the bars should be stacked. */
    stacked?: boolean;
    /** An ID to be used to group stacked items. */
    stackGroup?: string;
    /** The number to normalise the bar stacks to. Has no effect when `grouped` is `true`. For example, if `normalizedTo` is set to `100`, the bar stacks will all be scaled proportionally so that each of their totals is 100. */
    normalizedTo?: number;
    /** Configuration for the Error Bars. */
    errorBar?: AgErrorBarOptions;
}
