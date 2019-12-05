import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class AxisTicksPanel extends Component {
    static TEMPLATE: string;
    private axisTicksGroup;
    private axisTicksColorPicker;
    private axisTicksWidthSlider;
    private axisTicksSizeSlider;
    private chartTranslator;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initAxisTicks;
    private getChartProxy;
}
