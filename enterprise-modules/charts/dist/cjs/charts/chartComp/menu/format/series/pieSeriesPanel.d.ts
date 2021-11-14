import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class PieSeriesPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesStrokeWidthSlider;
    private seriesLineOpacitySlider;
    private seriesFillOpacitySlider;
    private chartTranslator;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initGroup;
    private initSeriesTooltips;
    private initSeriesStrokeWidth;
    private initOpacity;
    private initLabelPanel;
    private initShadowPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
