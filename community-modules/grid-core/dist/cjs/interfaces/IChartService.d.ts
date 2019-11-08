// Type definitions for @ag-grid-community/core v22.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { CreateRangeChartParams, CreatePivotChartParams } from "../gridApi";
export interface IChartService {
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createChartFromCurrentRange(chartType: ChartType): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
}
