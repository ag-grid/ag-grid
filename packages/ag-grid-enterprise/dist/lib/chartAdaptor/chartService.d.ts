// ag-grid-enterprise v21.2.2
import { ChartRangeParams, ChartRef, ChartType, IChartService } from "ag-grid-community";
export declare class ChartService implements IChartService {
    private rangeController;
    private columnController;
    private environment;
    private context;
    private gridOptionsWrapper;
    private activeCharts;
    chartCurrentRange(chartType?: ChartType): ChartRef | undefined;
    chartCellRange(params: ChartRangeParams): ChartRef | undefined;
    pivotChart(chartType?: ChartType): ChartRef | undefined;
    private chartRange;
    private createChartRef;
    private getSelectedRange;
    private destroyAllActiveCharts;
}
