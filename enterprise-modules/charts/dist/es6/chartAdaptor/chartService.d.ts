import { CreateRangeChartParams, CreatePivotChartParams, ChartRef, ChartType, IChartService, ChartModel } from "@ag-grid-community/core";
export declare class ChartService implements IChartService {
    private rangeController;
    private columnController;
    private environment;
    private context;
    private gridOptionsWrapper;
    private activeCharts;
    private activeChartComps;
    getChartModels(): ChartModel[];
    createChartFromCurrentRange(chartType?: ChartType): ChartRef | undefined;
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    private createChart;
    private createChartRef;
    private getSelectedRange;
    private destroyAllActiveCharts;
}
