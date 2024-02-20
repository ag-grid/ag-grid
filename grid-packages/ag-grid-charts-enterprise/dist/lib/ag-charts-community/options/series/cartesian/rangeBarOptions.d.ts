import type { AgChartCallbackParams } from '../../chart/callbackOptions';
import type { AgDropShadowOptions } from '../../chart/dropShadowOptions';
import type { AgChartLabelOptions } from '../../chart/labelOptions';
import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { CssColor, Opacity, PixelSize } from '../../chart/types';
import type { AgBaseCartesianThemeableOptions, AgBaseSeriesOptions, AgSeriesHighlightStyle } from '../seriesOptions';
import type { AgCartesianSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { FillOptions, LineDashOptions, StrokeOptions } from './commonOptions';
export interface AgRangeBarSeriesFormatterParams<TDatum> extends AgChartCallbackParams<TDatum>, FillOptions, StrokeOptions {
    readonly itemId: string;
    readonly highlighted: boolean;
    readonly xKey: string;
    readonly yLowKey: string;
    readonly yHighKey: string;
    readonly labelKey?: string;
}
export interface AgRangeBarSeriesFormat {
    fill?: CssColor;
    fillOpacity?: Opacity;
    stroke?: CssColor;
    strokeWidth?: PixelSize;
}
export interface AgRangeBarSeriesTooltipRendererParams extends Omit<AgCartesianSeriesTooltipRendererParams, 'yKey' | 'yValue'> {
    /** The Id to distinguish the type of datum. This can be `low` or `high`. */
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
export interface AgRangeBarSeriesLabelOptions<TDatum> extends AgChartLabelOptions<TDatum, AgRangeBarSeriesLabelFormatterParams> {
    /** Where to render series labels relative to the bars. */
    placement?: AgRangeBarSeriesLabelPlacement;
    /** Padding in pixels between the label and the edge of the bar. */
    padding?: PixelSize;
}
export type AgRangeBarSeriesLabelPlacement = 'inside' | 'outside';
export interface AgRangeBarSeriesThemeableOptions<TDatum = any> extends AgBaseCartesianThemeableOptions<TDatum>, FillOptions, StrokeOptions, LineDashOptions {
    /**
     * Bar rendering direction.
     *
     * __Note:__ This option affects the layout direction of X and Y data values.
     */
    direction?: 'horizontal' | 'vertical';
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgRangeBarSeriesTooltipRendererParams>;
    /** Configuration for the range series items when they are hovered over. */
    highlightStyle?: AgSeriesHighlightStyle;
    /** Configuration for the labels shown on top of data points. */
    label?: AgRangeBarSeriesLabelOptions<TDatum>;
    /** Configuration for the shadow used behind the series items. */
    shadow?: AgDropShadowOptions;
    /** Function used to return formatting for individual RangeBar series item cells, based on the given parameters. If the current cell is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgRangeBarSeriesFormatterParams<TDatum>) => AgRangeBarSeriesFormat;
}
export type AgRangeBarSeriesLabelFormatterParams = AgRangeBarSeriesOptionsKeys & AgRangeBarSeriesOptionsNames;
export interface AgRangeBarSeriesOptionsKeys {
    /** The key to use to retrieve x-values from the data. */
    xKey: string;
    /** The key to use to retrieve y-low-values from the data. */
    yLowKey: string;
    /** The key to use to retrieve y-high-values from the data. */
    yHighKey: string;
}
export interface AgRangeBarSeriesOptionsNames {
    /** A human-readable description of the x-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    xName?: string;
    /** A human-readable description of the y-low-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yLowName?: string;
    /** A human-readable description of the y-high-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yHighName?: string;
    /** A human-readable description of the y-values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    yName?: string;
}
export interface AgRangeBarSeriesOptions<TDatum = any> extends AgRangeBarSeriesOptionsKeys, AgRangeBarSeriesOptionsNames, AgRangeBarSeriesThemeableOptions<TDatum>, AgBaseSeriesOptions<TDatum> {
    /** Configuration for the Range Bar Series. */
    type: 'range-bar';
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
