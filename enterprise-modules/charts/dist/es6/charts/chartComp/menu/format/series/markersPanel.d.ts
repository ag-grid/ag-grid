import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../chartOptionsService";
export declare class MarkersPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private seriesMarkersGroup;
    private seriesMarkerShapeSelect;
    private seriesMarkerSizeSlider;
    private seriesMarkerMinSizeSlider;
    private seriesMarkerStrokeWidthSlider;
    private chartTranslator;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initMarkers;
}
