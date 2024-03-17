import { BeanStub, ChartMenuOptions, ChartToolPanelMenuOptions, ChartToolPanelName } from "ag-grid-community";
import { ChartMenuContext } from "../menu/chartMenuContext";
import { ChartController } from "../chartController";
export declare const CHART_TOOL_PANEL_MENU_OPTIONS: {
    [key in ChartToolPanelName]: ChartToolPanelMenuOptions;
};
export declare class ChartMenuService extends BeanStub {
    private readonly chartService;
    private readonly advancedSettingsMenuFactory;
    isLegacyFormat(): boolean;
    downloadChart(chartMenuContext: ChartMenuContext, dimensions?: {
        width: number;
        height: number;
    }, fileName?: string, fileFormat?: string): void;
    toggleLinked(chartMenuContext: ChartMenuContext): void;
    openAdvancedSettings(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void;
    hideAdvancedSettings(): void;
    getToolbarOptionsAndPanels(chartController: ChartController): {
        panels: ChartToolPanelMenuOptions[];
        defaultPanel: ChartToolPanelMenuOptions;
        chartToolbarOptions: ChartMenuOptions[];
    };
    doesChartToolbarExist(chartController: ChartController): boolean;
    doChartToolPanelsExist(chartController: ChartController): boolean;
}
