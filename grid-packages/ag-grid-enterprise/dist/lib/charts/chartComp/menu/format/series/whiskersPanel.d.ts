import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
export declare class WhiskersPanel extends Component {
    private readonly chartOptionsService;
    private getSelectedSeries;
    static TEMPLATE: string;
    private whiskersGroup;
    private whiskerColorPicker;
    private whiskerThicknessSlider;
    private whiskerOpacitySlider;
    private whiskerLineDashSlider;
    private whiskerLineDashOffsetSlider;
    private chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService, getSelectedSeries: () => ChartSeriesType);
    private init;
    private initControls;
}
