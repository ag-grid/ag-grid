import { Component } from "ag-grid-community";
import { ChartMenuParamsFactory } from "../../chartMenuParamsFactory";
export declare class SeriesItemsPanel extends Component {
    private readonly chartMenuUtils;
    static TEMPLATE: string;
    private seriesItemsGroup;
    private readonly chartTranslationService;
    private activePanels;
    constructor(chartMenuUtils: ChartMenuParamsFactory);
    private init;
    private getSeriesItemsParams;
    private initSeriesControls;
    private initSlider;
    private initItemLabels;
    private destroyActivePanels;
    protected destroy(): void;
}
