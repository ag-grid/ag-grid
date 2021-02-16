import { ChartOptions, ChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { CreateCrossFilterChartParams, CreatePivotChartParams, CreateRangeChartParams } from "../gridApi";
import { CellRangeParams } from "./iRangeController";
import { IAggFunc } from "../entities/colDef";
export interface GetChartImageDataUrlParams {
    type?: string;
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
    chart: any;
    getChartImageDataURL: (params: GetChartImageDataUrlParams) => string;
}
export interface IChartService {
    getChartModels(): ChartModel[];
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined;
    createChartFromCurrentRange(chartType: ChartType): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    restoreChart(model: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;
}
