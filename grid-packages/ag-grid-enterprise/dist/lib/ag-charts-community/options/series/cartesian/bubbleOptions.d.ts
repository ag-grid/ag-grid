import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip, AgSeriesTooltipRendererParams } from '../../chart/tooltipOptions';
import type { PixelSize } from '../../chart/types';
import type { AgSeriesMarkerOptions } from '../markerOptions';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions } from '../seriesOptions';
export type AgBubbleSeriesTooltipRendererParams<TDatum = any> = AgSeriesTooltipRendererParams<TDatum> & AgBubbleSeriesOptionsKeys & AgBubbleSeriesOptionsNames;
export interface AgBubbleSeriesMarker<TDatum> extends AgSeriesMarkerOptions<AgBubbleSeriesOptionsKeys, TDatum> {
    /** Determines the largest size a marker can be in pixels. */
    maxSize?: PixelSize;
    /** Explicitly specifies the extent of the domain for series `sizeKey`. */
    domain?: [number, number];
}
export type AgBubbleSeriesLabelFormatterParams = AgBubbleSeriesOptionsKeys & AgBubbleSeriesOptionsNames;
export interface AgBubbleSeriesThemeableOptions<TDatum = any> extends AgBaseCartesianThemeableOptions<TDatum> {
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not.  */
    title?: string;
    /** Configuration for the markers used in the series.  */
    marker?: AgBubbleSeriesMarker<TDatum>;
    /** Configuration for the labels shown on top of data points.  */
    label?: AgChartLabelOptions<TDatum, AgBubbleSeriesLabelFormatterParams>;
    /** Series-specific tooltip configuration.  */
    tooltip?: AgSeriesTooltip<AgBubbleSeriesTooltipRendererParams<TDatum>>;
}
export interface AgBubbleSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data.  */
    xKey: string;
    /** The key to use to retrieve y-values from the data.  */
    yKey: string;
    /** The key to use to retrieve size values from the data, used to control the size of the markers.  */
    sizeKey: string;
    /** The key to use to retrieve values from the data to use as labels for the markers.  */
    labelKey?: string;
}
export interface AgBubbleSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.  */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.  */
    yName?: string;
    /** The key to use to retrieve size values from the data, used to control the size of the markers.  */
    sizeName?: string;
    /** A human-readable description of the label values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters.  */
    labelName?: string;
}
export interface AgBubbleSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgBubbleSeriesThemeableOptions<TDatum>, AgBubbleSeriesOptionsKeys, AgBubbleSeriesOptionsNames {
    /** Configuration for Bubble Series. */
    type: 'bubble';
}
