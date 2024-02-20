import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
export declare class MarkersPanel extends Component {
    private readonly chartOptionsService;
    private getSelectedSeries;
    static TEMPLATE: string;
    private seriesMarkersGroup;
    private seriesMarkerShapeSelect;
    private seriesMarkerSizeSlider;
    private seriesMarkerMinSizeSlider;
    private seriesMarkerStrokeWidthSlider;
    private chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService, getSelectedSeries: () => ChartSeriesType);
    private init;
    private initMarkers;
    private getSeriesOption;
    private setSeriesOption;
}
