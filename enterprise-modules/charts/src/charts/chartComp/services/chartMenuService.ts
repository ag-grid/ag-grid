import {
    Autowired,
    Bean,
    BeanStub,
    ChartMenuOptions,
    ChartToolPanelMenuOptions,
    ChartToolPanelName,
    GetChartToolbarItemsParams,
    WithoutGridCommon,
    _
} from "@ag-grid-community/core";
import { ChartService } from "../../chartService";
import { ChartMenuContext } from "../menu/chartMenuContext";
import { AdvancedSettingsMenuFactory } from "../menu/advancedSettings/advancedSettingsMenuFactory";
import { ChartController } from "../chartController";

const CHART_TOOL_PANEL_ALLOW_LIST: ChartToolPanelMenuOptions[] = [
    'chartSettings', 
    'chartData', 
    'chartFormat'
];
const CHART_TOOLBAR_ALLOW_LIST: ChartMenuOptions[] = [
    'chartUnlink',
    'chartLink',
    'chartDownload'
];

export const CHART_TOOL_PANEL_MENU_OPTIONS: { [key in ChartToolPanelName]: ChartToolPanelMenuOptions } = {
    settings: "chartSettings",
    data: "chartData",
    format: "chartFormat"
}

//@Bean('chartMenuService')
export class ChartMenuService extends BeanStub {
    @Autowired('chartService') private readonly chartService: ChartService;
    @Autowired('advancedSettingsMenuFactory') private readonly advancedSettingsMenuFactory: AdvancedSettingsMenuFactory;

    public isLegacyFormat(): boolean {
        return !this.chartService.isEnterprise();
    }

