// ag-grid-enterprise v21.2.2
import { CellRange, ChartOptions, ChartType, Component, IAggFunc, ProcessChartOptionsParams } from "ag-grid-community";
export interface GridChartParams {
    pivotChart: boolean;
    cellRange: CellRange;
    chartType: ChartType;
    insideDialog: boolean;
    suppressChartRanges: boolean;
    aggFunc?: string | IAggFunc;
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions;
    height: number;
    width: number;
}
export declare class GridChartComp extends Component {
    private static TEMPLATE;
    private eChart;
    private eChartComponentsWrapper;
    private eDockedContainer;
    private eEmpty;
    private resizeObserverService;
    private gridOptionsWrapper;
    private environment;
    private chartTranslator;
    private eventService;
    private chartMenu;
    private chartDialog;
    private model;
    private chartController;
    private currentChartType;
    private currentChartGroupingActive;
    private chartProxy;
    private readonly params;
    constructor(params: GridChartParams);
    init(): void;
    private createChart;
    private getSelectedPalette;
    private createChartProxy;
    private addDialog;
    private addMenu;
    private refresh;
    private shouldRecreateChart;
    getChartComponentsWrapper(): HTMLElement;
    getDockedContainer(): HTMLElement;
    slideDockedOut(width: number): void;
    slideDockedIn(): void;
    getCurrentChartType(): ChartType;
    updateChart(): void;
    private handleEmptyChart;
    private downloadChart;
    refreshCanvasSize(): void;
    private addResizeListener;
    private setActiveChartCellRange;
    private isXYChart;
    destroy(): void;
}
