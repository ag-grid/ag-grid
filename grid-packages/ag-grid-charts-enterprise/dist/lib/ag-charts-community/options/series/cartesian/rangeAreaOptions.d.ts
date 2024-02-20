import type { AgDropShadowOptions } from '../../chart/dropShadowOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { PixelSize } from '../../chart/types';
import type { AgSeriesMarkerOptions } from '../markerOptions';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions, AgSeriesHighlightStyle } from '../seriesOptions';
import type { AgCartesianSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { FillOptions, LineDashOptions, StrokeOptions } from './commonOptions';
export interface AgRangeAreaSeriesTooltipRendererParams extends Omit<AgCartesianSeriesTooltipRendererParams, 'yKey' | 'yValue'> {
    /** The Id to distinguish the type of datum. This can be `positive`, `negative`, `total` or `subtotal`. */
    itemId: string;
    /** yKey as specified on series options. */
    readonly yLowKey: string;
    /** yLowValue as read from series data via the yLowKey property. */
    readonly yLowValue?: any;
    /** yLowName as specified on series options. */
    readonly yLowName?: string;
    /** yKey as specified on series options. */
    readonly yHighKey: string;
    /** yHighValue as read from series data via the yHighKey property. */
    readonly yHighValue?: any;
    /** yHighName as specified on series options. */
    readonly yHighName?: string;
}
export interface AgRangeAreaSeriesLabelOptions<TDatum, TParams> extends AgChartLabelOptions<TDatum, TParams> {
    /** Padding in pixels between the label and the edge of the marker. */
    padding?: PixelSize;
}
export type AgRangeAreaSeriesLabelPlacement = 'inside' | 'outside';
export type AgRangeAreaSeriesLabelFormatterParams = AgRangeAreaSeriesOptionsKeys & AgRangeAreaSeriesOptionsNames;
export interface AgRangeAreaSeriesThemeableOptions<TDatum = any> extends StrokeOptions, FillOptions, LineDashOptions, AgBaseCartesianThemeableOptions<TDatum> {
    /** Configuration for the markers used in the series.  */
    marker?: AgSeriesMarkerOptions<TDatum, AgRangeAreaSeriesOptionsKeys>;
    /** Configuration for the range series items when they are hovered over. */
    highlightStyle?: AgSeriesHighlightStyle;
    /** Configuration for the labels shown on top of data points. */
    label?: AgRangeAreaSeriesLabelOptions<TDatum, AgRangeAreaSeriesLabelFormatterParams>;
    /** Configuration for the shadow used behind the series items. */
    shadow?: AgDropShadowOptions;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgRangeAreaSeriesTooltipRendererParams>;
}
export interface AgRangeAreaSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-low-values from the data. */
    yLowKey: string;
    /** The key to use to retrieve y-high-values from the data. */
    yHighKey: string;
}
export interface AgRangeAreaSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-low-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yLowName?: string;
    /** A human-readable description of the y-high-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yHighName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
}
export interface AgRangeAreaSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgRangeAreaSeriesOptionsKeys, AgRangeAreaSeriesOptionsNames, AgRangeAreaSeriesThemeableOptions<TDatum> {
    /** Configuration for the Range Area Series. */
    type: 'range-area';
    /** Set to `true` to connect across missing data points. */
    connectMissingData?: boolean;
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
