import { AgChartThemeOptions } from '../agChartOptions';
import { ChartTheme } from './chartTheme';
export interface DarkThemeParams {
    seriesLabelDefaults: any;
}
export declare class DarkTheme extends ChartTheme {
    static fontColor: string;
    static mutedFontColor: string;
    static seriesLabelDefaults: {
        label: {
            color: string;
        };
    };
    static seriesDarkThemeOverrides: Record<string, (params: DarkThemeParams) => any>;
    protected getDefaults(): (typeof ChartTheme)['defaults'];
    constructor(options?: AgChartThemeOptions);
}
