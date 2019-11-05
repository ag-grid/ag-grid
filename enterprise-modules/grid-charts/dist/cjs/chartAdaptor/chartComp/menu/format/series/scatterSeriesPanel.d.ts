import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class ScatterSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private chartTranslator;
    private activePanels;
    private readonly chartController;
    private readonly chartProxy;
    constructor(chartController: ChartController);
    private init;
    private initSeriesGroup;
    private initSeriesTooltips;
    private initMarkersPanel;
    private destroyActivePanels;
    destroy(): void;
}
