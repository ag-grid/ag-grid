import { Component } from "@ag-grid-community/core";
import { ChartOptionsService } from "../../../services/chartOptionsService";
export declare class ChartPanel extends Component {
    private readonly chartOptionsService;
    static TEMPLATE: string;
    private chartGroup;
    private chartTranslationService;
    private activePanels;
    constructor(chartOptionsService: ChartOptionsService);
    private init;
    private initGroup;
    private initTitles;
    private initPaddingPanel;
    private initBackgroundPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
