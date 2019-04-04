import { CellRangeParams } from "./iRangeController";
import { ChartType } from "../charts/chartType";
import {ChartRef} from "../entities/gridOptions";

export interface IRangeChartService {
    chartCurrentRange(chartType: ChartType): ChartRef | undefined;
    chartCellRange(params: CellRangeParams, chartType: string, container: HTMLElement): ChartRef | undefined;
}