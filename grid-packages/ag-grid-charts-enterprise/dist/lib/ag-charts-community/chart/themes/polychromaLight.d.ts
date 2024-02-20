import type { AgChartThemePalette } from '../../options/agChartOptions';
import { ChartTheme } from './chartTheme';
export declare class PolychromaLight extends ChartTheme {
    protected static getWaterfallSeriesDefaultPositiveColors(): {
        fill: string;
        stroke: string;
        label: {
            color: string;
        };
    };
    protected static getWaterfallSeriesDefaultNegativeColors(): {
        fill: string;
        stroke: string;
        label: {
            color: string;
        };
    };
    protected static getWaterfallSeriesDefaultTotalColors(): {
        fill: string;
        stroke: string;
        label: {
            color: string;
        };
    };
    getTemplateParameters(): {
        extensions: Map<any, any>;
        properties: Map<any, any>;
    };
    protected getPalette(): AgChartThemePalette;
}
