import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class AreaSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesLineWidthSlider;
    private seriesLineOpacitySlider;
    private seriesFillOpacitySlider;
    private chartTranslator;
    private readonly chartController;
    private activePanels;
    constructor(chartController: ChartController);
    private init;
    private initSeriesGroup;
    private initSeriesTooltips;
    private initSeriesLineWidth;
    private initOpacity;
    private initMarkersPanel;
    private initShadowPanel;
    private destroyActivePanels;
    private getChartProxy;
    protected destroy(): void;
}
