// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class AxisTicksPanel extends Component {
    static TEMPLATE: string;
    private axisTicksGroup;
    private axisTicksColorPicker;
    private axisTicksWidthSlider;
    private axisTicksSizeSlider;
    private axisTicksPaddingSlider;
    private chartTranslator;
    private chartProxy;
    constructor(chartController: ChartController);
    private init;
    private initAxisTicks;
}
