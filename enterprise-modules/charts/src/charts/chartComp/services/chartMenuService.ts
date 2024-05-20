import {
    Autowired,
    Bean,
    BeanStub,
    ChartToolPanelMenuOptions,
    ChartToolPanelName,
    ChartToolbarMenuItemOptions,
    GetChartToolbarItemsParams,
    WithoutGridCommon,
    _warnOnce,
} from '@ag-grid-community/core';

import { ChartService } from '../../chartService';
import { ChartController } from '../chartController';
import { AdvancedSettingsMenuFactory } from '../menu/advancedSettings/advancedSettingsMenuFactory';
import { ChartMenuContext } from '../menu/chartMenuContext';

const CHART_TOOLBAR_ALLOW_LIST: ChartToolbarMenuItemOptions[] = [
    'chartUnlink',
    'chartLink',
    'chartDownload',
    'chartMenu',
];

export const CHART_TOOL_PANEL_MENU_OPTIONS: { [key in ChartToolPanelName]: ChartToolPanelMenuOptions } = {
    settings: 'chartSettings',
    data: 'chartData',
    format: 'chartFormat',
};

@Bean('chartMenuService')
export class ChartMenuService extends BeanStub {
    @Autowired('chartService') private readonly chartService: ChartService;
    @Autowired('advancedSettingsMenuFactory') private readonly advancedSettingsMenuFactory: AdvancedSettingsMenuFactory;

    public downloadChart(
        chartMenuContext: ChartMenuContext,
        dimensions?: { width: number; height: number },
        fileName?: string,
        fileFormat?: string
    ): void {
        chartMenuContext.chartController.getChartProxy().downloadChart(dimensions, fileName, fileFormat);
    }

    public toggleLinked(chartMenuContext: ChartMenuContext): void {
        chartMenuContext.chartController.detachChartRange();
    }

    public openAdvancedSettings(chartMenuContext: ChartMenuContext, eventSource?: HTMLElement): void {
        this.advancedSettingsMenuFactory.showMenu(chartMenuContext, eventSource);
    }

    public hideAdvancedSettings(): void {
        this.advancedSettingsMenuFactory.hideMenu();
    }

    public getChartToolbarOptions(): ChartToolbarMenuItemOptions[] {
        const defaultChartToolbarOptions: ChartToolbarMenuItemOptions[] = ['chartMenu'];

        const toolbarItemsFunc = this.gos.getCallback('getChartToolbarItems');
        const params: WithoutGridCommon<GetChartToolbarItemsParams> = {
            defaultItems: defaultChartToolbarOptions,
        };
        return toolbarItemsFunc
            ? toolbarItemsFunc(params).filter((option) => {
                  if (!CHART_TOOLBAR_ALLOW_LIST.includes(option)) {
                      _warnOnce(`'${option}' is not a valid Chart Toolbar Option`);
                      return false;
                  }
                  return true;
              })
            : defaultChartToolbarOptions;
    }

    public getChartToolPanels(chartController: ChartController): {
        panels: ChartToolPanelMenuOptions[];
        defaultPanel: ChartToolPanelMenuOptions;
    } {
        const chartToolPanelsDef = this.gos.get('chartToolPanelsDef');

        const panelsOverride = chartToolPanelsDef?.panels
            ?.map((panel) => {
                const menuOption = CHART_TOOL_PANEL_MENU_OPTIONS[panel];
                if (!menuOption) {
                    _warnOnce(`Invalid panel in chartToolPanelsDef.panels: '${panel}'`);
                }
                return menuOption;
            })
            .filter((panel) => Boolean(panel));
        let panels = panelsOverride ?? Object.values(CHART_TOOL_PANEL_MENU_OPTIONS);

        // pivot charts use the column tool panel instead of the data panel
        if (chartController.isPivotChart()) {
            panels = panels.filter((panel) => panel !== 'chartData');
        }

        const defaultToolPanel = chartToolPanelsDef?.defaultToolPanel;
        const defaultPanel = (defaultToolPanel && CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel]) || panels[0];

        return {
            panels,
            defaultPanel,
        };
    }

    public doesChartToolbarExist(): boolean {
        const chartToolbarOptions = this.getChartToolbarOptions();
        return chartToolbarOptions.length > 0;
    }

    public doChartToolPanelsExist(chartController: ChartController): boolean {
        const { panels } = this.getChartToolPanels(chartController);
        return panels.length > 0;
    }
}
