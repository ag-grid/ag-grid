import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
import { ChartOptionsService } from "../../../services/chartOptionsService";
export declare class AxisPanel extends Component {
    private readonly chartController;
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private axisGroup;
    private axisColorInput;
    private axisLineWidthSlider;
    private xAxisTypeSelect;
    private chartTranslationService;
    private activePanels;
    private axisLabelUpdateFuncs;
    private prevXRotation;
    private prevYRotation;
    constructor(chartController: ChartController, chartOptionsService: ChartOptionsService);
    private init;
    private initAxis;
    private initAxisTicks;
    private initAxisLabels;
    private addAdditionalLabelComps;
    private initLabelRotations;
    private createRotationWidgets;
    private addLabelPadding;
    private translate;
    private destroyActivePanels;
    protected destroy(): void;
}
