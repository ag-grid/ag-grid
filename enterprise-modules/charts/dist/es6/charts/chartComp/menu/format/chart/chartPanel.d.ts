import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class ChartPanel extends Component {
    static TEMPLATE: string;
    private chartGroup;
    private chartTranslator;
    private activePanels;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initGroup;
    private initTitles;
    private initPaddingPanel;
    private initBackgroundPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
