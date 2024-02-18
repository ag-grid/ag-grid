import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
export declare class GradientLegendPanel extends Component {
    static TEMPLATE: string;
    private legendGroup;
    private gradientReverseCheckbox;
    private legendPositionSelect;
    private gradientThicknessSlider;
    private gradientPreferredLengthSlider;
    private legendSpacingSlider;
    private chartTranslationService;
    private readonly chartOptionsService;
    private readonly isExpandedOnInit;
    private activePanels;
    constructor({ chartOptionsService, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private initLegendGroup;
    private initLegendPosition;
    private initLegendGradient;
    private initLegendSpacing;
    private initLabelPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
