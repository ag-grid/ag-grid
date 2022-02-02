import { ChartTheme } from "./themes/chartTheme";
import { AgCartesianChartOptions, AgChartOptions, AgPolarChartOptions, AgChartTheme, AgChartThemeName, AgHierarchyChartOptions, AgCartesianSeriesOptions, AgPolarSeriesOptions, AgHierarchySeriesOptions } from "./agChartOptions";
import { CartesianChart } from "./cartesianChart";
import { PolarChart } from "./polarChart";
import { HierarchyChart } from "./hierarchyChart";
declare type ThemeMap = {
    [key in AgChartThemeName | 'undefined' | 'null']?: ChartTheme;
};
declare type SeriesOptions = AgCartesianSeriesOptions | AgPolarSeriesOptions | AgHierarchySeriesOptions;
export declare const lightThemes: ThemeMap;
export declare const darkThemes: ThemeMap;
export declare const themes: ThemeMap;
export declare function getChartTheme(value?: string | ChartTheme | AgChartTheme): ChartTheme;
declare type AgChartType<T> = T extends AgCartesianChartOptions ? CartesianChart : T extends AgPolarChartOptions ? PolarChart : T extends AgHierarchyChartOptions ? HierarchyChart : never;
export declare abstract class AgChart {
    static create<T extends AgChartOptions>(options: T, container?: HTMLElement, data?: any[]): AgChartType<T>;
    static update<T extends AgChartOptions>(chart: AgChartType<T>, options: T, container?: HTMLElement, data?: any[]): void;
    static createComponent: typeof create;
    private static createOrUpdate;
}
declare function create(options: any, path?: string, component?: any, theme?: ChartTheme): any;
/**
 * Groups the series options objects if they are of type `column` or `bar` and places them in an array at the index where the first instance of this series type was found.
 * Returns an array of arrays containing the ordered and grouped series options objects.
 */
export declare function groupSeriesByType(seriesOptions: SeriesOptions[]): SeriesOptions[][];
/**
 * Takes an array of bar or area series options objects and returns a single object with the combined area series options.
 */
export declare function reduceSeries(series: any[], enableBarSeriesSpecialCases: boolean): any;
/**
 * Transforms provided series options array into an array containing series options which are compatible with standalone charts series options.
 */
export declare function processSeriesOptions(seriesOptions: SeriesOptions[]): SeriesOptions[];
export {};
