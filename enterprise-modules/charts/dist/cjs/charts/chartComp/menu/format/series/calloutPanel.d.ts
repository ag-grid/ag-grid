import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class CalloutPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private calloutGroup;
    private calloutLengthSlider;
    private calloutStrokeWidthSlider;
    private labelOffsetSlider;
    private chartTranslator;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initCalloutOptions;
}
