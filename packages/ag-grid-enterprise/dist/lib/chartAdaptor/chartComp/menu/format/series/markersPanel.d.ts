// ag-grid-enterprise v21.1.0
import { Component } from "ag-grid-community";
import { LineSeries } from "../../../../../charts/chart/series/lineSeries";
import { AreaSeries } from "../../../../../charts/chart/series/areaSeries";
export declare class MarkersPanel extends Component {
    static TEMPLATE: string;
    private seriesMarkersGroup;
    private seriesMarkerSizeSlider;
    private seriesMarkerStrokeWidthSlider;
    private chartTranslator;
    private series;
    constructor(series: LineSeries[] | AreaSeries[]);
    private init;
    private initMarkers;
}
