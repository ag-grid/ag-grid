import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class HistogramSeriesPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesBinCountSlider;
    private seriesStrokeWidthSlider;
    private seriesLineOpacitySlider;
    private seriesLineDashSlider;
    private seriesFillOpacitySlider;
    private chartTranslator;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initSeriesTooltips;
    private initBins;
    private initSeriesStrokeWidth;
    private initSeriesLineDash;
    private initOpacity;
    private initLabelPanel;
    private initShadowPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
