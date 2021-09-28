import { ChartOptions, ChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { CreateCrossFilterChartParams, CreatePivotChartParams, CreateRangeChartParams } from "../gridApi";
import { CellRangeParams } from "./IRangeService";
import { IAggFunc } from "../entities/colDef";
export interface GetChartImageDataUrlParams {
    /** The id of the created chart. */
    chartId: string;
    /**
     * A string indicating the image format.
     * The default format type is `image/png`.
     * Options: `image/png`, `image/jpeg`
     */
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
