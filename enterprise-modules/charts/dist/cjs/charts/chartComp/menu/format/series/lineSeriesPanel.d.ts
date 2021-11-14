import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class LineSeriesPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesLineWidthSlider;
    private seriesLineDashSlider;
    private chartTranslator;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initSeriesGroup;
    private initSeriesTooltips;
    private initSeriesLineWidth;
    private initSeriesLineDash;
    private initMarkersPanel;
    private initLabelPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
