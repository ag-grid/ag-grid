import { Component } from 'ag-grid-community';
import type { ChartMenuContext } from '../chartMenuContext';
export declare class AdvancedSettingsPanel extends Component {
    private readonly chartMenuContext;
    private chartPanelFeature;
    constructor(chartMenuContext: ChartMenuContext);
    postConstruct(): void;
    private createPanels;
    private isGroupPanelShownForSeries;
    private createPanel;
}
