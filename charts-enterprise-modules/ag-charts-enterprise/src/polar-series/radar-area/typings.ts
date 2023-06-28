import { CssColor, Opacity } from 'ag-charts-community';
import { AgBaseRadarSeriesOptions } from '../radar/typings';

export interface AgRadarAreaSeriesOptions<DatumType = any> extends AgBaseRadarSeriesOptions<DatumType> {
    type?: 'radar-area';
    /** The colour to use for the fill of the area. */
    fill?: CssColor;
    /** The opacity of the fill for the area. */
    fillOpacity?: Opacity;
}

/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export const __FORCE_MODULE_DETECTION = 0;
