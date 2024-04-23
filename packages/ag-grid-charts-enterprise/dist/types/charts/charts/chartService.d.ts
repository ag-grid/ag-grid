import { BaseCreateChartParams, BeanStub, ChartDownloadParams, ChartModel, ChartRef, ChartType, CreateCrossFilterChartParams, CreatePivotChartParams, CreateRangeChartParams, GetChartImageDataUrlParams, IAggFunc, IChartService, OpenChartToolPanelParams, PartialCellRange, SeriesChartType, SeriesGroupType, UpdateChartParams } from "ag-grid-community";
import { AgChartThemeOverrides, AgChartThemePalette } from "ag-charts-community";
import { GridChartComp } from "./chartComp/gridChartComp";
export interface CrossFilteringContext {
    lastSelectedChartId: string;
}
export interface CommonCreateChartParams extends BaseCreateChartParams {
    cellRange: PartialCellRange;
    pivotChart?: boolean;
    suppressChartRanges?: boolean;
    switchCategorySeries?: boolean;
    aggFunc?: string | IAggFunc;
    crossFiltering?: boolean;
    chartOptionsToRestore?: AgChartThemeOverrides;
    chartPaletteToRestore?: AgChartThemePalette;
    seriesChartTypes?: SeriesChartType[];
    seriesGroupType?: SeriesGroupType;
}
export declare class ChartService extends BeanStub implements IChartService {
    private columnModel;
    private rangeService?;
    static CHARTS_VERSION: string;
    private activeCharts;
    private activeChartComps;
    private crossFilteringContext;
    isEnterprise: () => boolean;
    updateChart(params: UpdateChartParams): void;
    getChartModels(): ChartModel[];
    getChartRef(chartId: string): ChartRef | undefined;
    getChartComp(chartId: string): GridChartComp | undefined;
    getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined;
    downloadChart(params: ChartDownloadParams): void;
    openChartToolPanel(params: OpenChartToolPanelParams): void;
    closeChartToolPanel(chartId: string): void;
    createChartFromCurrentRange(chartType?: ChartType): ChartRef | undefined;
    restoreChart(model: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;
    createRangeChart(params: CreateRangeChartParams): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams): ChartRef | undefined;
    createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined;
    private createChart;
    private createChartRef;
    private getSelectedRange;
    private generateId;
    private createCellRange;
    private destroyAllActiveCharts;
}
