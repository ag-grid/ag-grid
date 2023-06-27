import { AgBaseRadarSeriesOptions } from '../radar/typings';

export interface AgRadarLineSeriesOptions<DatumType = any> extends AgBaseRadarSeriesOptions<DatumType> {
    type?: 'radar-line';
}

/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export const __FORCE_MODULE_DETECTION = 0;
