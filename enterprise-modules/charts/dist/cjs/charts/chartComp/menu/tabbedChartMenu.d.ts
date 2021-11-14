import { ChartMenuOptions, ChartType, Component } from "@ag-grid-community/core";
import { ChartController } from "../chartController";
import { ChartOptionsService } from "../chartOptionsService";
export declare class TabbedChartMenu extends Component {
    static TAB_DATA: string;
    static TAB_FORMAT: string;
    private tabbedLayout;
    private currentChartType;
    private panels;
    private tabs;
    private readonly chartController;
    private readonly chartOptionsService;
    private chartTranslator;
    constructor(params: {
        controller: ChartController;
        type: ChartType;
        panels: ChartMenuOptions[];
        chartOptionsService: ChartOptionsService;
    });
    init(): void;
    private createTab;
    showTab(tab: number): void;
    getGui(): HTMLElement;
    protected destroy(): void;
    private getPanelClass;
}
