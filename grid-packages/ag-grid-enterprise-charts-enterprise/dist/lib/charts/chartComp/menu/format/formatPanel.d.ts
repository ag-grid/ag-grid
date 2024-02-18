import { Component } from "ag-grid-community";
import { ChartController } from "../../chartController";
import { ChartOptionsService } from "../../services/chartOptionsService";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";
export interface FormatPanelOptions {
    chartController: ChartController;
    chartOptionsService: ChartOptionsService;
    isExpandedOnInit?: boolean;
    seriesType?: ChartSeriesType;
}
export declare function getMaxValue(currentValue: number, defaultMaxValue: number): number;
export declare class FormatPanel extends Component {
    private readonly chartController;
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private chartType;
    private isGrouping;
    private panels;
    constructor(chartController: ChartController, chartOptionsService: ChartOptionsService);
    private init;
    private createPanels;
    private getFormatPanelDef;
    private isGroupPanelShownInSeries;
    private addComponent;
    private destroyPanels;
    protected destroy(): void;
}
