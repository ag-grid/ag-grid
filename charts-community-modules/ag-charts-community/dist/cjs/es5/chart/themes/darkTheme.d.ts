import { ChartTheme } from './chartTheme';
import { AgChartThemeOptions } from '../agChartOptions';
export declare class DarkTheme extends ChartTheme {
    protected getDefaults(): (typeof ChartTheme)['defaults'];
    constructor(options?: AgChartThemeOptions);
}
