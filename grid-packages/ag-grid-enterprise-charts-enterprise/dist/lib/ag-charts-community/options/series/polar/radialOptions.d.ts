import type { AgChartCallbackParams } from '../../chart/callbackOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip, AgSeriesTooltipRendererParams } from '../../chart/tooltipOptions';
import type { FillOptions, LineDashOptions, StrokeOptions } from '../cartesian/commonOptions';
import type { AgBaseSeriesThemeableOptions } from '../seriesOptions';
export interface AgBaseRadialSeriesThemeableOptions<TDatum = any> extends StrokeOptions, LineDashOptions, FillOptions, AgBaseSeriesThemeableOptions<TDatum> {
    /** Configuration for the labels shown on top of data points. */
    label?: AgChartLabelOptions<TDatum, AgRadialSeriesLabelFormatterParams>;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgRadialSeriesTooltipRendererParams>;
    /** A formatter function for adjusting the styling of the radial columns. */
    formatter?: (params: AgRadialSeriesFormatterParams<TDatum>) => AgRadialSeriesFormat;
}
export interface AgRadialSeriesOptionsKeys {
    /** The key to use to retrieve angle values from the data. */
    angleKey: string;
    /** The key to use to retrieve radius values from the data. */
    radiusKey: string;
}
export interface AgRadialSeriesOptionsNames {
    /** A human-readable description of the angle values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    angleName?: string;
    /** A human-readable description of the radius values. If supplied, this will be passed to the tooltip renderer as one of the parameters. */
    radiusName?: string;
}
export type AgRadialSeriesLabelFormatterParams = AgRadialSeriesOptionsKeys & AgRadialSeriesOptionsNames;
export interface AgRadialSeriesTooltipRendererParams extends AgSeriesTooltipRendererParams, AgRadialSeriesOptionsKeys, AgRadialSeriesOptionsNames {
    /** xValue as read from series data via the xKey property. */
    readonly angleValue?: any;
    /** yValue as read from series data via the yKey property. */
    readonly radiusValue?: any;
}
export interface AgRadialSeriesFormatterParams<TDatum> extends AgChartCallbackParams<TDatum>, AgRadialSeriesOptionsKeys, FillOptions, StrokeOptions {
    readonly highlighted: boolean;
}
export type AgRadialSeriesFormat = FillOptions & StrokeOptions;
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
