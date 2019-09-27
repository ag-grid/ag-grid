// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class LineSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesLineWidthSlider;
    private chartTranslator;
    private activePanels;
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
