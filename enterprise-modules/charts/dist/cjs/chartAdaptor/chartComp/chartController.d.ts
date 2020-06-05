import { AgEvent, BeanStub, ChartModel, ChartType, IRangeController } from "@ag-grid-community/core";
import { ChartDataModel, ColState } from "./chartDataModel";
import { ChartPalette, ChartPaletteName } from "ag-charts-community";
import { ChartProxy } from "./chartProxies/chartProxy";
export interface ChartModelUpdatedEvent extends AgEvent {
}
export declare class ChartController extends BeanStub {
    private readonly model;
    static EVENT_CHART_UPDATED: string;
    rangeController: IRangeController;
    private gridApi;
    private columnApi;
    private chartProxy;
    private chartPaletteName;
    constructor(model: ChartDataModel, paletteName?: ChartPaletteName);
    private init;
    updateForGridChange(): void;
    updateForDataChange(): void;
    updateForRangeChange(): void;
    updateForPanelChange(updatedCol: ColState): void;
    getChartModel(): ChartModel;
    getChartType(): ChartType;
    isPivotChart(): boolean;
    isGrouping(): boolean;
    getPaletteName(): ChartPaletteName;
    getPalettes(): Map<ChartPaletteName | undefined, ChartPalette>;
    setChartType(chartType: ChartType): void;
    setChartPaletteName(palette: ChartPaletteName): void;
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
    private raiseChartUpdatedEvent;
    private raiseChartOptionsChangedEvent;
    private raiseChartRangeSelectionChangedEvent;
    protected destroy(): void;
}
