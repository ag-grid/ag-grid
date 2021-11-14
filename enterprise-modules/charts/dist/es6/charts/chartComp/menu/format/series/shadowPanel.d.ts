import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class ShadowPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private shadowGroup;
    private shadowColorPicker;
    private shadowBlurSlider;
    private shadowXOffsetSlider;
    private shadowYOffsetSlider;
    private chartTranslator;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initSeriesShadow;
}
