import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class BarSeriesPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesStrokeWidthSlider;
    private seriesLineDashSlider;
    private seriesLineOpacitySlider;
    private seriesFillOpacitySlider;
    private chartTranslator;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initSeriesTooltips;
    private initSeriesStrokeWidth;
    private initSeriesLineDash;
    private initOpacity;
    private initLabelPanel;
    private initShadowPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
