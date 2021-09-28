import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class ShadowPanel extends Component {
    static TEMPLATE: string;
    private shadowGroup;
    private shadowColorPicker;
    private shadowBlurSlider;
    private shadowXOffsetSlider;
    private shadowYOffsetSlider;
    private chartTranslator;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initSeriesShadow;
}
