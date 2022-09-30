import { ChartToolPanelName, ChartType, SeriesChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
import { CreateCrossFilterChartParams, CreatePivotChartParams, CreateRangeChartParams } from "../gridApi";
import { CellRangeParams } from "./IRangeService";
import { IAggFunc } from "../entities/colDef";
import { AgChartThemeOverrides, AgChartThemePalette } from "./iAgChartOptions";
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
export interface ChartDownloadParams {
    /** The id of the created chart. */
    chartId: string;
    /** Name of downloaded image file. The chart title will be used by default */
    fileName?: string;
    /**
     * A string indicating the image format.
     * The default format type is `image/png`.
     * Options: `image/png`, `image/jpeg`
     */
    fileFormat?: string;
    /**
     * Dimensions of downloaded chart image in pixels. The current chart dimensions will be used if not specified.
     */
    dimensions?: {
        width: number;
        height: number;
    };
}
export interface CloseChartToolPanelParams {
    /** The id of the created chart. */
    chartId: string;
}
export declare type ChartModelType = 'range' | 'pivot';
export interface OpenChartToolPanelParams {
    /** The id of the created chart. */
    chartId: string;
    /** Name of the Chart Tool Panel. The default 'Settings' Tool Panel will be used if not specified.*/
    panel?: ChartToolPanelName;
}
export interface ChartModel {
    version?: string;
    modelType: ChartModelType;
    chartId: string;
    chartType: ChartType;
    cellRange: CellRangeParams;
    chartThemeName?: string;
    chartOptions: AgChartThemeOverrides;
    chartPalette?: AgChartThemePalette;
    suppressChartRanges?: boolean;
    aggFunc?: string | IAggFunc;
    unlinkChart?: boolean;
    seriesChartTypes?: SeriesChartType[];
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
    downloadChart(params: ChartDownloadParams): void;
    openChartToolPanel(params: OpenChartToolPanelParams): void;
    closeChartToolPanel(chartId: string): void;
}
