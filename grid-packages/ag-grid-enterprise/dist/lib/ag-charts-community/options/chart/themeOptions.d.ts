import type { AgAreaSeriesThemeableOptions } from '../series/cartesian/areaOptions';
import type { AgBarSeriesThemeableOptions } from '../series/cartesian/barOptions';
import type { AgBoxPlotSeriesThemeableOptions } from '../series/cartesian/boxPlotOptions';
import type { AgBubbleSeriesThemeableOptions } from '../series/cartesian/bubbleOptions';
import type { AgBulletSeriesThemeableOptions } from '../series/cartesian/bulletOptions';
import type { AgBaseCartesianThemeOptions, AgCartesianAxesTheme } from '../series/cartesian/cartesianOptions';
import type { AgHeatmapSeriesThemeableOptions } from '../series/cartesian/heatmapOptions';
import type { AgHistogramSeriesThemeableOptions } from '../series/cartesian/histogramOptions';
import type { AgLineSeriesThemeableOptions } from '../series/cartesian/lineOptions';
import type { AgRangeAreaSeriesThemeableOptions } from '../series/cartesian/rangeAreaOptions';
import type { AgRangeBarSeriesThemeableOptions } from '../series/cartesian/rangeBarOptions';
import type { AgScatterSeriesThemeableOptions } from '../series/cartesian/scatterOptions';
import type { AgWaterfallSeriesThemeableOptions } from '../series/cartesian/waterfallOptions';
import type { AgBaseHierarchyThemeOptions } from '../series/hierarchy/hierarchyOptions';
import type { AgSunburstSeriesThemeableOptions } from '../series/hierarchy/sunburstOptions';
import type { AgTreemapSeriesThemeableOptions } from '../series/hierarchy/treemapOptions';
import type { AgNightingaleSeriesThemeableOptions } from '../series/polar/nightingaleOptions';
import type { AgPieSeriesThemeableOptions } from '../series/polar/pieOptions';
import type { AgBasePolarThemeOptions, AgPolarAxesTheme } from '../series/polar/polarOptions';
import type { AgRadarAreaSeriesThemeableOptions } from '../series/polar/radarAreaOptions';
import type { AgRadarSeriesThemeableOptions } from '../series/polar/radarOptions';
import type { AgRadialBarSeriesThemeableOptions } from '../series/polar/radialBarOptions';
import type { AgRadialColumnSeriesThemeableOptions } from '../series/polar/radialColumnOptions';
import type { AgBaseThemeableChartOptions } from './chartOptions';
export type AgChartThemeName = 'ag-default' | 'ag-default-dark' | 'ag-sheets' | 'ag-sheets-dark' | 'ag-polychroma' | 'ag-polychroma-dark' | 'ag-vivid' | 'ag-vivid-dark' | 'ag-material' | 'ag-material-dark';
export interface AgChartThemePalette {
    /** The array of fills to be used. */
    fills: string[];
    /** The array of strokes to be used. */
    strokes: string[];
}
export interface AgBaseChartThemeOptions {
    /** The palette to use. If specified, this replaces the palette from the base theme. */
    palette?: AgChartThemePalette;
    /** Configuration from this object is merged over the defaults specified in the base theme. */
    overrides?: AgBaseChartThemeOverrides;
}
/** This object is used to define the configuration for a custom chart theme. */
export interface AgChartTheme extends AgBaseChartThemeOptions {
    /** The name of the theme to base your theme on. Your custom theme will inherit all the configuration from the base theme, allowing you to override just the settings you wish to change using the `overrides` config (see below). */
    baseTheme?: AgChartThemeName;
}
export interface AgLineSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgLineSeriesThemeableOptions;
}
export interface AgScatterSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgScatterSeriesThemeableOptions;
}
export interface AgBubbleSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgBubbleSeriesThemeableOptions;
}
export interface AgAreaSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgAreaSeriesThemeableOptions;
}
export interface AgBarSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgBarSeriesThemeableOptions;
}
export interface AgBoxPlotSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgBoxPlotSeriesThemeableOptions;
}
export interface AgHistogramSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgHistogramSeriesThemeableOptions;
}
export interface AgHeatmapSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgHeatmapSeriesThemeableOptions;
}
export interface AgWaterfallSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgWaterfallSeriesThemeableOptions;
}
export interface AgRangeBarSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgRangeBarSeriesThemeableOptions;
}
export interface AgRangeAreaSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgRangeAreaSeriesThemeableOptions;
}
export interface AgBulletSeriesThemeOverrides extends AgBaseCartesianThemeOptions {
    series?: AgBulletSeriesThemeableOptions;
}
export interface AgPieSeriesThemeOverrides extends AgBasePolarThemeOptions {
    series?: AgPieSeriesThemeableOptions;
}
export interface AgRadarLineSeriesThemeOverrides extends AgBasePolarThemeOptions {
    series?: AgRadarSeriesThemeableOptions;
}
export interface AgRadarAreaSeriesThemeOverrides extends AgBasePolarThemeOptions {
    series?: AgRadarAreaSeriesThemeableOptions;
}
export interface AgRadialBarSeriesThemeOverrides extends AgBasePolarThemeOptions {
    series?: AgRadialBarSeriesThemeableOptions;
}
export interface AgRadialColumnSeriesThemeOverrides extends AgBasePolarThemeOptions {
    series?: AgRadialColumnSeriesThemeableOptions;
}
export interface AgNightingaleSeriesThemeOverrides extends AgBasePolarThemeOptions {
    series?: AgNightingaleSeriesThemeableOptions;
}
export interface AgSunburstSeriesThemeOverrides extends AgBaseHierarchyThemeOptions {
    series?: AgSunburstSeriesThemeableOptions;
}
export interface AgTreemapSeriesThemeOverrides extends AgBaseHierarchyThemeOptions {
    series?: AgTreemapSeriesThemeableOptions;
}
export interface AgCommonThemeableAxisOptions extends AgCartesianAxesTheme, AgPolarAxesTheme {
}
export interface AgCommonThemeableChartOptions extends AgBaseThemeableChartOptions {
    axes?: AgCommonThemeableAxisOptions;
}
export interface AgBaseChartThemeOverrides {
    /** Common theme overrides for series. */
    common?: AgCommonThemeableChartOptions;
    /** Line series theme overrides. */
    line?: AgLineSeriesThemeOverrides;
    /** Scatter series theme overrides. */
    scatter?: AgScatterSeriesThemeOverrides;
    /** Bubble series theme overrides. */
    bubble?: AgBubbleSeriesThemeOverrides;
    /** Area series theme overrides. */
    area?: AgAreaSeriesThemeOverrides;
    /** Bar series theme overrides. */
    bar?: AgBarSeriesThemeOverrides;
    /** Box-plot series theme overrides. */
    'box-plot'?: AgBoxPlotSeriesThemeOverrides;
    /** Histogram series theme overrides. */
    histogram?: AgHistogramSeriesThemeOverrides;
    /** Heatmap series theme overrides. */
    heatmap?: AgHeatmapSeriesThemeOverrides;
    /** Waterfall series theme overrides. */
    waterfall?: AgWaterfallSeriesThemeOverrides;
    /** Range-bar series theme overrides. */
    'range-bar'?: AgRangeBarSeriesThemeOverrides;
    /** Range-area series theme overrides. */
    'range-area'?: AgRangeAreaSeriesThemeOverrides;
    bullet?: AgBulletSeriesThemeOverrides;
    /** Pie series theme overrides. */
    pie?: AgPieSeriesThemeOverrides;
    /** Radar-line series theme overrides. */
    'radar-line'?: AgRadarLineSeriesThemeOverrides;
    /** Radar-area series theme overrides. */
    'radar-area'?: AgRadarAreaSeriesThemeOverrides;
    /** Radial-bar series theme overrides. */
    'radial-bar'?: AgRadialBarSeriesThemeOverrides;
    /** Radial-column series theme overrides. */
    'radial-column'?: AgRadialColumnSeriesThemeOverrides;
    /** Nightingale series theme overrides. */
    nightingale?: AgNightingaleSeriesThemeOverrides;
    /** Sunburst series theme overrides. */
    sunburst?: AgSunburstSeriesThemeOverrides;
    /** Treemap series theme overrides. */
    treemap?: AgTreemapSeriesThemeOverrides;
}
