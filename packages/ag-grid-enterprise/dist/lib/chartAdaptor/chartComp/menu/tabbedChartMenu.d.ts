// ag-grid-enterprise v21.0.1
import { Component, ChartType, ChartToolbarOptions } from "ag-grid-community";
import { ChartController } from "../chartController";
export declare class TabbedChartMenu extends Component {
    static EVENT_TAB_SELECTED: string;
    static TAB_MAIN: string;
    static TAB_DATA: string;
    private gridOptionsWrapper;
    private tabbedLayout;
    private currentChartType;
    private panels;
    private tabs;
    private readonly chartController;
    private chartIcons;
    constructor(params: {
        controller: ChartController;
        type: ChartType;
        panels: ChartToolbarOptions[];
    });
    init(): void;
    getMinDimensions(): {
        width: number;
        height: number;
    };
    private createTab;
    updateCurrentChartType(chartType: ChartType): void;
    showTab(tab: number): void;
    getGui(): HTMLElement;
    destroy(): void;
}
