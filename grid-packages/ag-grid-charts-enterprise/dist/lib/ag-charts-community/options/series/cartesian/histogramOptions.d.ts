import type { AgDropShadowOptions } from '../../chart/dropShadowOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions } from '../seriesOptions';
import type { AgCartesianSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { FillOptions, LineDashOptions, StrokeOptions } from './commonOptions';
export interface AgHistogramSeriesTooltipRendererParams<TDatum> extends Omit<AgCartesianSeriesTooltipRendererParams<AgHistogramBinDatum<TDatum>>, 'yKey'> {
    /** yKey as specified on series options. */
    readonly yKey?: string;
}
export type AgHistogramSeriesLabelFormatterParams = AgHistogramSeriesOptionsKeys & AgHistogramSeriesOptionsNames;
export interface AgHistogramBinDatum<TDatum> {
    data: TDatum[];
    aggregatedValue: number;
    frequency: number;
    domain: [number, number];
}
export interface AgHistogramSeriesThemeableOptions<TDatum = any> extends AgBaseCartesianThemeableOptions<TDatum>, FillOptions, StrokeOptions, LineDashOptions {
    /** Configuration for the shadow used behind the chart series. */
    shadow?: AgDropShadowOptions;
    /** Configuration for the labels shown on bars. */
    label?: AgChartLabelOptions<TDatum, AgHistogramSeriesLabelFormatterParams>;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgHistogramSeriesTooltipRendererParams<TDatum>>;
}
export interface AgHistogramSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-values from the data. */
    yKey?: string;
}
export interface AgHistogramSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
}
export interface AgHistogramSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgHistogramSeriesOptionsKeys, AgHistogramSeriesOptionsNames, AgHistogramSeriesThemeableOptions<TDatum> {
    /** Configuration for Histogram Series. */
    type: 'histogram';
    /** For variable width bins, if true the histogram will represent the aggregated `yKey` values using the area of the bar. Otherwise, the height of the var represents the value as per a normal bar chart. This is useful for keeping an undistorted curve displayed when using variable-width bins. */
    areaPlot?: boolean;
    /** Set the bins explicitly. The bins need not be of equal width. Note that `bins` is ignored if `binCount` is also supplied. */
    bins?: [number, number][];
    /** The number of bins to try to split the x-axis into. Clashes with the `bins` setting. */
    binCount?: number;
    /** Dictates how the bins are aggregated. If set to 'sum', the value shown for the bins will be the total of the yKey values. If set to 'mean', it will display the average yKey value of the bin. */
    aggregation?: 'count' | 'sum' | 'mean';
}
