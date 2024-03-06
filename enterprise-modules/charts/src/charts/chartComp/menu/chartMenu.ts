import {
    _,
    AgPanel,
    AgPromise,
    Autowired,
    ChartCreated,
    ChartMenuOptions,
    ChartToolPanelMenuOptions,
    Component,
    Events,
    GetChartToolbarItemsParams,
    PostConstruct,
    WithoutGridCommon,
    ChartToolPanelName
} from "@ag-grid-community/core";

import { TabbedChartMenu } from "./tabbedChartMenu";
import { ChartController } from "../chartController";
import { ChartOptionsService } from "../services/chartOptionsService";
import { ExtraPaddingDirection } from "../chartProxies/chartProxy";
import { ChartMenuListFactory } from "./chartMenuList";
import { ChartToolbar } from "./chartToolbar";
import { ChartMenuService } from "../services/chartMenuService";

type ChartToolbarButtons = {
    [key in ChartMenuOptions]: {
        iconName: string, callback: (eventSource: HTMLElement) => void
    }
};

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

export class ChartMenu extends Component {
    @Autowired('chartMenuService') private chartMenuService: ChartMenuService;
    @Autowired('chartMenuListFactory') private chartMenuListFactory: ChartMenuListFactory;

    private buttons: ChartToolbarButtons = {
        chartSettings: { iconName: 'menu', callback: () => this.showMenu(this.defaultPanel) },
        chartData: { iconName: 'menu', callback: () => this.showMenu("chartData") },
        chartFormat: { iconName: 'menu', callback: () => this.showMenu("chartFormat") },
        chartLink: { iconName: 'linked', callback: () => this.chartMenuService.toggleLinked(this.chartController) },
        chartUnlink: { iconName: 'unlinked', callback: () => this.chartMenuService.toggleLinked(this.chartController) },
        chartDownload: { iconName: 'save', callback: () => this.chartMenuService.downloadChart(this.chartController) },
        chartMenu: { iconName: 'menuAlt', callback: (eventSource: HTMLElement) => this.showMenuList(eventSource) }
    };

    private panels: ChartToolPanelMenuOptions[] = [];
    private defaultPanel: ChartToolPanelMenuOptions;

    private static TEMPLATE = /* html */ `<div></div>`;

    private eHideButton: HTMLButtonElement;
    private eHideButtonIcon: HTMLSpanElement;
    private chartToolbar: ChartToolbar;
    private tabbedMenu: TabbedChartMenu;
    private menuPanel?: AgPanel;
    private menuVisible = false;
    private chartToolbarOptions: ChartMenuOptions[];
    private legacyFormat: boolean;

