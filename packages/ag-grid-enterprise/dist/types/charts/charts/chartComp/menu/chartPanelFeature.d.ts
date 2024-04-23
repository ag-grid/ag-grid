import { BeanStub, ChartType, Component } from "ag-grid-community";
import { ChartController } from "../chartController";
import { ChartSeriesType } from "../utils/seriesTypeMapper";
export declare class ChartPanelFeature extends BeanStub {
    private readonly chartController;
    private readonly eGui;
    private readonly cssClass;
    private readonly createPanels;
    private chartType;
    private isGrouping;
    private panels;
    constructor(chartController: ChartController, eGui: HTMLElement, cssClass: string, createPanels: (chartType: ChartType, seriesType: ChartSeriesType) => void);
    private postConstruct;
    addComponent(component: Component): void;
    refreshPanels(reuse?: boolean): void;
    private destroyPanels;
    protected destroy(): void;
}
