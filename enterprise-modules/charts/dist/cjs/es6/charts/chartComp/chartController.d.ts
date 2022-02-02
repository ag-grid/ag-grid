import { AgChartThemePalette, AgEvent, BeanStub, ChartModel, ChartType } from "@ag-grid-community/core";
import { ChartDataModel, ColState } from "./chartDataModel";
import { ChartProxy } from "./chartProxies/chartProxy";
export interface ChartModelUpdatedEvent extends AgEvent {
}
export declare class ChartController extends BeanStub {
    private readonly model;
    static EVENT_CHART_UPDATED: string;
    static EVENT_CHART_TYPE_CHANGED: string;
    private readonly rangeService;
    private readonly gridApi;
    private readonly columnApi;
    private chartProxy;
    constructor(model: ChartDataModel);
    private init;
    updateForGridChange(): void;
    updateForDataChange(): void;
    updateForRangeChange(): void;
    updateForPanelChange(updatedCol: ColState): void;
    getChartModel(): ChartModel;
    getChartId(): string;
    getChartData(): any[];
    getChartType(): ChartType;
    setChartType(chartType: ChartType): void;
    setChartThemeName(chartThemeName: string): void;
    getChartThemeName(): string;
    isPivotChart(): boolean;
    isPivotMode(): boolean;
    isGrouping(): boolean;
    getThemes(): string[];
    getPalettes(): AgChartThemePalette[];
    getValueColState(): ColState[];
    getSelectedValueColState(): {
        colId: string;
        displayName: string | null;
    }[];
    getDimensionColState(): ColState[];
    getSelectedDimension(): ColState;
    private displayNameMapper;
    getColStateForMenu(): {
        dimensionCols: ColState[];
        valueCols: ColState[];
    };
    isDefaultCategorySelected(): boolean;
    setChartRange(silent?: boolean): void;
    detachChartRange(): void;
    setChartProxy(chartProxy: ChartProxy): void;
    getChartProxy(): ChartProxy;
    isActiveXYChart(): boolean;
    isChartLinked(): boolean;
    private getCellRanges;
    private getCellRangeParams;
    private raiseChartUpdatedEvent;
    private raiseChartOptionsChangedEvent;
    private raiseChartRangeSelectionChangedEvent;
    protected destroy(): void;
}
