import {BaseChartOptions, ChartType, ProcessChartOptionsParams} from "ag-grid-community";
import {Chart} from "../../../charts/chart/chart";

export interface CreateChartOptions {
    chartType: ChartType;
    processChartOptions: (params: ProcessChartOptionsParams) => BaseChartOptions;
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

export enum ChartOptionsType {BAR = 'bar', LINE = 'line', POLAR = 'polar'}

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

    protected getChartOptions(type: string, defaultOptions: BaseChartOptions) {
        // allow user to override options
        if (this.options.processChartOptions) {
            const params: ProcessChartOptionsParams = {type: 'bar', options: defaultOptions};
            return this.options.processChartOptions(params);
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
