import type { AgChartCallbackParams } from '../../chart/callbackOptions';
import type { AgChartAutoSizedSecondaryLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { PixelSize, TextAlign, VerticalAlign } from '../../chart/types';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions } from '../seriesOptions';
import type { AgCartesianSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { FillOptions, StrokeOptions } from './commonOptions';
export interface AgHeatmapSeriesFormatterParams<TDatum> extends AgChartCallbackParams<TDatum>, AgHeatmapSeriesOptionsKeys, FillOptions, StrokeOptions {
    readonly highlighted: boolean;
}
export type AgHeatmapSeriesFormat = FillOptions & StrokeOptions;
export type AgHeatmapSeriesLabelFormatterParams = AgHeatmapSeriesOptionsKeys & AgHeatmapSeriesOptionsNames;
export interface AgHeatmapSeriesTooltipRendererParams extends AgCartesianSeriesTooltipRendererParams {
    /** colorKey as specified on series options. */
    readonly colorKey?: string;
    /** colorName as specified on series options. */
    readonly colorName?: string;
}
export interface AgHeatmapSeriesThemeableOptions<TDatum = any> extends StrokeOptions, AgBaseCartesianThemeableOptions<TDatum> {
    /** Options for the label in each cell. */
    label?: AgChartAutoSizedSecondaryLabelOptions<TDatum, AgHeatmapSeriesLabelFormatterParams>;
    /** Minimum distance between the label text and the edges of the cell. */
    itemPadding?: PixelSize;
    /** Horizontal position of the label. */
    textAlign?: TextAlign;
    /** Vertical position of the label. */
    verticalAlign?: VerticalAlign;
    /** The title to use for the series. Defaults to `yName` if it exists, or `yKey` if not. */
    title?: string;
    /** Function used to return formatting for individual heatmap cells, based on the given parameters. If the current cell is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgHeatmapSeriesFormatterParams<TDatum>) => AgHeatmapSeriesFormat;
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgHeatmapSeriesTooltipRendererParams>;
}
export interface AgHeatmapSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-values from the data. */
    yKey: string;
    /** The name of the node key containing the colour value. This value (along with `colorRange` configs) will be used to determine the cell colour. */
    colorKey?: string;
}
export interface AgHeatmapSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
    /** A human-readable description of the colour values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    colorName?: string;
}
export interface AgHeatmapSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgHeatmapSeriesOptionsKeys, AgHeatmapSeriesOptionsNames, AgHeatmapSeriesThemeableOptions<TDatum> {
    /** Configuration for the Heatmap Series. */
    type: 'heatmap';
    /** The colour range to interpolate the numeric colour domain (min and max `colorKey` values) into. For example, if the colour domain is `[-5, 5]` and `colorRange` is `['red', 'green']`, a `colorKey` value of `-5` will be assigned the 'red' colour, `5` - 'green' colour and `0` a blend of 'red' and 'green'. */
    colorRange?: string[];
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
