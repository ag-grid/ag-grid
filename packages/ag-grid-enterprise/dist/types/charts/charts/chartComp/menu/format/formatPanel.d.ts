import { Component } from "ag-grid-community";
import { ChartSeriesType } from "../../utils/seriesTypeMapper";
import { ChartMenuContext } from "../chartMenuContext";
export interface FormatPanelOptions extends ChartMenuContext {
    isExpandedOnInit?: boolean;
    seriesType?: ChartSeriesType;
}
export declare class FormatPanel extends Component {
    private readonly chartMenuContext;
    static TEMPLATE: string;
    private chartPanelFeature;
    constructor(chartMenuContext: ChartMenuContext);
    private init;
    private createPanels;
    private getFormatPanelDef;
    private isGroupPanelShownInSeries;
}
