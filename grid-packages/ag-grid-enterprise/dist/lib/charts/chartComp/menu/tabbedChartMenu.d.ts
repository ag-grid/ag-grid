import { ChartMenuOptions, ChartType, Component } from "ag-grid-community";
import { ChartController } from "../chartController";
import { ChartOptionsService } from "../services/chartOptionsService";
export declare class TabbedChartMenu extends Component {
    static TAB_DATA: string;
    static TAB_FORMAT: string;
    private tabbedLayout;
    private panels;
    private tabs;
    private readonly chartController;
    private readonly chartOptionsService;
    private chartTranslationService;
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
