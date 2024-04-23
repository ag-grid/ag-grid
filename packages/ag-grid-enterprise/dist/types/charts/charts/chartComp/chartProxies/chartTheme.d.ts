import { AgChartTheme, AgChartThemeOverrides } from 'ag-charts-community';
import { ChartProxy, ChartProxyParams } from './chartProxy';
export declare function createAgChartTheme(chartProxyParams: ChartProxyParams, proxy: ChartProxy, isEnterprise: boolean, chartThemeDefaults?: AgChartThemeOverrides, updatedOverrides?: AgChartThemeOverrides): AgChartTheme;
export declare function isStockTheme(themeName: string): boolean;
export declare function lookupCustomChartTheme(chartProxyParams: ChartProxyParams, name: string): AgChartTheme;
