import { CellRangeParams } from "./iRangeController";
import { ChartType } from "../charts/chartType";

export interface IRangeChartService {
    chartCurrentRange(chartType: ChartType): void;
    chartCellRangeParams(params: CellRangeParams, chartTypeString: string): void;
    chartCellRangeParams(params: CellRangeParams, chartType: string): void;
}