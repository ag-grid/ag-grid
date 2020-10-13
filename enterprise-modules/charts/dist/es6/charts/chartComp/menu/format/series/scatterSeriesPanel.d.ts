import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class ScatterSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private chartTranslator;
    private activePanels;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initSeriesGroup;
    private initSeriesTooltips;
    private initMarkersPanel;
    private destroyActivePanels;
    private getChartProxy;
    protected destroy(): void;
}
