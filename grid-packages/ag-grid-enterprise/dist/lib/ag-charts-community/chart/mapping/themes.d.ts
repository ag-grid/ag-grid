import type { AgChartThemeName } from '../../options/agChartOptions';
import { ChartTheme } from '../themes/chartTheme';
export type ThemeMap = {
    [key in AgChartThemeName | 'undefined' | 'null']?: () => ChartTheme;
};
export declare const themes: ThemeMap;
export declare function getChartTheme(unvalidatedValue: unknown): ChartTheme;
