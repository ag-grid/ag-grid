import type { AgSeriesTooltip } from '../../chart/tooltipOptions';
import type { CssColor, Ratio } from '../../chart/types';
import type { AgBaseSeriesOptions, AgBaseSeriesThemeableOptions } from '../seriesOptions';
import type { AgCartesianSeriesTooltipRendererParams } from './cartesianSeriesTooltipOptions';
import type { AgSeriesFormatterParams, AxisOptions, FillOptions, LineDashOptions, StrokeOptions } from './commonOptions';
interface BoxPlotUniqueOptions {
    /** The key to use to retrieve minimum values from the data. */
    minKey: string;
    /** The key to use to retrieve lower quartile values from the data. */
    q1Key: string;
    /** The key to use to retrieve median values from the data. */
    medianKey: string;
    /** The key to use to retrieve upper quartile values from the data. */
    q3Key: string;
    /** The key to use to retrieve maximum values from the data. */
    maxKey: string;
    /** A human-readable description of minimum values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    minName?: string;
    /** A human-readable description of lower quartile values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    q1Name?: string;
    /** A human-readable description of median values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    medianName?: string;
    /** A human-readable description of upper quartile values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    q3Name?: string;
    /** A human-readable description of maximum values. If supplied, this will be shown in the default tooltip and passed to the tooltip renderer as one of the parameters. */
    maxName?: string;
}
export interface AgBoxPlotCapOptions {
    lengthRatio?: Ratio;
}
export type AgBoxPlotWhiskerOptions = StrokeOptions & LineDashOptions;
export type AgBoxPlotSeriesFormatterParams<DatumType> = AgSeriesFormatterParams<DatumType> & Readonly<BoxPlotUniqueOptions & Omit<AxisOptions, 'yKey'> & FillOptions & StrokeOptions>;
export interface AgBoxPlotSeriesTooltipRendererParams extends BoxPlotUniqueOptions, Omit<AgCartesianSeriesTooltipRendererParams, 'yKey'> {
    fill?: CssColor;
}
export interface AgBoxPlotSeriesStyles extends FillOptions, StrokeOptions, LineDashOptions {
    /** Options to style chart's caps */
    cap?: AgBoxPlotCapOptions;
    /** Options to style chart's whiskers */
    whisker?: AgBoxPlotWhiskerOptions;
}
export interface AgBoxPlotSeriesThemeableOptions<DatumType = any> extends AgBaseSeriesThemeableOptions, AgBoxPlotSeriesStyles {
    /**
     * Bar rendering direction.
     * __NOTE__: This option affects the layout direction of X and Y data values.
     */
    direction?: 'horizontal' | 'vertical';
    /** Series-specific tooltip configuration. */
    tooltip?: AgSeriesTooltip<AgCartesianSeriesTooltipRendererParams>;
    /** Function used to return formatting for individual columns, based on the given parameters. If the current column is highlighted, the `highlighted` property will be set to `true`; make sure to check this if you want to differentiate between the highlighted and un-highlighted states. */
    formatter?: (params: AgBoxPlotSeriesFormatterParams<DatumType>) => AgBoxPlotSeriesStyles;
}
export interface AgBoxPlotSeriesOptions<DatumType = any> extends AgBoxPlotSeriesThemeableOptions<DatumType>, AgBaseSeriesOptions<DatumType>, BoxPlotUniqueOptions, Omit<AxisOptions, 'yKey'> {
    /** Configuration for the Box Plot Series. */
    type: 'box-plot';
    /** Whether to group together (adjacently) separate columns. */
    grouped?: boolean;
    /** Human-readable description of the y-values. If supplied, matching items with the same value will be toggled together. */
    legendItemName?: string;
}
export {};
