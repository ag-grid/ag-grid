import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class HistogramSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesBinCountSlider;
    private seriesStrokeWidthSlider;
    private seriesLineOpacitySlider;
    private seriesFillOpacitySlider;
    private chartTranslator;
    private readonly chartController;
    private activePanels;
    constructor(chartController: ChartController);
    private init;
    private initSeriesTooltips;
    private initSeriesStrokeWidth;
    private initOpacity;
    private initBins;
    private initLabelPanel;
    private initShadowPanel;
    private destroyActivePanels;
    private getChartProxy;
    protected destroy(): void;
}
