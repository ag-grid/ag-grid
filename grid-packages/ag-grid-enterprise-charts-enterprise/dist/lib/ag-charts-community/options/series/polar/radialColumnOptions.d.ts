import type { Ratio } from '../../chart/types';
import type { AgBaseSeriesOptions } from '../seriesOptions';
import type { AgBaseRadialSeriesThemeableOptions, AgRadialSeriesOptionsKeys, AgRadialSeriesOptionsNames } from './radialOptions';
export interface AgBaseRadialColumnSeriesOptions<TDatum = any> extends AgBaseSeriesOptions<TDatum>, AgRadialSeriesOptionsKeys, AgRadialSeriesOptionsNames, AgBaseRadialSeriesThemeableOptions<TDatum> {
    /** Base configuration for Radial Column series. */
    type: 'radial-column' | 'nightingale';
    /** The number to normalise the bar stacks to. Has no effect unless series are stacked. */
    normalizedTo?: number;
    /** Whether to group together (adjacently) separate sectors. */
    grouped?: boolean;
    /** An option indicating if the sectors should be stacked. */
    stacked?: boolean;
    /** An ID to be used to group stacked items. */
    stackGroup?: string;
}
export interface AgRadialColumnSeriesThemeableOptions<TDatum = any> extends AgBaseRadialSeriesThemeableOptions<TDatum> {
    /** The ratio used to calculate the column width based on the circumference and padding between items. */
    columnWidthRatio?: Ratio;
    /** Prevents columns from becoming too wide. This value is relative to the diameter of the polar chart. */
    maxColumnWidthRatio?: Ratio;
}
export interface AgRadialColumnSeriesOptions<TDatum = any> extends AgRadialColumnSeriesThemeableOptions<TDatum>, AgBaseRadialColumnSeriesOptions<TDatum> {
    /** Configuration for Radial Column Series. */
    type: 'radial-column';
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
