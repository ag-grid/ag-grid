import {ChartOptions, ChartType} from "ag-grid-community";
import {Chart} from "../../../charts/chart/chart";

export interface ChartProxyOptions {
    chartType: ChartType;
    processChartOptions: (options: ChartOptions) => ChartOptions;
    getPalette: () => number;
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
    protected options: ChartProxyOptions;

    protected constructor(options: ChartProxyOptions) {
        this.options = options;
    }

    public abstract update(params: UpdateChartParams): void;

    public getChart(): Chart {
        return this.chart;
    }

    protected getChartOptions(options: ChartOptions) {
        // allow users to override options before they are applied
        if (this.options.processChartOptions) {
            return this.options.processChartOptions(options);
        }

        return options;
    }

    protected getLabelColor() {
        return this.options.isDarkTheme() ? ChartProxy.darkLabelColour : ChartProxy.lightLabelColour;
    }

    protected getAxisGridColor() {
        return this.options.isDarkTheme() ? ChartProxy.darkAxisColour : ChartProxy.lightAxisColour;
    }

    public destroy(): void {
        this.chart.destroy();
    }
}