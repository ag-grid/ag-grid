import { Component } from "ag-grid-community";
import { ChartOptionsService } from "../../../services/chartOptionsService";
import { ChartSeriesType } from "../../../utils/seriesTypeMapper";
export declare class SeriesItemsPanel extends Component {
    private readonly chartOptionsService;
    private getSelectedSeries;
    static TEMPLATE: string;
    private seriesItemsGroup;
    private seriesItemSelect;
    private chartTranslationService;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService, getSelectedSeries: () => ChartSeriesType);
    private init;
    private initSeriesItems;
    private initSeriesControls;
    private initSlider;
    private initItemLabels;
    private destroyActivePanels;
    protected destroy(): void;
}
