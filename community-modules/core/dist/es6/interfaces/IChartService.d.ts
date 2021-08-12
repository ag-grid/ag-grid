// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ChartOptions, ChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { CreateCrossFilterChartParams, CreatePivotChartParams, CreateRangeChartParams } from "../gridApi";
import { CellRangeParams } from "./IRangeService";
import { IAggFunc } from "../entities/colDef";
export interface GetChartImageDataUrlParams {
    chartId: string;
    fileFormat?: string;
}
export declare type ChartModelType = 'range' | 'pivot';
export interface ChartModel {
    modelType: ChartModelType;
    chartId: string;
    chartType: ChartType;
    cellRange: CellRangeParams;
    chartThemeName?: string;
    chartOptions: ChartOptions<any>;
    suppressChartRanges?: boolean;
    aggFunc?: string | IAggFunc;
    unlinkChart?: boolean;
}
export interface IChartService {
    getChartModels(): ChartModel[];
    getChartRef(chartId: string): ChartRef | undefined;
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined;
    createChartFromCurrentRange(chartType: ChartType): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    restoreChart(model: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;
    getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined;
}
