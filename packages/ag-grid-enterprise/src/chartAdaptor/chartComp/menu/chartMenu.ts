import {
    Autowired,
    AgEvent,
    Component,
    ChartToolbarOptions,
    Dialog,
    GetChartToolbarItemsParams,
    GridOptionsWrapper,
    PostConstruct,
    Promise,
    _
} from "ag-grid-community";
import { TabbedChartMenu } from "./tabbedChartMenu";
import { ChartController } from "../chartController";
import { GridChartComp } from "../gridChartComp";

type ChartToolbarButtons = {
    [key in ChartToolbarOptions]: [string, () => any]
}

export class ChartMenu extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    public static EVENT_DOWNLOAD_CHART = 'downloadChart';

    private buttons: ChartToolbarButtons = {
        chartSettings: ['ag-icon-chart', () => this.showMenu('chartSettings')],
        chartData: ['ag-icon-data', () => this.showMenu('chartData')],
        chartDownload: ['ag-icon-save', () => this.saveChart()]
    };

    private tabs: ChartToolbarOptions[] = [];

    private static TEMPLATE =
        `<div class="ag-chart-menu"></div>`;

    private readonly chartController: ChartController;
    private tabbedMenu: TabbedChartMenu;
    private menuDialog: Dialog;

    constructor(chartController: ChartController) {
        super(ChartMenu.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.createButtons();
    }

    private getToolbarOptions(): ChartToolbarOptions[] {
        let chartToolbarOptions: ChartToolbarOptions[] = ['chartSettings', 'chartData', 'chartDownload'];
        const toolbarItemsFunc = this.gridOptionsWrapper.getChartToolbarItemsFunc();

        if (toolbarItemsFunc) {
            const params: GetChartToolbarItemsParams = {
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                defaultItems: chartToolbarOptions
            };

            chartToolbarOptions = (toolbarItemsFunc(params) as ChartToolbarOptions[]).filter(option => {
                if (!this.buttons[option]) {
                    console.warn(`ag-Grid: '${option} is not a valid Chart Toolbar Option`);
                    return false;
                }
                return true;
            });
        }

        this.tabs = chartToolbarOptions.filter(option => option !== 'chartDownload');

        return chartToolbarOptions;
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

    private showMenu(tabName: ChartToolbarOptions): void {
        const chartComp = this.parentComponent as GridChartComp;
        const parentGui = chartComp.getGui();
        const parentRect = parentGui.getBoundingClientRect();
        const tab = this.tabs.indexOf(tabName);

        this.menuDialog = new Dialog({
            alwaysOnTop: true,
            movable: true,
            resizable: {
                bottom: true,
                top: true
            },
            maximizable: false,
            minWidth: 220,
            width: 220,
            height: Math.min(390, parentRect.height),
            x: parentRect.right - 225,
            y: parentRect.top + 5
        });

        this.tabbedMenu = new TabbedChartMenu({
            controller: this.chartController, 
            type: chartComp.getCurrentChartType(),
            panels: this.tabs
        });

        new Promise((res) => {
            window.setTimeout(() => {
                this.menuDialog.setBodyComponent(this.tabbedMenu);
                this.tabbedMenu.showTab(tab);
            }, 100);
        });

        this.menuDialog.addDestroyableEventListener(this.menuDialog, Component.EVENT_DESTROYED, () => {
            this.tabbedMenu.destroy();
        });

        const context = this.getContext();

        context.wireBean(this.menuDialog);
        context.wireBean(this.tabbedMenu);

        this.menuDialog.setParentComponent(this);
    }

    public destroy() {
        super.destroy();
        if (this.tabbedMenu) {
            this.menuDialog.destroy();
        }
    }
}