    constructor(
        private readonly eChartContainer: HTMLElement,
        private readonly eMenuPanelContainer: HTMLElement,
        private readonly chartController: ChartController,
        private readonly chartOptionsService: ChartOptionsService) {
        super(ChartMenu.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.legacyFormat = this.gridOptionsService.get('legacyChartsMenu');

        
        this.chartToolbar = this.createManagedBean(new ChartToolbar());
        this.getGui().appendChild(this.chartToolbar.getGui());
        if (this.legacyFormat) {
            this.createLegacyToggleButton();
        }
        
        this.refreshToolbarAndPanels();

        this.addManagedListener(this.eventService, Events.EVENT_CHART_CREATED, (e: ChartCreated) => {
            if (e.chartId === this.chartController.getChartId()) {
                const showDefaultToolPanel = Boolean(this.gridOptionsService.get('chartToolPanelsDef')?.defaultToolPanel);
                if (showDefaultToolPanel) {
                    this.showMenu(this.defaultPanel, false, true);
                }
            }
        });
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_LINKED_CHANGED, this.refreshToolbarAndPanels.bind(this));

        this.refreshMenuClasses();

        if (!this.legacyFormat || (!this.gridOptionsService.get('suppressChartToolPanelsButton') && this.panels.length > 0)) {
            this.getGui().classList.add('ag-chart-tool-panel-button-enable');
            if (this.eHideButton) {
                this.addManagedListener(this.eHideButton, 'click', this.toggleMenu.bind(this));
            }
        }

        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.refreshToolbarAndPanels.bind(this));
    }

    public isVisible(): boolean {
        return this.menuVisible;
    }

    public getExtraPaddingDirections(): ExtraPaddingDirection[]  {
        const topItems: ChartMenuOptions[] = ['chartLink', 'chartUnlink', 'chartDownload'];
        const rightItems: ChartMenuOptions[] = ['chartSettings', 'chartData', 'chartFormat'];

        const result: ExtraPaddingDirection[] = [];
        if (topItems.some(v => this.chartToolbarOptions.includes(v))) {
            result.push('top');
        }

        if (rightItems.some(v => this.chartToolbarOptions.includes(v))) {
            result.push(this.gridOptionsService.get('enableRtl') ? 'left' : 'right');
        }

        return result;
    }

    private createLegacyToggleButton(): void {
        const eDocument = this.gridOptionsService.getDocument();
        this.eHideButton = eDocument.createElement('button');
        this.eHideButton.classList.add('ag-button', 'ag-chart-menu-close');
        this.eHideButtonIcon = eDocument.createElement('span');
        this.eHideButtonIcon.classList.add('ag-icon', 'ag-icon-contracted');
        this.eHideButton.appendChild(this.eHideButtonIcon);
        this.getGui().appendChild(this.eHideButton);
    }

    private refreshToolbarAndPanels(): void {
        this.initToolbarOptionsAndPanels();
        this.updateToolbar();
    }

    private initToolbarOptionsAndPanels(): void {
        const useChartToolPanelCustomisation = Boolean(this.gridOptionsService.get('chartToolPanelsDef')) || !this.legacyFormat;

        if (useChartToolPanelCustomisation) {
            const defaultChartToolbarOptions: ChartMenuOptions[] = this.legacyFormat ? [
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ] : [
                'chartMenu'
            ];
    
            const toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
            const params: WithoutGridCommon<GetChartToolbarItemsParams> = {
                defaultItems: defaultChartToolbarOptions
            };
            const chartToolbarOptions = toolbarItemsFunc
                ? toolbarItemsFunc(params).filter(option => {
                    if (!(this.legacyFormat ? CHART_TOOLBAR_ALLOW_LIST : [...CHART_TOOLBAR_ALLOW_LIST, 'chartMenu']).includes(option)) {
                        let msg;
                        if (CHART_TOOL_PANEL_ALLOW_LIST.includes(option as any)) {
                            msg = `'${option}' is a Chart Tool Panel option and will be ignored since 'chartToolPanelsDef' is used. Please use 'chartToolPanelsDef.panels' grid option instead`
                        } else if (option === 'chartMenu') {
                            msg = `'chartMenu' is only allowed as a Chart Toolbar Option when 'legacyChartsMenu' is set to false`;
                        } else {
                            msg = `'${option}' is not a valid Chart Toolbar Option`;
                        }
                        _.warnOnce(msg);
                        return false;
                    }

                    return true;
                })
                : defaultChartToolbarOptions;

            const panelsOverride = this.gridOptionsService.get('chartToolPanelsDef')?.panels
                ?.map(panel => {
                    const menuOption = CHART_TOOL_PANEL_MENU_OPTIONS[panel]
                    if (!menuOption) {
                        _.warnOnce(`Invalid panel in chartToolPanelsDef.panels: '${panel}'`);
                    }
                    return menuOption;
                })
                .filter(panel => Boolean(panel));
            this.panels = panelsOverride
                ? panelsOverride
                : Object.values(CHART_TOOL_PANEL_MENU_OPTIONS);

            // pivot charts use the column tool panel instead of the data panel
            if (this.chartController.isPivotChart()) {
                this.panels = this.panels.filter(panel => panel !== 'chartData');
            }

            const defaultToolPanel = this.gridOptionsService.get('chartToolPanelsDef')?.defaultToolPanel;
            this.defaultPanel = (defaultToolPanel && CHART_TOOL_PANEL_MENU_OPTIONS[defaultToolPanel]) || this.panels[0];

            this.chartToolbarOptions = this.panels.length > 0 && this.legacyFormat
                // Only one panel is required to display menu icon in toolbar
                ? [this.panels[0], ...chartToolbarOptions]
                : chartToolbarOptions;
        } else { // To be deprecated in future. Toolbar options will be different to chart tool panels.
            let tabOptions: ChartMenuOptions[] = [
                'chartSettings',
                'chartData',
                'chartFormat',
                this.chartController.isChartLinked() ? 'chartLink' : 'chartUnlink',
                'chartDownload'
            ];
    
            const toolbarItemsFunc = this.gridOptionsService.getCallback('getChartToolbarItems');
    
            if (toolbarItemsFunc) {
                const isLegacyToolbar = this.gridOptionsService.get('suppressChartToolPanelsButton');
                const params: WithoutGridCommon<GetChartToolbarItemsParams> = {
                    defaultItems: isLegacyToolbar ? tabOptions : CHART_TOOLBAR_ALLOW_LIST
                };
    
                tabOptions = toolbarItemsFunc(params).filter(option => {
                    if (!this.buttons[option]) {
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
            if (this.chartController.isPivotChart()) {
                tabOptions = tabOptions.filter(option => option !== 'chartData');
            }
    
            const ignoreOptions: ChartMenuOptions[] = ['chartUnlink', 'chartLink', 'chartDownload'];
            this.panels = tabOptions.filter(option => ignoreOptions.indexOf(option) === -1) as ChartToolPanelMenuOptions[];
            this.defaultPanel = this.panels[0];
    
            this.chartToolbarOptions =  tabOptions.filter(value =>
                ignoreOptions.indexOf(value) !== -1 ||
                (this.panels.length && value === this.panels[0])
            );
        }
    }

    private updateToolbar(): void {
        const buttons = this.chartToolbarOptions.map(buttonName => {
            const { iconName, callback } = this.buttons[buttonName];
            return {
                buttonName,
                iconName,
                callback
            };
        });
        this.chartToolbar.updateParams({ buttons });
    }

    private createMenuPanel(defaultTab: number): AgPromise<AgPanel> {
        const width = this.environment.chartMenuPanelWidth();

        const menuPanel = this.menuPanel = this.createBean(new AgPanel({
            minWidth: width,
            width,
            height: '100%',
            closable: true,
            hideTitleBar: true,
            cssIdentifier: 'chart-menu'
        }));

        menuPanel.setParentComponent(this);
        this.eMenuPanelContainer.appendChild(menuPanel.getGui());

        this.tabbedMenu = this.createBean(new TabbedChartMenu({
            controller: this.chartController,
            type: this.chartController.getChartType(),
            panels: this.panels,
            chartOptionsService: this.chartOptionsService
        }));

        this.addManagedListener(
            menuPanel,
            Component.EVENT_DESTROYED,
            () => this.destroyBean(this.tabbedMenu)
        );

        return new AgPromise((res: (arg0: any) => void) => {
            window.setTimeout(() => {
                menuPanel.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(defaultTab);
                res(menuPanel);
                if (this.legacyFormat) {
                    this.addManagedListener(
                        this.eChartContainer,
                        'click',
                        (event: MouseEvent) => {
                            if (this.getGui().contains(event.target as HTMLElement)) {
                                return;
                            }

                            if (this.menuVisible) {
                                this.hideMenu();
                            }
                        }
                    );
                }
            }, 100);
        });
    }

    private showContainer(suppressFocus?: boolean) {
        if (!this.menuPanel) { return; }

        this.menuVisible = true;
        this.showParent(this.menuPanel.getWidth()!);
        this.refreshMenuClasses();
        if (!suppressFocus) {
            this.tabbedMenu.focusHeader();
        }
    }

    private toggleMenu() {
        this.menuVisible ? this.hideMenu(this.legacyFormat) : this.showMenu(undefined, this.legacyFormat);
    }

    public showMenu(
        /**
         * Menu panel to show. If empty, shows the existing menu, or creates the default menu if menu panel has not been created
         */
        panel?: ChartToolPanelMenuOptions,
        /**
         * Whether to animate the menu opening
         */
        animate: boolean = true,
        suppressFocus?: boolean
    ): void {
        if (!animate) {
            this.eMenuPanelContainer.classList.add('ag-no-transition');
        }

        if (this.menuPanel && !panel) {
            this.showContainer(suppressFocus);
        } else {
            const menuPanel = panel || this.defaultPanel;
            let tab = this.panels.indexOf(menuPanel);
            if (tab < 0) {
                console.warn(`AG Grid: '${panel}' is not a valid Chart Tool Panel name`);
                tab = this.panels.indexOf(this.defaultPanel)
            }
    
            if (this.menuPanel) {
                this.tabbedMenu.showTab(tab);
                this.showContainer(suppressFocus);
            } else {
                this.createMenuPanel(tab).then(() => this.showContainer(suppressFocus));
            }
        }


        if (!animate) {
            // Wait for menu to render
            setTimeout(() => {
                if (!this.isAlive()) { return; }
                this.eMenuPanelContainer.classList.remove('ag-no-transition');
            }, 500);
        }
    }

    public hideMenu(animate: boolean = true): void {
        if (!animate) {
            this.eMenuPanelContainer.classList.add('ag-no-transition');
        }
        this.hideParent();

        window.setTimeout(() => {
            this.menuVisible = false;
            this.refreshMenuClasses();
            if (!animate) {
                this.eMenuPanelContainer.classList.remove('ag-no-transition');
            }
        }, 500);
    }

    private refreshMenuClasses() {
        this.eChartContainer.classList.toggle('ag-chart-menu-visible', this.menuVisible);
        this.eChartContainer.classList.toggle('ag-chart-menu-hidden', !this.menuVisible);

        if (this.legacyFormat && !this.gridOptionsService.get('suppressChartToolPanelsButton')) {
            this.eHideButtonIcon.classList.toggle('ag-icon-contracted', this.menuVisible);
            this.eHideButtonIcon.classList.toggle('ag-icon-expanded', !this.menuVisible);
        }
    }

    private showParent(width: number): void {
        this.eMenuPanelContainer.style.minWidth = `${width}px`;
    }

    private hideParent(): void {
        this.eMenuPanelContainer.style.minWidth = '0';
    }

    private showMenuList(eventSource: HTMLElement): void {
        this.chartMenuListFactory.showMenuList({
            eventSource,
            showMenu: () => this.showMenu(undefined, false),
            chartController: this.chartController
        });
    }

    protected destroy() {
        super.destroy();

        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.destroyBean(this.menuPanel);
        }

        if (this.tabbedMenu && this.tabbedMenu.isAlive()) {
            this.destroyBean(this.tabbedMenu);
        }
    }
}
