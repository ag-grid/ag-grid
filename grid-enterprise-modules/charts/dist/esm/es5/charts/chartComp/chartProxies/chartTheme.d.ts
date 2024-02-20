import { AgChartTheme, AgChartThemeOverrides } from 'ag-charts-community';
import { ChartProxy, ChartProxyParams } from './chartProxy';
export declare function createAgChartTheme(chartProxyParams: ChartProxyParams, proxy: ChartProxy): AgChartTheme;
export declare function applyThemeOverrides(baseTheme: AgChartTheme, overrides: Array<AgChartThemeOverrides | null | undefined>): AgChartTheme;
export declare function isStockTheme(themeName: string): boolean;
export declare function lookupCustomChartTheme(chartProxyParams: ChartProxyParams, name: string): AgChartTheme;
