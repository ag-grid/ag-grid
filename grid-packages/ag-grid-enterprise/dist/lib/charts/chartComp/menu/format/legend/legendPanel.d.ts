import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
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
    private chartTranslationService;
    private readonly chartOptionsService;
    private readonly isExpandedOnInit;
    private activePanels;
    constructor({ chartOptionsService, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private initLegendGroup;
    private initLegendPosition;
    private initLegendPadding;
    private initLegendItems;
    private initLabelPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
