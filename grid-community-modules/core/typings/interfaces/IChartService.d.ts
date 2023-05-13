import { ChartToolPanelName, ChartType, CrossFilterChartType, SeriesChartType } from "./iChartOptions";
import { ChartRef } from "../entities/gridOptions";
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
interface CreateChartParams {
    /** The type of chart to create. */
    chartType: ChartType;
    /** The default theme to use, either a default option or your own custom theme. */
    chartThemeName?: string;
    /** Provide to display the chart outside of the grid in your own container. */
    chartContainer?: HTMLElement;
    /** Allows specific chart options in the current theme to be overridden. */
    chartThemeOverrides?: AgChartThemeOverrides;
    /** When enabled the chart will be unlinked from the grid after creation, any updates to the data will not be reflected in the chart. */
    unlinkChart?: boolean;
}
export declare type ChartParamsCellRange = Partial<Omit<CellRangeParams, 'rowStartPinned' | 'rowEndPinned'>>;
export interface CreateRangeChartParams extends CreateChartParams {
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
    /** The series chart type configurations used in combination charts */
    seriesChartTypes?: SeriesChartType[];
}
export interface CreateCrossFilterChartParams extends CreateChartParams {
    /** The type of cross-filter chart to create. */
    chartType: CrossFilterChartType;
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
}
export interface CreatePivotChartParams extends CreateChartParams {
}
export {};
