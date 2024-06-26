import type { BaseCreateChartParams, BeanCollection, ChartDownloadParams, ChartModel, ChartRef, ChartType, CreateCrossFilterChartParams, CreatePivotChartParams, CreateRangeChartParams, GetChartImageDataUrlParams, IAggFunc, IChartService, NamedBean, OpenChartToolPanelParams, PartialCellRange, SeriesChartType, SeriesGroupType, UpdateChartParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { AgChartThemeOverrides, AgChartThemePalette } from 'ag-charts-community';
import { GridChartComp } from './chartComp/gridChartComp';
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
    focusDialogOnOpen?: boolean;
}
export declare class ChartService extends BeanStub implements NamedBean, IChartService {
    beanName: "chartService";
    private visibleColsService;
    private rangeService?;
    private environment;
    private focusService;
    wireBeans(beans: BeanCollection): void;
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
    createChartFromCurrentRange(chartType?: ChartType, fromApi?: boolean): ChartRef | undefined;
    restoreChart(model: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined;
    createRangeChart(params: CreateRangeChartParams, fromApi?: boolean): ChartRef | undefined;
    createPivotChart(params: CreatePivotChartParams, fromApi?: boolean): ChartRef | undefined;
    createCrossFilterChart(params: CreateCrossFilterChartParams, fromApi?: boolean): ChartRef | undefined;
    private createChart;
    private createChartRef;
    private getSelectedRange;
    private generateId;
    private createCellRange;
    destroy(): void;
}
