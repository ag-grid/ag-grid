import { Component } from "ag-grid-community";
import { FormatPanelOptions } from "../formatPanel";
export declare class ChartPanel extends Component {
    static TEMPLATE: string;
    private chartGroup;
    private chartTranslationService;
    private readonly chartOptionsService;
    private readonly chartController;
    private readonly isExpandedOnInit;
    private activePanels;
    constructor({ chartController, chartOptionsService, isExpandedOnInit }: FormatPanelOptions);
    private init;
    private initGroup;
    private initTitles;
    private initPaddingPanel;
    private initBackgroundPanel;
    private destroyActivePanels;
    protected destroy(): void;
}
