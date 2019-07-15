// ag-grid-enterprise v21.1.0
import { Component } from "ag-grid-community";
import { ChartController } from "../../../chartController";
export declare class ShadowPanel extends Component {
    static TEMPLATE: string;
    private shadowGroup;
    private shadowColorPicker;
    private shadowBlurSlider;
    private shadowXOffsetSlider;
    private shadowYOffsetSlider;
    private chartTranslator;
    private chartController;
    private chart;
    private series;
    constructor(chartController: ChartController);
    private init;
    private initSeriesShadow;
}
