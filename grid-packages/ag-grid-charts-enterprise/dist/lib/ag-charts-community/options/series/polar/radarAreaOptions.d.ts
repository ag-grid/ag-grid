import type { FillOptions } from '../cartesian/commonOptions';
import type { AgBaseRadarSeriesOptions, AgRadarSeriesThemeableOptions } from './radarOptions';
export interface AgRadarAreaSeriesThemeableOptions<TDatum = any> extends FillOptions, AgRadarSeriesThemeableOptions<TDatum> {
}
export interface AgRadarAreaSeriesOptions<TDatum = any> extends AgRadarAreaSeriesThemeableOptions<TDatum>, AgBaseRadarSeriesOptions<TDatum> {
    /** Configuration for the Radar Area Series. */
    type: 'radar-area';
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
