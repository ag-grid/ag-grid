// ag-grid-enterprise v21.0.1
import { Component } from "ag-grid-community";
import { ChartController } from "../chartController";
export declare class ChartMenu extends Component {
    private gridOptionsWrapper;
    static EVENT_DOWNLOAD_CHART: string;
    private buttons;
    private tabs;
    private static TEMPLATE;
    private readonly chartController;
    private tabbedMenu;
    private menuDialog;
    constructor(chartController: ChartController);
    private postConstruct;
    private getToolbarOptions;
    private createButtons;
    private saveChart;
    private showMenu;
    destroy(): void;
}
