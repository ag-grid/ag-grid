// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ChartType } from "../interfaces/iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { ChartRangeParams } from "../gridApi";
export interface IRangeChartService {
    chartCurrentRange(chartType: ChartType): ChartRef | undefined;
    chartCellRange(params: ChartRangeParams): ChartRef | undefined;
}
