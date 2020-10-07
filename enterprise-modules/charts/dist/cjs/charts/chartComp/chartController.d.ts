import { AgChartThemePalette, AgEvent, BeanStub, ChartModel, ChartType } from "@ag-grid-community/core";
import { ChartDataModel, ColState } from "./chartDataModel";
import { ChartProxy } from "./chartProxies/chartProxy";
export interface ChartModelUpdatedEvent extends AgEvent {
}
export declare class ChartController extends BeanStub {
    private readonly model;
    static EVENT_CHART_UPDATED: string;
    private readonly rangeController;
    private readonly gridOptionsWrapper;
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
    getChartType(): ChartType;
    isPivotChart(): boolean;
    isGrouping(): boolean;
    getThemeName(): string;
    getThemes(): string[];
    getPalettes(): AgChartThemePalette[];
    setChartType(chartType: ChartType): void;
    setChartThemeName(chartThemeName: string): void;
    getColStateForMenu(): {
        dimensionCols: ColState[];
        valueCols: ColState[];
    };
    isDefaultCategorySelected(): boolean;
    setChartRange(silent?: boolean): void;
    detachChartRange(): void;
    setChartProxy(chartProxy: ChartProxy<any, any>): void;
    getChartProxy(): ChartProxy<any, any>;
    isActiveXYChart(): boolean;
    isChartLinked(): boolean;
    private raiseChartUpdatedEvent;
    private raiseChartOptionsChangedEvent;
    private raiseChartRangeSelectionChangedEvent;
    protected destroy(): void;
}
