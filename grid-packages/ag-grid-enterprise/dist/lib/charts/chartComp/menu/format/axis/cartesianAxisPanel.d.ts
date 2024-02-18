import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
export declare class CartesianAxisPanel extends Component {
    static TEMPLATE: string;
    private axisGroup;
    private axisColorInput;
    private axisLineWidthSlider;
    private chartTranslationService;
    private readonly chartController;
    private readonly chartOptionsService;
    private readonly isExpandedOnInit;
    private activePanels;
    private axisLabelUpdateFuncs;
    private prevXRotation;
    private prevYRotation;
    constructor({ chartController, chartOptionsService, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private initAxis;
    private initAxisTicks;
    private hasConfigurableAxisTicks;
    private initAxisLabels;
    private addAdditionalLabelComps;
    private initLabelRotations;
    private createRotationWidgets;
    private addLabelPadding;
    private translate;
    private destroyActivePanels;
    protected destroy(): void;
}
