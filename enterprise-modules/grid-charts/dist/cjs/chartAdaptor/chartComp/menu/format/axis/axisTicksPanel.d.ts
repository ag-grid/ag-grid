import { Component } from "@ag-grid-community/grid-core";
import { ChartController } from "../../../chartController";
export declare class AxisTicksPanel extends Component {
    static TEMPLATE: string;
    private axisTicksGroup;
    private axisTicksColorPicker;
    private axisTicksWidthSlider;
    private axisTicksSizeSlider;
    private chartTranslator;
    private chartProxy;
    constructor(chartController: ChartController);
    private init;
    private initAxisTicks;
}
