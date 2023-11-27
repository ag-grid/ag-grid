import type { AgBaseThemeableChartOptions } from '../../chart/chartOptions';
import type { AgAngleCategoryAxisOptions, AgAngleNumberAxisOptions } from '../../chart/polarAxisOptions';
import type { AgRadiusCategoryAxisOptions, AgRadiusNumberAxisOptions } from '../../chart/radiusAxisOptions';
import type { AgNightingaleSeriesOptions } from './nightingaleOptions';
import type { AgPieSeriesOptions } from './pieOptions';
import type { AgRadarAreaSeriesOptions } from './radarAreaOptions';
import type { AgRadarLineSeriesOptions } from './radarLineOptions';
import type { AgRadialBarSeriesOptions } from './radialBarOptions';
import type { AgRadialColumnSeriesOptions } from './radialColumnOptions';
export type AgPolarSeriesOptions = AgPieSeriesOptions | AgRadarLineSeriesOptions | AgRadarAreaSeriesOptions | AgRadialBarSeriesOptions | AgRadialColumnSeriesOptions | AgNightingaleSeriesOptions;
export type AgPolarAxisOptions = AgAngleCategoryAxisOptions | AgAngleNumberAxisOptions | AgRadiusCategoryAxisOptions | AgRadiusNumberAxisOptions;
export interface AgBasePolarChartOptions {
    /** Series configurations. */
    series?: AgPolarSeriesOptions[];
    /** Axis configurations. */
    axes?: AgPolarAxisOptions[];
}
export interface AgPolarAxesTheme {
    'angle-category'?: AgAngleCategoryAxisOptions;
    'angle-number'?: AgAngleNumberAxisOptions;
    'radius-category'?: AgRadiusCategoryAxisOptions;
    'radius-number'?: AgRadiusNumberAxisOptions;
}
export interface AgBasePolarThemeOptions extends AgBaseThemeableChartOptions {
    /** Axis configurations. */
    axes?: AgPolarAxesTheme;
}
