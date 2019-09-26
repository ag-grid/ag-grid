// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
export declare class ChartFormattingPanel extends Component {
    static TEMPLATE: string;
    private formatPanelWrapper;
    private activePanels;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private createFormatPanel;
    private isBarChart;
    private addComponent;
    private destroyActivePanels;
    destroy(): void;
}
