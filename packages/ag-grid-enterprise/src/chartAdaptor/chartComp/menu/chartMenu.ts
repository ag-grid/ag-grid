import {
    _,
    AgDialog,
    AgEvent,
    AgPanel,
    Autowired,
    ChartMenuOptions,
    Component,
    GetChartToolbarItemsParams,
    GridOptionsWrapper,
    PostConstruct,
    Promise
} from "ag-grid-community";
import {TabbedChartMenu} from "./tabbedChartMenu";
import {ChartController} from "../chartController";
import {GridChartComp} from "../gridChartComp";

type ChartToolbarButtons = {
    [key in ChartMenuOptions]: [string, (e: MouseEvent) => any | void]
};

export class ChartMenu extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public static EVENT_DOWNLOAD_CHART = 'downloadChart';

    private buttons: ChartToolbarButtons = {
        chartSettings: ['menu', () => this.showMenu('chartSettings')],
        chartData: ['menu' , () => this.showMenu('chartData')],
        chartFormat: ['menu', () => this.showMenu('chartFormat')],
        chartUnlink: ['linked', (e) => this.toggleDetached(e)],
        chartDownload: ['save', () => this.saveChart()]
    };

    private tabs: ChartMenuOptions[] = [];

    private static TEMPLATE =
        `<div class="ag-chart-menu"></div>`;

    private readonly chartController: ChartController;
    private tabbedMenu: TabbedChartMenu;
    private menuPanel: AgPanel | AgDialog | undefined;

    constructor(chartController: ChartController) {
        super(ChartMenu.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.createButtons();
    }

    private getToolbarOptions(): ChartMenuOptions[] {
        let tabOptions: ChartMenuOptions[] = ['chartSettings', 'chartData', 'chartFormat', 'chartUnlink', 'chartDownload'];
        const toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();

        if (toolbarItemsFunc) {
            const params: GetChartToolbarItemsParams = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                defaultItems: tabOptions
            };

            tabOptions = (toolbarItemsFunc(params) as ChartMenuOptions[]).filter(option => {
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

        return tabOptions.filter(value => ignoreOptions.indexOf(value) !== -1 || (this.tabs.length && value === this.tabs[0]));
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

        chartToolbarOptions.forEach(button => {
            const buttonConfig = this.buttons[button];
            const [ iconName, callback ] = buttonConfig;
            const buttonEl = _.createIconNoSpan(iconName, this.gridOptionsWrapper, undefined, true);
            this.addDestroyableEventListener(buttonEl, 'click', callback);
            this.getGui().appendChild(buttonEl);
        });
    }

    private saveChart() {
        const event: AgEvent = {
            type: ChartMenu.EVENT_DOWNLOAD_CHART
        };
        this.dispatchEvent(event);
    }

    private createMenu(defaultTab: number): Promise<AgPanel> {
        const chartComp = this.getParentComponent() as GridChartComp;
        const dockedContainer = chartComp.getDockedContainer();
        const context = this.getContext();

        const menuPanel = this.menuPanel = new AgPanel({
            minWidth: 220,
            width: 220,
            height: '100%',
            closable: true,
            hideTitleBar: true
        });
        context.wireBean(this.menuPanel);

        menuPanel.setParentComponent(this);
        dockedContainer.appendChild(menuPanel.getGui());

        this.tabbedMenu = new TabbedChartMenu({
            controller: this.chartController,
            type: chartComp.getCurrentChartType(),
            panels: this.tabs
        });
        context.wireBean(this.tabbedMenu);

        this.addDestroyableEventListener(this.menuPanel, Component.EVENT_DESTROYED, () => {
            this.tabbedMenu.destroy();
        });

        return new Promise((res) => {
            window.setTimeout(() => {
                menuPanel.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(defaultTab);
                this.addDestroyableEventListener(chartComp.getChartComponentsWrapper(), 'click', () => {
                    if (_.containsClass(chartComp.getGui(), 'ag-has-menu')) {
                        this.hideMenu();
                    }
                });
                res(menuPanel);
            }, 100);
        });
    }

    private slideDockedContainer() {
        const chartComp = this.getParentComponent() as GridChartComp;
        chartComp.slideDockedOut((this.menuPanel as AgPanel).getWidth());
        window.setTimeout(() => {
            _.addCssClass(this.getParentComponent()!.getGui(), 'ag-has-menu');
        }, 500);
    }

    private showMenu(tabName: ChartMenuOptions): void {
        const tab = this.tabs.indexOf(tabName);

        if (!this.menuPanel) {
            this.createMenu(tab)
            .then(() => {
                this.slideDockedContainer();
            });
        } else {
            this.slideDockedContainer();
        }
    }

    private hideMenu(): void {
        const chartComp = this.getParentComponent() as GridChartComp;
        chartComp.slideDockedIn();
        _.removeCssClass(this.getParentComponent()!.getGui(), 'ag-has-menu');
    }

    public destroy() {
        super.destroy();
        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.menuPanel.destroy();
        }
    }
}
