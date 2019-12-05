import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class CalloutPanel extends Component {
    static TEMPLATE: string;
    private calloutGroup;
    private calloutLengthSlider;
    private calloutStrokeWidthSlider;
    private labelOffsetSlider;
    private chartTranslator;
    private readonly chartController;
    constructor(chartController: ChartController);
    private init;
    private initCalloutOptions;
}
