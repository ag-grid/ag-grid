import { Component } from "ag-grid-community";
import { ChartMenuContext } from "../chartMenuContext";
export declare class AdvancedSettingsPanel extends Component {
    private readonly chartMenuContext;
    private static TEMPLATE;
    private chartPanelFeature;
    constructor(chartMenuContext: ChartMenuContext);
    private postConstruct;
    private createPanels;
    private isGroupPanelShownForSeries;
    private createPanel;
}
