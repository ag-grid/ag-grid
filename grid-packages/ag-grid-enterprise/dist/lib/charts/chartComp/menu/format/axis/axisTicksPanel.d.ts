import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
export declare class AxisTicksPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private axisTicksGroup;
    private axisTicksColorPicker;
    private axisTicksWidthSlider;
    private axisTicksSizeSlider;
    private chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initAxisTicks;
}
