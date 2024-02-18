import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
export declare class CalloutPanel extends Component {
    private readonly chartOptionsService;
    private getSelectedSeries;
    static TEMPLATE: string;
    private calloutGroup;
    private calloutLengthSlider;
    private calloutStrokeWidthSlider;
    private labelOffsetSlider;
    private chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService, getSelectedSeries: () => ChartSeriesType);
    private init;
    private initCalloutOptions;
}