    public downloadChart(chartMenuContext: ChartMenuContext, dimensions?: { width: number, height: number }, fileName?: string, fileFormat?: string): void {
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

    public getToolbarOptionsAndPanels(chartController: ChartController): {
        panels: ChartToolPanelMenuOptions[],
        defaultPanel: ChartToolPanelMenuOptions,
        chartToolbarOptions: ChartMenuOptions[]
    } {
        const legacyFormat = this.isLegacyFormat();
        const useChartToolPanelCustomisation = Boolean(this.gos.get('chartToolPanelsDef')) || !legacyFormat;

        let panels: ChartToolPanelMenuOptions[];
        let defaultPanel: ChartToolPanelMenuOptions;
        let chartToolbarOptions: ChartMenuOptions[];

        if (useChartToolPanelCustomisation) {
            const defaultChartToolbarOptions: ChartMenuOptions[] = legacyFormat ? [
                chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ] : [
                'chartMenu'
            ];
    
            const toolbarItemsFunc = this.gos.getCallback('getChartToolbarItems');
            const params: WithoutGridCommon<GetChartToolbarItemsParams> = {
                defaultItems: defaultChartToolbarOptions
            };
            chartToolbarOptions = toolbarItemsFunc
                ? toolbarItemsFunc(params).filter(option => {
                    if (!(legacyFormat ? CHART_TOOLBAR_ALLOW_LIST : [...CHART_TOOLBAR_ALLOW_LIST, 'chartMenu']).includes(option)) {
                        let msg;
                        if (CHART_TOOL_PANEL_ALLOW_LIST.includes(option as any)) {
                            msg = `'${option}' is a Chart Tool Panel option and will be ignored since 'chartToolPanelsDef' is used. Please use 'chartToolPanelsDef.panels' grid option instead`
                        } else if (option === 'chartMenu') {
                            msg = `'chartMenu' is only allowed as a Chart Toolbar Option when using AG Charts Enterprise`;
                        } else {
                            msg = `'${option}' is not a valid Chart Toolbar Option`;
                        }
                        _.warnOnce(msg);
                        return false;
                    }

                    return true;
                })
                : defaultChartToolbarOptions;

            const panelsOverride = this.gos.get('chartToolPanelsDef')?.panels
                ?.map(panel => {
                    const menuOption = CHART_TOOL_PANEL_MENU_OPTIONS[panel]
                    if (!menuOption) {
                        _.warnOnce(`Invalid panel in chartToolPanelsDef.panels: '${panel}'`);
                    }
                    return menuOption;
                })
                .filter(panel => Boolean(panel));
            panels = panelsOverride
                ? panelsOverride
                : Object.values(CHART_TOOL_PANEL_MENU_OPTIONS);

            // pivot charts use the column tool panel instead of the data panel
            if (chartController.isPivotChart()) {
                panels = panels.filter(panel => panel !== 'chartData');
            }

            const defaultToolPanel = this.gos.get('chartToolPanelsDef')?.defaultToolPanel;
            defaultPanel = (defaultToolPanel && CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel]) || panels[0];

            if (legacyFormat) {
                chartToolbarOptions = panels.length > 0
                    // Only one panel is required to display menu icon in toolbar
                    ? [panels[0], ...chartToolbarOptions]
                    : chartToolbarOptions;
            }
        } else { // To be deprecated in future. Toolbar options will be different to chart tool panels.
            let tabOptions: ChartMenuOptions[] = [
                'chartSettings',
                'chartData',
                'chartFormat',
                chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
    
            const toolbarItemsFunc = this.gos.getCallback('getChartToolbarItems');
    
            if (toolbarItemsFunc) {
                const isLegacyToolbar = this.gos.get('suppressChartToolPanelsButton');
                const params: WithoutGridCommon<GetChartToolbarItemsParams> = {
                    defaultItems: isLegacyToolbar ? tabOptions : CHART_TOOLBAR_ALLOW_LIST
                };
    
                tabOptions = toolbarItemsFunc(params).filter(option => {
                    if (!CHART_TOOL_PANEL_ALLOW_LIST.includes(option as any) && !CHART_TOOLBAR_ALLOW_LIST.includes(option)) {
                        _.warnOnce(`'${option}' is not a valid Chart Toolbar Option`);
                        return false;
                    } 
                    // If not legacy, remove chart tool panel options here,
                    // and add them all in one go below
                    else if (!isLegacyToolbar && CHART_TOOL_PANEL_ALLOW_LIST.includes(option as any)) {
                        const msg = `'${option}' is a Chart Tool Panel option and will be ignored. Please use 'chartToolPanelsDef.panels' grid option instead`;
                        _.warnOnce(msg);
                        return false;
                    }
    
                    return true;
                });

                if (!isLegacyToolbar) {
                    // Add all the chart tool panels, as `chartToolPanelsDef.panels`
                    // should be used for configuration
                    tabOptions = tabOptions.concat(CHART_TOOL_PANEL_ALLOW_LIST);
                }
            }
    
            // pivot charts use the column tool panel instead of the data panel
            if (chartController.isPivotChart()) {
                tabOptions = tabOptions.filter(option => option !== 'chartData');
            }
    
            const ignoreOptions: ChartMenuOptions[] = ['chartUnlink', 'chartLink', 'chartDownload'];
            panels = tabOptions.filter(option => ignoreOptions.indexOf(option) === -1) as ChartToolPanelMenuOptions[];
            defaultPanel = panels[0];
    
            chartToolbarOptions = tabOptions.filter(value =>
                ignoreOptions.indexOf(value) !== -1 ||
                (panels.length && value === panels[0])
            );
        }

        return {
            panels,
            defaultPanel,
            chartToolbarOptions
        };
    }

    public doesChartToolbarExist(chartController: ChartController) {
        const { chartToolbarOptions } = this.getToolbarOptionsAndPanels(chartController);
        return [ 'chartMenu', ...CHART_TOOLBAR_ALLOW_LIST ].some(option => chartToolbarOptions.includes(option as any));
    }

    public doChartToolPanelsExist(chartController: ChartController) {
        const { panels } = this.getToolbarOptionsAndPanels(chartController);
        return panels.length > 0;
    }
}
