// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class ChartPanel extends Component {
    static TEMPLATE: string;
    private chartGroup;
    private titleInput;
    private chartTranslator;
    private chart;
    private chartProxy;
    private activePanels;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initGroup;
    private initTitles;
    private initPaddingPanel;
    private destroyActivePanels;
    destroy(): void;
}
