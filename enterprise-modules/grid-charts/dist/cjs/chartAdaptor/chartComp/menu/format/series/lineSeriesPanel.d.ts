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
    private readonly chartProxy;
    constructor(chartController: ChartController);
    private init;
    private initSeriesGroup;
    private initSeriesTooltips;
    private initSeriesLineWidth;
    private initMarkersPanel;
    private destroyActivePanels;
    destroy(): void;
}
