import {BaseChartOptions, ChartType} from "ag-grid-community";
import {Chart} from "../../../charts/chart/chart";

export interface CreateChartOptions {
    chartType: ChartType;
    processChartOptions: (options: BaseChartOptions) => BaseChartOptions;
    getPalette: () => number;
    isDarkTheme: () => boolean;
    width: number;
    height: number;
    parentElement: HTMLElement;
}

export interface ChartUpdateParams {
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
    protected options: CreateChartOptions;

    protected constructor(options: CreateChartOptions) {
        this.options = options;
    }

    public abstract create(): ChartProxy;

    public abstract update(params: ChartUpdateParams): void;

    public getChart(): Chart {
        return this.chart;
    }

    protected getChartOptions(defaultOptions: BaseChartOptions) {
        // allow users to override default options
        if (this.options.processChartOptions) {
            return this.options.processChartOptions(defaultOptions);
        }

        return defaultOptions;
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