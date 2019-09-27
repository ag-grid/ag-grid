// ag-grid-enterprise v21.2.2
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
    private chartProxy;
    constructor(chartController: ChartController);
    private init;
    private initSeriesTooltips;
    private initSeriesStrokeWidth;
    private initOpacity;
    private initLabelPanel;
    private initShadowPanel;
    private destroyActivePanels;
    destroy(): void;
}
