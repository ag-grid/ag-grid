import {
    Autowired,
    AgEvent,
    Component,
    ChartMenuOptions,
    AgDialog,
    GetChartToolbarItemsParams,
    GridOptionsWrapper,
    PostConstruct,
    Promise,
    _,
    AgPanel
} from "ag-grid-community";
import { TabbedChartMenu } from "./tabbedChartMenu";
import { ChartController } from "../chartController";
import { GridChartComp } from "../gridChartComp";

type ChartToolbarButtons = {
    [key in ChartMenuOptions]: [string, () => any]
}

export class ChartMenu extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public static EVENT_DOWNLOAD_CHART = 'downloadChart';

    private buttons: ChartToolbarButtons = {
        chartSettings: ['ag-icon-menu', () => this.showMenu(this.lastTab || 'chartSettings')],
        chartData: ['ag-icon-data' , () => this.showMenu(this.lastTab || 'chartData')],
        chartFormat: ['ag-icon-data', () => this.showMenu(this.lastTab || 'chartFormat')],
        chartDownload: ['ag-icon-save', () => this.saveChart()]
    };

    private tabs: ChartMenuOptions[] = [];

    private static TEMPLATE =
        `<div class="ag-chart-menu"></div>`;

    private readonly chartController: ChartController;
    private tabbedMenu: TabbedChartMenu;
    private menuPanel: AgPanel | AgDialog | undefined;
    private lastTab: ChartMenuOptions;

    constructor(chartController: ChartController) {
        super(ChartMenu.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.createButtons();
    }

    private getToolbarOptions(): ChartMenuOptions[] {
        let tabOptions: ChartMenuOptions[] = ['chartSettings', 'chartData', 'chartFormat', 'chartDownload'];
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

        this.tabs = tabOptions.filter(option => option !== 'chartDownload');

        const downloadIdx = tabOptions.indexOf('chartDownload');
        const firstItem = tabOptions.find(option => option !== 'chartDownload') as ChartMenuOptions;
        const chartDownload = 'chartDownload' as ChartMenuOptions;

        if (downloadIdx !== -1) {
            if (!firstItem) {
                return [chartDownload];
            } else {
                return downloadIdx === 0 ? [chartDownload].concat([firstItem]) : [firstItem].concat([chartDownload]);
            }
        }

        return [firstItem];
    }

    private createButtons(): void {
        const chartToolbarOptions = this.getToolbarOptions();

        chartToolbarOptions.forEach(button => {
            const buttonConfig = this.buttons[button];
            const [ iconCls, callback ] = buttonConfig;
            const buttonEl = document.createElement('span');
            _.addCssClass(buttonEl, 'ag-icon');
            _.addCssClass(buttonEl, iconCls);
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

    private showMenu(tabName: ChartMenuOptions): void {
        const chartComp = this.parentComponent as GridChartComp;
        const chartCompGui = chartComp.getGui();

        const tab = this.tabs.indexOf(tabName);
        const dockedContainer = chartComp.getDockedContainer();
        _.addCssClass(dockedContainer, 'ag-hidden');

        this.menuPanel = new AgPanel({
            minWidth: 220,
            width: 220,
            height: '100%',
            closable: true,
            hideTitleBar: true
        });

        this.menuPanel.setParentComponent(this);

        const menuPanelGui = this.menuPanel.getGui();

        dockedContainer.appendChild(menuPanelGui);

        let menuPanelListenerDestroy: () => void;

        _.addCssClass(chartCompGui, 'ag-has-menu');

        this.tabbedMenu = new TabbedChartMenu({
            controller: this.chartController, 
            type: chartComp.getCurrentChartType(),
            panels: this.tabs
        });

        new Promise((res) => {
            window.setTimeout(() => {
                this.menuPanel!.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(tab);
                _.removeCssClass(dockedContainer, 'ag-hidden');
                dockedContainer.style.minWidth = '220px';
                if (this.isAlive()) {
                    menuPanelListenerDestroy = this.addDestroyableEventListener(chartComp.getCartComponentsWrapper(), 'click', (e: MouseEvent) => {
                        if (this.menuPanel && this.menuPanel.isAlive()) {
                            this.menuPanel.close();
                        }
                    }) as () => void;
                }
            }, 100);
        });

        this.addDestroyableEventListener(this.menuPanel, Component.EVENT_DESTROYED, () => {
            this.tabbedMenu.destroy();

            if (chartComp.isAlive()) {
                if (menuPanelListenerDestroy) {
                    menuPanelListenerDestroy();
                }
                dockedContainer.style.minWidth = '0';
                _.removeCssClass(chartCompGui, 'ag-has-menu');
                this.menuPanel = undefined;
            }
        });

        const context = this.getContext();

        context.wireBean(this.menuPanel);
        context.wireBean(this.tabbedMenu);

        this.menuPanel.setParentComponent(this);
    }

    public setLastTab(tab: ChartMenuOptions) {
        this.lastTab = tab;
    }

    public destroy() {
        super.destroy();
        if (this.menuPanel && this.menuPanel.isAlive()) {
            this.menuPanel.destroy();
        }
    }
}