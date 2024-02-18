import type { AgBaseThemeableChartOptions } from '../../chart/chartOptions';
import type { AgAngleCategoryAxisOptions, AgAngleNumberAxisOptions } from '../../chart/polarAxisOptions';
import type { AgRadiusCategoryAxisOptions, AgRadiusNumberAxisOptions } from '../../chart/radiusAxisOptions';
import type { AgDonutSeriesOptions } from './donutOptions';
import type { AgNightingaleSeriesOptions } from './nightingaleOptions';
import type { AgPieSeriesOptions } from './pieOptions';
import type { AgRadarAreaSeriesOptions } from './radarAreaOptions';
import type { AgRadarLineSeriesOptions } from './radarLineOptions';
import type { AgRadialBarSeriesOptions } from './radialBarOptions';
import type { AgRadialColumnSeriesOptions } from './radialColumnOptions';
export type AgPolarSeriesOptions = AgDonutSeriesOptions | AgPieSeriesOptions | AgRadarLineSeriesOptions | AgRadarAreaSeriesOptions | AgRadialBarSeriesOptions | AgRadialColumnSeriesOptions | AgNightingaleSeriesOptions;
export type AgPolarAxisOptions = AgAngleCategoryAxisOptions | AgAngleNumberAxisOptions | AgRadiusCategoryAxisOptions | AgRadiusNumberAxisOptions;
export interface AgBasePolarChartOptions {
    /** Series configurations. */
    series?: AgPolarSeriesOptions[];
    /** Axis configurations. */
    axes?: AgPolarAxisOptions[];
}
export interface AgAngleCategoryAxisThemeOptions extends Omit<AgAngleCategoryAxisOptions, 'type'> {
    /** @deprecated v9.1 omit this field, it is redundant */
    type?: 'angle-category';
}
export interface AgAngleNumberAxisThemeOptions extends Omit<AgAngleNumberAxisOptions, 'type'> {
    /** @deprecated v9.1 omit this field, it is redundant */
    type?: 'angle-number';
}
export interface AgRadiusCategoryAxisThemeOptions extends Omit<AgRadiusCategoryAxisOptions, 'type'> {
    /** @deprecated v9.1 omit this field, it is redundant */
    type?: 'radius-category';
}
export interface AgRadiusNumberAxisThemeOptions extends Omit<AgRadiusNumberAxisOptions, 'type'> {
    /** @deprecated v9.1 omit this field, it is redundant */
    type?: 'radius-number';
}
export interface AgPolarAxesTheme {
    'angle-category'?: AgAngleCategoryAxisThemeOptions;
    'angle-number'?: AgAngleNumberAxisThemeOptions;
    'radius-category'?: AgRadiusCategoryAxisThemeOptions;
    'radius-number'?: AgRadiusNumberAxisThemeOptions;
}
export interface AgBasePolarThemeOptions extends AgBaseThemeableChartOptions {
    /** Axis configurations. */
    axes?: AgPolarAxesTheme;
}
