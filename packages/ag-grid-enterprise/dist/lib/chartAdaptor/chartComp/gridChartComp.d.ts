// ag-grid-enterprise v21.1.0
import { CellRange, ChartOptions, ChartType, Component, ProcessChartOptionsParams } from "ag-grid-community";
export interface GridChartParams {
    cellRange: CellRange;
    chartType: ChartType;
    insideDialog: boolean;
    suppressChartRanges: boolean;
    aggregate: boolean;
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions;
    height: number;
    width: number;
}
export declare class GridChartComp extends Component {
    private static TEMPLATE;
    private resizeObserverService;
    private gridOptionsWrapper;
    private environment;
    private eChartComponentsWrapper;
    private eChart;
    private eDockedContainer;
    private chartMenu;
    private chartDialog;
    private model;
    private chartController;
    private currentChartType;
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
    getChartComponentsWrapper(): HTMLElement;
    getDockedContainer(): HTMLElement;
    slideDockedOut(width: number): void;
    slideDockedIn(): void;
    getCurrentChartType(): ChartType;
    updateChart(): void;
    private downloadChart;
    refreshCanvasSize(): void;
    private addResizeListener;
    private setActiveChartCellRange;
    destroy(): void;
}
