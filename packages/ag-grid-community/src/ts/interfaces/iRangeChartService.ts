import { CellRangeParams } from "./iRangeController";
import { ChartType } from "../charts/chartType";

export interface IRangeChartService {
    chartCurrentRange(chartType: ChartType): void;
    chartCellRange(params: CellRangeParams, chartType: string, container: HTMLElement): void;
}