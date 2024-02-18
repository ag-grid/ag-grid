import type { AgErrorBarOptions, AgErrorBarThemeableOptions } from '../../chart/errorBarOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { AgSeriesMarkerOptions } from '../markerOptions';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions } from '../seriesOptions';
import type { AgCartesianSeriesTooltipRendererParams, AgErrorBoundSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { LineDashOptions, StrokeOptions } from './commonOptions';
export type AgLineSeriesTooltipRendererParams<TDatum = any> = AgCartesianSeriesTooltipRendererParams<TDatum> & AgErrorBoundSeriesTooltipRendererParams;
export type AgLineSeriesLabelFormatterParams = AgLineSeriesOptionsKeys & AgLineSeriesOptionsNames;
export interface AgLineSeriesThemeableOptions<TDatum = any> extends StrokeOptions, LineDashOptions, AgBaseCartesianThemeableOptions<TDatum> {
    /** Configuration for the markers used in the series. */
    marker?: AgSeriesMarkerOptions<AgLineSeriesOptionsKeys, TDatum>;
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not. */
    title?: string;
    /** Configuration for the labels shown on top of data points. */
    label?: AgChartLabelOptions<TDatum, AgLineSeriesLabelFormatterParams>;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgLineSeriesTooltipRendererParams<TDatum>>;
    /** Configuration for the Error Bars. */
    errorBar?: AgErrorBarThemeableOptions;
    /** Set to `true` to connect across missing data points. */
    connectMissingData?: boolean;
}
export interface AgLineSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-values from the data. */
    yKey: string;
}
export interface AgLineSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
}
export interface AgLineSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgLineSeriesOptionsKeys, AgLineSeriesOptionsNames, AgLineSeriesThemeableOptions<TDatum> {
    /** Configuration for the Line Series. */
    type?: 'line';
    /** Configuration for the Error Bars. */
    errorBar?: AgErrorBarOptions;
}
