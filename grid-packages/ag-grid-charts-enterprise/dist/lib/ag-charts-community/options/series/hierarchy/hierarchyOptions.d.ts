import type { AgBaseThemeableChartOptions } from '../../chart/chartOptions';
import type { AgSunburstSeriesOptions } from './sunburstOptions';
import type { AgTreemapSeriesOptions } from './treemapOptions';
export type AgHierarchySeriesOptions = AgTreemapSeriesOptions | AgSunburstSeriesOptions;
export interface AgBaseHierarchyChartOptions {
    /** Series configurations. */
    series?: AgHierarchySeriesOptions[];
}
export interface AgBaseHierarchyThemeOptions extends AgBaseThemeableChartOptions {
}
