// ag-grid-enterprise v21.1.0
import { Component } from "ag-grid-community";
import { PieSeries } from "../../../../../charts/chart/series/pieSeries";
export declare class CalloutPanel extends Component {
    static TEMPLATE: string;
    private seriesGroup;
    private calloutGroup;
    private calloutLengthSlider;
    private calloutStrokeWidthSlider;
    private labelOffsetSlider;
    private chartTranslator;
    private series;
    constructor(series: PieSeries[]);
    private init;
    private initCalloutOptions;
}
