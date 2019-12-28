import { ChartType, ChartOptions } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { CreateRangeChartParams, CreatePivotChartParams } from "../gridApi";
import { CellRangeParams } from "./iRangeController";
export interface ChartModel {
    chartId: string;
    cellRange: CellRangeParams;
    chartType: ChartType;
    chartPalette: string;
    chartOptions: ChartOptions<any>;
}
export interface IChartService {
    getChartModels(): ChartModel[];
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createChartFromCurrentRange(chartType: ChartType): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
}
