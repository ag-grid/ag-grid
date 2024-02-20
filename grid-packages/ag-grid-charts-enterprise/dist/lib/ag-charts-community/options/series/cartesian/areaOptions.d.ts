import type { AgDropShadowOptions } from '../../chart/dropShadowOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { AgSeriesMarkerOptions } from '../markerOptions';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions } from '../seriesOptions';
import type { AgCartesianSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { FillOptions, LineDashOptions, StrokeOptions } from './commonOptions';
export type AgAreaSeriesLabelFormatterParams = AgAreaSeriesOptionsKeys & AgAreaSeriesOptionsNames;
type AgAreaSeriesTooltipRendererParams<TDatum> = AgCartesianSeriesTooltipRendererParams<TDatum>;
export interface AgAreaSeriesThemeableOptions<TDatum = any> extends StrokeOptions, FillOptions, LineDashOptions, AgBaseCartesianThemeableOptions<TDatum> {
    /** Configuration for the markers used in the series. */
    marker?: AgSeriesMarkerOptions<AgAreaSeriesOptionsKeys, TDatum>;
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Configuration for the labels shown on top of data points. */
    label?: AgChartLabelOptions<TDatum, AgAreaSeriesLabelFormatterParams>;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgAreaSeriesTooltipRendererParams<TDatum>>;
    /** Set to `true` to connect across missing data points. */
    connectMissingData?: boolean;
}
export interface AgAreaSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-values from the data. */
    yKey: string;
}
export interface AgAreaSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
}
export interface AgAreaSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgAreaSeriesOptionsKeys, AgAreaSeriesOptionsNames, AgAreaSeriesThemeableOptions<TDatum> {
    /** Configuration for the Area Series. */
    type: 'area';
    /** The number to normalise the area stacks to. For example, if `normalizedTo` is set to `100`, the stacks will all be scaled proportionally so that their total height is always 100. */
    normalizedTo?: number;
    /** An option indicating if the areas should be stacked. */
    stacked?: boolean;
    /** An ID to be used to group stacked items. */
    stackGroup?: string;
}
export {};
