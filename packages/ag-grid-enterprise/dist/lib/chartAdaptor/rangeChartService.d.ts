// ag-grid-enterprise v21.0.1
import { ChartRangeParams, ChartRef, ChartType, IRangeChartService } from "ag-grid-community";
export declare class RangeChartService implements IRangeChartService {
    private rangeController;
    private context;
    private gridOptionsWrapper;
    private activeCharts;
    chartCurrentRange(chartType?: ChartType): ChartRef | undefined;
    chartCellRange(params: ChartRangeParams): ChartRef | undefined;
    private chartRange;
    private createChartRef;
    private getSelectedRange;
    private destroyAllActiveCharts;
}
