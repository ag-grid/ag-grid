import type { BeanCollection, ChartToolPanelMenuOptions, ChartToolPanelName, ChartToolbarMenuItemOptions, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { ChartController } from '../chartController';
import type { ChartMenuContext } from '../menu/chartMenuContext';
export declare const CHART_TOOL_PANEL_MENU_OPTIONS: {
    [key in ChartToolPanelName]: ChartToolPanelMenuOptions;
};
export declare class ChartMenuService extends BeanStub implements NamedBean {
    beanName: "chartMenuService";
    private advancedSettingsMenuFactory;
    wireBeans(beans: BeanCollection): void;
    downloadChart(chartMenuContext: ChartMenuContext, dimensions?: {
        width: number;
        height: number;
    }, fileName?: string, fileFormat?: string): void;
    toggleLinked(chartMenuContext: ChartMenuContext): void;
    openAdvancedSettings(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void;
    hideAdvancedSettings(): void;
    getChartToolbarOptions(): ChartToolbarMenuItemOptions[];
    getChartToolPanels(chartController: ChartController): {
        panels: ChartToolPanelMenuOptions[];
        defaultPanel: ChartToolPanelMenuOptions;
    };
    doesChartToolbarExist(): boolean;
    doChartToolPanelsExist(chartController: ChartController): boolean;
}
