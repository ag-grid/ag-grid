import { ChartModel, ChartRef, ChartType, CreatePivotChartParams, CreateRangeChartParams, IChartService, BeanStub } from "@ag-grid-community/core";
export declare class ChartService extends BeanStub implements IChartService {
    private rangeController;
    private columnController;
    private environment;
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
