import type { FillOptions } from '../cartesian/commonOptions';
import type { AgBaseRadarSeriesOptions, AgRadarSeriesThemeableOptions } from './radarOptions';
export interface AgRadarAreaSeriesThemeableOptions<DatumType = any> extends FillOptions, AgRadarSeriesThemeableOptions<DatumType> {
}
export interface AgRadarAreaSeriesOptions<DatumType = any> extends AgRadarAreaSeriesThemeableOptions<DatumType>, AgBaseRadarSeriesOptions<DatumType> {
    /** Configuration for the Radar Area Series. */
    type: 'radar-area';
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
