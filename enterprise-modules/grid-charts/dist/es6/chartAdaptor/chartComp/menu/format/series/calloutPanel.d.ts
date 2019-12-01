import { Component } from "@ag-grid-community/core";
import { PieChartProxy } from "../../../chartProxies/polar/pieChartProxy";
import { DoughnutChartProxy } from "../../../chartProxies/polar/doughnutChartProxy";
export declare class CalloutPanel extends Component {
    static TEMPLATE: string;
    private calloutGroup;
    private calloutLengthSlider;
    private calloutStrokeWidthSlider;
    private labelOffsetSlider;
    private chartTranslator;
    private chartProxy;
    constructor(chartProxy: PieChartProxy | DoughnutChartProxy);
    private init;
    private initCalloutOptions;
}
