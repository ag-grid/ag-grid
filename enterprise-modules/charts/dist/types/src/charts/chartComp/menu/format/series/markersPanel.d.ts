import { Component } from "@ag-grid-community/core";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
import { ChartOptionsService } from '../../../services/chartOptionsService';
export declare class MarkersPanel extends Component {
    private readonly chartOptionsService;
    private readonly chartMenuUtils;
    static TEMPLATE: string;
    private seriesMarkerMinSizeSlider;
    private readonly chartTranslationService;
    constructor(chartOptionsService: ChartOptionsService, chartMenuUtils: ChartMenuParamsFactory);
    private init;
    private getMarkerShapeSelectParams;
    private getSliderParams;
}
