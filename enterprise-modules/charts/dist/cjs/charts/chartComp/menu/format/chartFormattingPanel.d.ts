import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../chartController";
export declare class ChartFormattingPanel extends Component {
    static TEMPLATE: string;
    private chartType;
    private isGrouping;
    private panels;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private createPanels;
    private addComponent;
    private destroyPanels;
    protected destroy(): void;
}
