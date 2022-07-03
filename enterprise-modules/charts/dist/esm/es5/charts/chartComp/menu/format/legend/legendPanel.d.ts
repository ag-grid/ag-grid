import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../services/chartOptionsService";
export declare class LegendPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private legendGroup;
    private legendPositionSelect;
    private legendPaddingSlider;
    private markerSizeSlider;
    private markerStrokeSlider;
    private markerPaddingSlider;
    private itemPaddingXSlider;
    private itemPaddingYSlider;
    private chartTranslationService;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initLegendGroup;
    private initLegendPosition;
    private initLegendPadding;
    private initLegendItems;
    private initLabelPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
