import type { ChartType, Component } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ChartController } from '../chartController';
import type { ChartSeriesType } from '../utils/seriesTypeMapper';
export declare class ChartPanelFeature extends BeanStub {
    private readonly chartController;
    private readonly eGui;
    private readonly cssClass;
    private readonly createPanels;
    private chartType;
    private isGrouping;
    private panels;
    constructor(chartController: ChartController, eGui: HTMLElement, cssClass: string, createPanels: (chartType: ChartType, seriesType: ChartSeriesType) => void);
    postConstruct(): void;
    addComponent(component: Component): void;
    refreshPanels(reuse?: boolean): void;
    private destroyPanels;
    destroy(): void;
}
