import {BaseChartOptions, ChartType, ProcessChartOptionsParams} from "ag-grid-community";
import {Chart} from "../../../charts/chart/chart";

export interface CreateChartOptions {
    chartType: ChartType;
    processChartOptions: (params: ProcessChartOptionsParams) => BaseChartOptions;
    width: number;
    height: number;
    showTooltips: boolean;
    parentElement: HTMLElement;
    isDarkTheme: boolean
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

    public abstract update(categoryId: string, fields: { colId: string, displayName: string }[], data: any[]): void;

    public getChart(): Chart {
        return this.chart;
    }

    public destroy(): void {
        this.chart.destroy();
    }
}
