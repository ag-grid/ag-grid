import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip, AgSeriesTooltipRendererParams } from '../../chart/tooltipOptions';
import type { LineDashOptions, StrokeOptions } from '../cartesian/commonOptions';
import type { AgSeriesMarkerOptions } from '../markerOptions';
import type { AgBaseSeriesOptions, AgBaseSeriesThemeableOptions } from '../seriesOptions';
import type { AgRadialSeriesOptionsKeys, AgRadialSeriesOptionsNames } from './radialOptions';
export interface AgRadarSeriesThemeableOptions<TDatum = any> extends StrokeOptions, LineDashOptions, AgBaseSeriesThemeableOptions<TDatum> {
    /** Configuration for the markers used in the series. */
    marker?: AgSeriesMarkerOptions<TDatum, AgRadialSeriesOptionsKeys>;
    /** Configuration for the labels shown on top of data points. */
    label?: AgChartLabelOptions<TDatum, AgRadarSeriesLabelFormatterParams>;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgRadarSeriesTooltipRendererParams>;
    /** Set to `true` to connect across missing data points. */
    connectMissingData?: boolean;
}
export interface AgBaseRadarSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgRadialSeriesOptionsKeys, AgRadialSeriesOptionsNames, AgRadarSeriesThemeableOptions<TDatum> {
    type: 'radar-line' | 'radar-area';
}
export type AgRadarSeriesTooltipRendererParams = AgSeriesTooltipRendererParams & AgRadialSeriesOptionsKeys & AgRadialSeriesOptionsNames;
export type AgRadarSeriesLabelFormatterParams = AgRadialSeriesOptionsKeys & AgRadialSeriesOptionsNames;
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
