import {CellRangeParams} from "./iRangeController";

export interface IRangeChartService {
    chartCellRangeParams(params: CellRangeParams, chartType: string): void;
}
