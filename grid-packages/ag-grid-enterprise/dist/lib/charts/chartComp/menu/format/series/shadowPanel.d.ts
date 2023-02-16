import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
export declare class ShadowPanel extends Component {
    private readonly chartOptionsService;
    private getSelectedSeries;
    static TEMPLATE: string;
    private shadowGroup;
    private shadowColorPicker;
    private shadowBlurSlider;
    private shadowXOffsetSlider;
    private shadowYOffsetSlider;
    private chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService, getSelectedSeries: () => ChartSeriesType);
    private init;
    private initSeriesShadow;
}
