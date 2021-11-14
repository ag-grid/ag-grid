import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class AreaSeriesPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesLineWidthSlider;
    private seriesLineDashSlider;
    private seriesLineOpacitySlider;
    private seriesFillOpacitySlider;
    private chartTranslator;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initSeriesGroup;
    private initSeriesTooltips;
    private initSeriesLineWidth;
    private initSeriesLineDash;
    private initOpacity;
    private initLabelPanel;
    private initMarkersPanel;
    private initShadowPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
