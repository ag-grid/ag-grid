import { ChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { CreateRangeChartParams, CreatePivotChartParams } from "../gridApi";
export interface IChartService {
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createChartFromCurrentRange(chartType: ChartType): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
}
