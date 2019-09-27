// ag-grid-enterprise v21.2.2
import { ChartMenuOptions, ChartType, Component } from "ag-grid-community";
import { ChartController } from "../chartController";
export declare class TabbedChartMenu extends Component {
    static EVENT_TAB_SELECTED: string;
    static TAB_MAIN: string;
    static TAB_DATA: string;
    static TAB_FORMAT: string;
    private tabbedLayout;
    private currentChartType;
    private panels;
    private tabs;
    private readonly chartController;
    private chartIcons;
    private chartTranslator;
    constructor(params: {
        controller: ChartController;
        type: ChartType;
        panels: ChartMenuOptions[];
    });
    init(): void;
    private createTab;
    getMinDimensions(): {
        width: number;
        height: number;
    };
    updateCurrentChartType(chartType: ChartType): void;
    showTab(tab: number): void;
    getGui(): HTMLElement;
    destroy(): void;
    private getPanelClass;
}
