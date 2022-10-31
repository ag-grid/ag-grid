import { AgChartOptions, AgCartesianChartOptions, AgPolarChartOptions, AgHierarchyChartOptions } from './agChartOptions';
import { CartesianChart } from './cartesianChart';
import { PolarChart } from './polarChart';
import { HierarchyChart } from './hierarchyChart';
import { Chart } from './chart';
import { GroupedCategoryChart } from './groupedCategoryChart';
declare type ChartType = CartesianChart | PolarChart | HierarchyChart;
export declare type AgChartType<T> = T extends AgCartesianChartOptions ? CartesianChart : T extends AgPolarChartOptions ? PolarChart : T extends AgHierarchyChartOptions ? HierarchyChart : never;
declare type ChartOptionType<T extends ChartType> = T extends GroupedCategoryChart ? AgCartesianChartOptions : T extends CartesianChart ? AgCartesianChartOptions : T extends PolarChart ? AgPolarChartOptions : T extends HierarchyChart ? AgHierarchyChartOptions : never;
declare type DownloadOptions = {
    width?: number;
    height?: number;
    fileName?: string;
    /** The standard MIME type for the image format to return. If you do not specify this parameter, the default value is a PNG format image. See `Canvas.toDataURL()` */
    fileFormat?: string;
};
export declare abstract class AgChart {
    /** @deprecated use AgChart.create() or AgChart.update() instead. */
    static createComponent(options: any, type: string): any;
    static create<T extends AgChartOptions>(options: T, _container?: HTMLElement, _data?: any[]): AgChartType<T>;
    static update<T extends AgChartOptions>(chart: AgChartType<T>, options: T, _container?: HTMLElement, _data?: any[]): void;
    static download<T extends AgChartOptions>(chart: AgChartType<T>, options?: DownloadOptions): void;
}
export declare abstract class AgChartV2 {
    static DEBUG: () => any;
    static create<T extends ChartType>(userOptions: ChartOptionType<T> & {
        overrideDevicePixelRatio?: number;
    }): T;
    static update<T extends ChartType>(chart: Chart, userOptions: ChartOptionType<T>): void;
    /**
     * Returns the content of the current canvas as an image.
     * @param opts The download options including `width` and `height` of the image as well as `fileName` and `fileFormat`.
     */
    static download(chart: Chart, opts?: DownloadOptions): void;
    private static updateDelta;
}
export {};
