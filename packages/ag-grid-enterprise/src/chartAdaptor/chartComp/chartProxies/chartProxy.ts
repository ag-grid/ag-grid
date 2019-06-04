import { ChartOptions, ChartType, ProcessChartOptionsParams } from "ag-grid-community";
import { Chart } from "../../../charts/chart/chart";
import { Palette } from "../../../charts/chart/palettes";

export interface ChartProxyParams {
    chartType: ChartType;
    processChartOptions: (params: ProcessChartOptionsParams) => ChartOptions;
    getSelectedPalette: () => Palette;
    isDarkTheme: () => boolean;
    width: number;
    height: number;
    parentElement: HTMLElement;
}

export interface UpdateChartParams {
    categoryId: string;
    fields: { colId: string, displayName: string }[];
    data: any[];
}

export abstract class ChartProxy {
    protected static darkLabelColour = 'rgb(221, 221, 221)';
    protected static lightLabelColour = 'rgb(87, 87, 87)';

    protected static darkAxisColour = 'rgb(100, 100, 100)';
    protected static lightAxisColour = 'rgb(219, 219, 219)';

    protected chart: Chart;
    protected chartProxyParams: ChartProxyParams;
    protected overriddenPalette: Palette;

    protected constructor(options: ChartProxyParams) {
        this.chartProxyParams = options;
    }

    public abstract update(params: UpdateChartParams): void;

    public getChart(): Chart {
        return this.chart;
    }

    protected getLabelColor(): string {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour;
    }

    protected getAxisGridColor(): string {
        return this.chartProxyParams.isDarkTheme() ? ChartProxy.darkAxisColour : ChartProxy.lightAxisColour;
    }

    protected getChartOptions(type: string, options: ChartOptions): ChartOptions {
        // allow users to override options before they are applied
        if (this.chartProxyParams.processChartOptions) {
            const params: ProcessChartOptionsParams = {type: type, options: options};
            const overriddenOptions = this.chartProxyParams.processChartOptions(params);
            this.overridePalette(overriddenOptions);
            return overriddenOptions;
        }

        return options;
    }

    private overridePalette(chartOptions: any) {
        const seriesDefaults = chartOptions.seriesDefaults;

        const palette = this.chartProxyParams.getSelectedPalette();
        const defaultFills = palette.fills;
        const defaultStrokes = palette.strokes;

        const fillsOverridden = seriesDefaults.fills !== defaultFills;
        const strokesOverridden = seriesDefaults.strokes !== defaultStrokes;

        if (fillsOverridden || strokesOverridden) {
            this.overriddenPalette = {
                fills: fillsOverridden && seriesDefaults.fills ? seriesDefaults.fills : defaultFills,
                strokes: strokesOverridden && seriesDefaults.strokes ? seriesDefaults.strokes : defaultStrokes
            };
        }
    }

    public destroy(): void {
        this.chart.destroy();
    }
}