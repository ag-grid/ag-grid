import { BeanStub, ChartDownloadParams, ChartModel, ChartRef, ChartType, CreateCrossFilterChartParams, CreatePivotChartParams, CreateRangeChartParams, GetChartImageDataUrlParams, IChartService, OpenChartToolPanelParams, UpdateChartParams } from "ag-grid-community";
import { GridChartComp } from "./chartComp/gridChartComp";
export interface CrossFilteringContext {
    lastSelectedChartId: string;
}
export declare class ChartService extends BeanStub implements IChartService {
    private rangeService;
    private columnModel;
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
    private destroyAllActiveCharts;
}
