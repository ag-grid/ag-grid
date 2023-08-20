import type { AgChartThemeOptions } from '../agChartOptions';
import { ChartTheme } from './chartTheme';
export declare class DarkTheme extends ChartTheme {
    static fontColor: string;
    static mutedFontColor: string;
    static seriesLabelDefaults: {
        label: {
            color: string;
        };
    };
    protected getDefaults(): (typeof ChartTheme)['defaults'];
    protected getTemplateParameters(): {
        extensions: Map<any, any>;
        properties: Map<any, any>;
    };
    constructor(options?: AgChartThemeOptions);
}
//# sourceMappingURL=darkTheme.d.ts.map