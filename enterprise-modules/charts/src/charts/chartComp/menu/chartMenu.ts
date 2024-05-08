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
    PostConstruct
} from "@ag-grid-community/core";

import { TabbedChartMenu } from "./tabbedChartMenu";
import { ChartController } from "../chartController";
import { ExtraPaddingDirection } from "../chartProxies/chartProxy";
import { ChartMenuListFactory } from "./chartMenuList";
import { ChartToolbar } from "./chartToolbar";
import { ChartMenuService } from "../services/chartMenuService";
import { ChartMenuContext } from "./chartMenuContext";

type ChartToolbarButtons = {
    [key in ChartMenuOptions]: {
        iconName: string, callback: (eventSource: HTMLElement) => void
    }
};

export class ChartMenu extends Component {
    @Autowired('chartMenuService') private chartMenuService: ChartMenuService;
    @Autowired('chartMenuListFactory') private chartMenuListFactory: ChartMenuListFactory;

    private readonly chartController: ChartController;

    private buttons: ChartToolbarButtons = {
        chartSettings: { iconName: 'menu', callback: () => this.showMenu({ panel: this.defaultPanel }) },
        chartData: { iconName: 'menu', callback: () => this.showMenu({ panel: "chartData" }) },
        chartFormat: { iconName: 'menu', callback: () => this.showMenu({ panel: "chartFormat" }) },
        chartLink: { iconName: 'linked', callback: () => this.chartMenuService.toggleLinked(this.chartMenuContext) },
        chartUnlink: { iconName: 'unlinked', callback: () => this.chartMenuService.toggleLinked(this.chartMenuContext) },
        chartDownload: { iconName: 'save', callback: () => this.chartMenuService.downloadChart(this.chartMenuContext) },
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
        private readonly chartMenuContext: ChartMenuContext
    ) {
        super(ChartMenu.TEMPLATE);
        this.chartController = chartMenuContext.chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.legacyFormat = this.chartMenuService.isLegacyFormat();

        this.chartToolbar = this.createManagedBean(new ChartToolbar());
        this.getGui().appendChild(this.chartToolbar.getGui());
        if (this.legacyFormat) {
            this.createLegacyToggleButton();
        }
        
        this.refreshToolbarAndPanels();

        this.addManagedListener(this.eventService, Events.EVENT_CHART_CREATED, (e: ChartCreated) => {
            if (e.chartId === this.chartController.getChartId()) {
                const showDefaultToolPanel = Boolean(this.gos.get('chartToolPanelsDef')?.defaultToolPanel);
                if (showDefaultToolPanel) {
                    this.showMenu({ panel: this.defaultPanel, animate: false, suppressFocus: true });
                }
            }
        });
        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_LINKED_CHANGED, this.refreshToolbarAndPanels.bind(this));

        this.refreshMenuClasses();

        if (this.legacyFormat && !this.gos.get('suppressChartToolPanelsButton') && this.panels.length > 0) {
            this.getGui().classList.add('ag-chart-tool-panel-button-enable');
            if (this.eHideButton) {
                this.addManagedListener(this.eHideButton, 'click', this.toggleMenu.bind(this));
            }
        }
        if (!this.legacyFormat) {
            this.getGui().classList.add('ag-chart-menu-wrapper');
        }

        this.addManagedListener(this.chartController, ChartController.EVENT_CHART_API_UPDATE, this.refreshToolbarAndPanels.bind(this));
    }

    public isVisible(): boolean {
        return this.menuVisible;
    }

    public getExtraPaddingDirections(): ExtraPaddingDirection[]  {
        const topItems: ChartMenuOptions[] = ['chartMenu', 'chartLink', 'chartUnlink', 'chartDownload'];
        const rightItems: ChartMenuOptions[] = ['chartSettings', 'chartData', 'chartFormat'];

        const result: ExtraPaddingDirection[] = [];
        if (topItems.some(v => this.chartToolbarOptions.includes(v))) {
            result.push('top');
        }

        if (rightItems.some(v => this.chartToolbarOptions.includes(v))) {
            result.push(this.gos.get('enableRtl') ? 'left' : 'right');
        }

        return result;
    }

    private createLegacyToggleButton(): void {
        const eDocument = this.gos.getDocument();
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
        const {
            panels,
            defaultPanel,
            chartToolbarOptions
        } = this.chartMenuService.getToolbarOptionsAndPanels(this.chartController);
        this.panels = panels;
        this.defaultPanel = defaultPanel;
        this.chartToolbarOptions = chartToolbarOptions;
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
        const width = this.environment.getDefaultChartMenuPanelWidth();

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

        this.tabbedMenu = this.createBean(new TabbedChartMenu(
            this.panels,
            this.chartMenuContext
        ));

        this.addManagedListener(this.tabbedMenu, TabbedChartMenu.EVENT_CLOSED, () => {
            this.hideMenu(false);
        });

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

    private showContainer(eventSource?: HTMLElement, suppressFocus?: boolean) {
        if (!this.menuPanel) { return; }

        this.menuVisible = true;
        this.showParent(this.menuPanel.getWidth()!);
        this.refreshMenuClasses();
        this.tabbedMenu.showMenu(eventSource, suppressFocus);
    }

    private toggleMenu() {
        this.menuVisible ? this.hideMenu(this.legacyFormat) : this.showMenu({ animate: this.legacyFormat });
    }

    public showMenu(params: {
        /**
         * Menu panel to show. If empty, shows the existing menu, or creates the default menu if menu panel has not been created
         */
        panel?: ChartToolPanelMenuOptions,
        /**
         * Whether to animate the menu opening
         */
        animate?: boolean,
        eventSource?: HTMLElement,
        suppressFocus?: boolean
    }): void {
        const { panel, animate = true, eventSource, suppressFocus } = params;
        if (!animate) {
            this.eMenuPanelContainer.classList.add('ag-no-transition');
        }

        if (this.menuPanel && !panel) {
            this.showContainer(eventSource, suppressFocus);
        } else {
            const menuPanel = panel || this.defaultPanel;
            let tab = this.panels.indexOf(menuPanel);
            if (tab < 0) {
                console.warn(`AG Grid: '${panel}' is not a valid Chart Tool Panel name`);
                tab = this.panels.indexOf(this.defaultPanel)
            }
    
            if (this.menuPanel) {
                this.tabbedMenu.showTab(tab);
                this.showContainer(eventSource, suppressFocus);
            } else {
                this.createMenuPanel(tab).then(() => this.showContainer(eventSource, suppressFocus));
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

        if (this.legacyFormat && !this.gos.get('suppressChartToolPanelsButton')) {
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
            showMenu: () => this.showMenu({ animate: false, eventSource }),
            chartMenuContext: this.chartMenuContext
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
