import { CreateRangeChartParams, CreatePivotChartParams, ChartRef, ChartType, IChartService } from "@ag-community/grid-core";
export declare class ChartService implements IChartService {
    private rangeController;
    private columnController;
    private environment;
    private context;
    private gridOptionsWrapper;
    private activeCharts;
    createChartFromCurrentRange(chartType?: ChartType): ChartRef | undefined;
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    private createChart;
    private createChartRef;
    private getSelectedRange;
    private destroyAllActiveCharts;
}
