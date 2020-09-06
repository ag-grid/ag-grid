import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class LineSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesLineWidthSlider;
    private chartTranslator;
    private activePanels;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initSeriesGroup;
    private initSeriesTooltips;
    private initSeriesLineWidth;
    private initMarkersPanel;
    private destroyActivePanels;
    private getChartProxy;
    protected destroy(): void;
}
