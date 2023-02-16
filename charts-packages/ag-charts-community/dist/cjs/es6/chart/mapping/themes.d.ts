import { ChartTheme } from '../themes/chartTheme';
import { AgChartTheme, AgChartThemeName } from '../agChartOptions';
declare type ThemeMap = {
    [key in AgChartThemeName | 'undefined' | 'null']?: ChartTheme;
};
export declare const themes: ThemeMap;
export declare function getChartTheme(value?: string | ChartTheme | AgChartTheme): ChartTheme;
export {};
