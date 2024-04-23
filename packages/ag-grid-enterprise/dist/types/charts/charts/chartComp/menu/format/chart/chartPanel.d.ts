import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
export declare class ChartPanel extends Component {
    static TEMPLATE: string;
    private chartTranslationService;
    private chartMenuService;
    private readonly chartMenuParamsFactory;
    private readonly chartController;
    private readonly isExpandedOnInit;
    private readonly chartOptionsSeriesProxy;
    private chartSeriesMenuParamsFactory;
    private directionSelect?;
    constructor({ chartController, chartMenuParamsFactory, isExpandedOnInit, chartOptionsService, seriesType }: FormatPanelOptions);
    private init;
    private refresh;
    private createDirectionSelect;
    private updateDirectionSelect;
}
