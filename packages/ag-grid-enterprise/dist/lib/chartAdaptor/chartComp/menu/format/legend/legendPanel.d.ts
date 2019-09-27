// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class LegendPanel extends Component {
    static TEMPLATE: string;
    private legendGroup;
    private legendPositionSelect;
    private legendPaddingSlider;
    private markerSizeSlider;
    private markerStrokeSlider;
    private markerPaddingSlider;
    private itemPaddingXSlider;
    private itemPaddingYSlider;
    private chartTranslator;
    private activePanels;
    private chartProxy;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initLegendGroup;
    private initLegendPosition;
    private initLegendPadding;
    private initLegendItems;
    private initLabelPanel;
    private destroyActivePanels;
    destroy(): void;
}
