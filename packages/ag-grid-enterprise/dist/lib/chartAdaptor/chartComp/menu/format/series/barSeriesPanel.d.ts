// ag-grid-enterprise v21.1.0
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class BarSeriesPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private seriesTooltipsToggle;
    private seriesStrokeWidthSlider;
    private seriesLineOpacitySlider;
    private seriesFillOpacitySlider;
    private chartTranslator;
    private readonly chartController;
    private activePanels;
    private series;
    constructor(chartController: ChartController);
    private init;
    private initSeriesStrokeWidth;
    private initOpacity;
    private initSeriesTooltips;
    private initLabelPanel;
    private initShadowPanel;
    private destroyActivePanels;
    destroy(): void;
}
