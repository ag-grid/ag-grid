import {
    _,
    AgEvent,
    AgPanel,
    Autowired,
    ChartMenuOptions,
    Component,
    GetChartToolbarItemsParams,
    GridOptionsWrapper,
    PostConstruct,
    Promise
} from "@ag-grid-community/core";

import { TabbedChartMenu } from "./tabbedChartMenu";
import { ChartController } from "../chartController";

type ChartToolbarButtons = {
    [key in ChartMenuOptions]: [string, (e: MouseEvent) => any | void]
};

export class ChartMenu extends Component {
    @Autowired("gridOptionsWrapper") private gridOptionsWrapper: GridOptionsWrapper;

    public static EVENT_DOWNLOAD_CHART = "downloadChart";

    private buttons: ChartToolbarButtons = {
        chartSettings: ['menu', () => this.showMenu("chartSettings")],
        chartData: ['menu', () => this.showMenu("chartData")],
        chartFormat: ['menu', () => this.showMenu("chartFormat")],
        chartUnlink: ['linked', e => this.toggleDetached(e)],
        chartDownload: ['save', () => this.saveChart()]
    };

    private tabs: ChartMenuOptions[] = [];

    private static TEMPLATE = `<div class="ag-chart-menu"></div>`;

    private tabbedMenu: TabbedChartMenu;
    private menuPanel?: AgPanel;
    private menuVisible = false;

    constructor(
        private readonly eChartContainer: HTMLElement,
        private readonly eMenuPanelContainer: HTMLElement,
        private readonly chartController: ChartController) {
        super(ChartMenu.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        this.createButtons();
        this.refreshMenuClasses();
    }

    public isVisible(): boolean {
        return this.menuVisible;
    }

    private getToolbarOptions(): ChartMenuOptions[] {
        let tabOptions: ChartMenuOptions[] = [
            'chartSettings',
            'chartData',
            'chartFormat',
            'chartUnlink',
            'chartDownload'
        ];

        const toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();

        if (toolbarItemsFunc) {
            const params: GetChartToolbarItemsParams = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                defaultItems: tabOptions
            };

            tabOptions = toolbarItemsFunc(params).filter(option => {
                if (!this.buttons[option]) {
                    console.warn(`ag-Grid: '${option} is not a valid Chart Toolbar Option`);
                    return false;
                }

                return true;
            });
        }

        // pivot charts use the column tool panel instead of the data panel
        if (this.chartController.isPivotChart()) {
            tabOptions = tabOptions.filter(option => option !== 'chartData');
        }

        const ignoreOptions: ChartMenuOptions[] = ['chartUnlink', 'chartDownload'];
        this.tabs = tabOptions.filter(option => ignoreOptions.indexOf(option) === -1);

        return tabOptions.filter(value =>
            ignoreOptions.indexOf(value) !== -1 ||
            (this.tabs.length && value === this.tabs[0])
        );
    }

    private toggleDetached(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        const active = _.containsClass(target, 'ag-icon-linked');

        _.addOrRemoveCssClass(target, 'ag-icon-linked', !active);
        _.addOrRemoveCssClass(target, 'ag-icon-unlinked', active);

        this.chartController.detachChartRange();
    }

    private createButtons(): void {
        const chartToolbarOptions = this.getToolbarOptions();
        const gui = this.getGui();

        chartToolbarOptions.forEach(button => {
            const buttonConfig = this.buttons[button];
            const [iconName, callback] = buttonConfig;
            const buttonEl = _.createIconNoSpan(
                iconName,
                this.gridOptionsWrapper,
                undefined,
                true
            );
            _.addCssClass(buttonEl, 'ag-chart-menu-icon');

            this.addDestroyableEventListener(buttonEl, 'click', callback);

            gui.appendChild(buttonEl);
        });
    }

    private saveChart() {
        const event: AgEvent = { type: ChartMenu.EVENT_DOWNLOAD_CHART };
        this.dispatchEvent(event);
    }

    private createMenuPanel(defaultTab: number): Promise<AgPanel> {
        const width = this.gridOptionsWrapper.chartMenuPanelWidth();

        const menuPanel = this.menuPanel = this.wireBean(new AgPanel({
            minWidth: width,
            width,
            height: '100%',
            closable: true,
            hideTitleBar: true,
            cssIdentifier: 'chart-menu'
        }));

        menuPanel.setParentComponent(this);
        this.eMenuPanelContainer.appendChild(menuPanel.getGui());

        this.tabbedMenu = this.wireBean(new TabbedChartMenu({
            controller: this.chartController,
            type: this.chartController.getChartType(),
            panels: this.tabs
        }));

        this.addDestroyableEventListener(
            menuPanel,
            Component.EVENT_DESTROYED,
            () => this.destroyBean(this.tabbedMenu)
        );

        return new Promise((res: (arg0: any) => void) => {
            window.setTimeout(() => {
                menuPanel.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(defaultTab);
                this.addDestroyableEventListener(
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
                res(menuPanel);
            }, 100);
        });
    }

    private showContainer() {
        if (!this.menuPanel) { return; }

        this.menuVisible = true;
        this.showParent(this.menuPanel.getWidth());
        this.refreshMenuClasses();
    }

    private showMenu(tabName: ChartMenuOptions): void {
        const tab = this.tabs.indexOf(tabName);

        if (!this.menuPanel) {
            this.createMenuPanel(tab).then(this.showContainer.bind(this));
        } else {
            this.showContainer();
        }
    }

    private hideMenu(): void {
        this.hideParent();

        window.setTimeout(() => {
            this.menuVisible = false;
            this.refreshMenuClasses();
        }, 500);
    }

    private refreshMenuClasses() {
        _.addOrRemoveCssClass(this.eChartContainer, 'ag-chart-menu-visible', this.menuVisible);
        _.addOrRemoveCssClass(this.eChartContainer, 'ag-chart-menu-hidden', !this.menuVisible);
    }

    private showParent(width: number): void {
        this.eMenuPanelContainer.style.minWidth = `${width}px`;
    }

    private hideParent(): void {
        this.eMenuPanelContainer.style.minWidth = '0';
    }

    protected destroy() {
        super.destroy();

        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.destroyBean(this.menuPanel);
        }
    }
}
