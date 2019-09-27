// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community";
import { LineChartProxy } from "../../../chartProxies/cartesian/lineChartProxy";
import { AreaChartProxy } from "../../../chartProxies/cartesian/areaChartProxy";
import { ScatterChartProxy } from "../../../chartProxies/cartesian/scatterChartProxy";
export declare class MarkersPanel extends Component {
    static TEMPLATE: string;
    private seriesMarkersGroup;
    private seriesMarkerSizeSlider;
    private seriesMarkerStrokeWidthSlider;
    private chartTranslator;
    private readonly chartProxy;
    constructor(chartProxy: LineChartProxy | AreaChartProxy | ScatterChartProxy);
    private init;
    private initMarkers;
}
