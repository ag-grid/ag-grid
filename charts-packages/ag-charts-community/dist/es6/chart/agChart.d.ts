import { ChartTheme } from "./themes/chartTheme";
import { AgCartesianChartOptions, AgChartOptions, AgPolarChartOptions, AgChartTheme, AgChartThemeName } from "./agChartOptions";
import { CartesianChart } from "./cartesianChart";
import { PolarChart } from "./polarChart";
declare type ThemeMap = {
    [key in AgChartThemeName | 'undefined' | 'null']?: ChartTheme;
};
export declare const lightThemes: ThemeMap;
export declare const darkThemes: ThemeMap;
export declare const themes: ThemeMap;
export declare function getChartTheme(value?: string | ChartTheme | AgChartTheme): ChartTheme;
declare type AgChartType<T> = T extends AgCartesianChartOptions ? CartesianChart : T extends AgPolarChartOptions ? PolarChart : never;
export declare abstract class AgChart {
    static create<T extends AgChartOptions>(options: T, container?: HTMLElement, data?: any[]): AgChartType<T>;
    static update<T extends AgChartOptions>(chart: AgChartType<T>, options: T, container?: HTMLElement, data?: any[]): void;
    static save(component: any): any;
    static createComponent: typeof create;
}
declare function create(options: any, path?: string, component?: any, theme?: ChartTheme): any;
export {};
