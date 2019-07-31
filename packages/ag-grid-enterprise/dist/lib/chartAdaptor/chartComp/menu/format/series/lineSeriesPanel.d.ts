// ag-grid-enterprise v21.1.1
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class LineSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesLineWidthSlider;
    private chartTranslator;
    private series;
    private activePanels;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initSeriesTooltips;
    private initSeriesLineWidth;
    private initMarkersPanel;
    private destroyActivePanels;
    destroy(): void;
}
