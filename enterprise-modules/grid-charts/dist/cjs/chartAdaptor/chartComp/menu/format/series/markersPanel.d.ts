import { Component } from "@ag-grid-community/core";
import { ChartController } from "../../../chartController";
export declare class MarkersPanel extends Component {
    static TEMPLATE: string;
    private seriesMarkersGroup;
    private seriesMarkerSizeSlider;
    private seriesMarkerMinSizeSlider;
    private seriesMarkerStrokeWidthSlider;
    private chartTranslator;
    private readonly chartController;
    private readonly chartProxy;
    constructor(chartController: ChartController);
    private init;
    private initMarkers;
}
