// ag-grid-enterprise v21.1.0
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class AxisPanel extends Component {
    static TEMPLATE: string;
    private axisGroup;
    private axisLineWidthSlider;
    private axisColorInput;
    private chartTranslator;
    private readonly chartController;
    private activePanels;
    private chart;
    constructor(chartController: ChartController);
    private init;
    private initAxis;
    private initAxisTicks;
    private initAxisLabels;
    private addAdditionalLabelComps;
    private destroyActivePanels;
    destroy(): void;
}
