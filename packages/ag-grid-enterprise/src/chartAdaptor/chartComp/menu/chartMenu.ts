import {
    AgEvent,
    Autowired,
    ChartType,
    Component,
    GridOptionsWrapper,
    MenuItemDef,
    PostConstruct,
    Promise,
    RefSelector,
    TabbedItem,
    TabbedLayout,
    Dialog,
    _
} from "ag-grid-community";
import { ChartController } from "../chartController";
import { MenuList } from "../../../menu/menuList";
import { ChartColumnPanel } from "./chartColumnPanel";

export interface DownloadChartEvent extends AgEvent {}

export class ChartMenu extends Component {

    public static EVENT_DOWNLOAD_CHART = 'downloadChart';

    private static TEMPLATE =
        `<div class="ag-chart-menu">
            <span ref="eChartButton" class="ag-icon-chart"></span>
            <span ref="eDataButton" class="ag-icon-data"></span>
            <span ref="eSaveButton" class="ag-icon-save"></span>
        </div>`;

    @RefSelector('eChartButton') private eChartButton: HTMLElement;
    @RefSelector('eDataButton') private eDataButton: HTMLElement;
    @RefSelector('eSaveButton') private eSaveButton: HTMLElement;

    private readonly chartController: ChartController;
    private tabbedMenu: TabbedChartMenu;
    private menuDialog: Dialog;

    constructor(chartController: ChartController) {
        super(ChartMenu.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eChartButton, 'click', (e: MouseEvent) => this.showMenu(0, e));
        this.addDestroyableEventListener(this.eDataButton, 'click', (e: MouseEvent) => this.showMenu(1, e));
        this.addDestroyableEventListener(this.eSaveButton, 'click', () => this.saveChart());
    }

    private saveChart() {
            const event: DownloadChartEvent = {
                type: ChartMenu.EVENT_DOWNLOAD_CHART
            };
            this.dispatchEvent(event);
    }

    private showMenu(tab: number, e: MouseEvent): void {
        this.menuDialog = new Dialog({
            movable: true,
            resizable: true,
            maximizable: false,
            width: 250,
            height: 250,
            x: e.clientX,
            y: e.clientY + 10
        });

        this.tabbedMenu = new TabbedChartMenu(this.chartController);

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

class TabbedChartMenu extends Component {

    public static EVENT_TAB_SELECTED = 'tabSelected';
    public static TAB_MAIN = 'mainMenuTab';
    public static TAB_COLUMNS = 'columnsMenuTab';
    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private tabbedLayout: TabbedLayout;

    private chartColumnPanel: ChartColumnPanel;

    private tabs: TabbedItem[];
    private readonly chartController: ChartController;

    constructor(chartController: ChartController) {
        super();
        this.chartController = chartController;
    }

    @PostConstruct
    public init(): void {
        const mainTab = this.createMainPanel();
        const columnsTab = this.createColumnsPanel();

        this.tabs = [mainTab, columnsTab];

        this.tabbedLayout = new TabbedLayout({
            items: this.tabs,
            cssClass: 'ag-chart-tabbed-menu'
        });
    }

    public getMinDimensions(): {width: number, height: number} {
        return this.tabbedLayout.getMinDimensions();
    }

    private createMainPanel(): TabbedItem {
        const chartTypes = new Component('<div class="ag-chart-types"></div>');
        const eGui = chartTypes.getGui();
        const menuItems = this.chartTypes();

        menuItems.forEach(item => {
            const el = document.createElement('div');
            _.addCssClass(el, 'ag-chart-type');
            el.appendChild((item.icon as HTMLElement));
            el.setAttribute('title', item.name);
            eGui.appendChild(el);
            if (item.action) {
                el.addEventListener('click', item.action);
            }
        });

        return {
            title: _.createIconNoSpan('chart', this.gridOptionsWrapper, null),
            bodyPromise: Promise.resolve(eGui),
            name: TabbedChartMenu.TAB_MAIN,
            afterAttachedCallback: () => {
                (this.parentComponent as Dialog).setTitle('Chart Settings');
            }
        };
    }

    private createColumnsPanel(): TabbedItem {
        //TODO refactor class to be chart menu specific
        const eWrapperDiv: HTMLElement = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-column-select-panel');

        this.chartColumnPanel = new ChartColumnPanel(this.chartController);
        this.getContext().wireBean(this.chartColumnPanel);
        this.chartColumnPanel.init();

        eWrapperDiv.appendChild(this.chartColumnPanel.getGui());

        return {
            title: _.createIconNoSpan('data', this.gridOptionsWrapper, null),
            bodyPromise: Promise.resolve(eWrapperDiv),
            name: TabbedChartMenu.TAB_COLUMNS,
            afterAttachedCallback: () => {
                (this.parentComponent as Dialog).setTitle('Chart Data');
            }
        };
    }

    private chartTypes(): MenuItemDef[] {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        return [
            {
                name: localeTextFunc('groupedBarRangeChart', 'Bar (Grouped)'),
                icon: _.createIconNoSpan('chartBarGrouped', this.gridOptionsWrapper, null),
                action: () => this.chartController.setChartType(ChartType.GroupedBar)
            },
            {
                name: localeTextFunc('stackedBarRangeChart', 'Bar (Stacked)'),
                icon: _.createIconNoSpan('chartBarStacked', this.gridOptionsWrapper, null),
                action: () => this.chartController.setChartType(ChartType.StackedBar)
            },
            {
                name: localeTextFunc('pieRangeChart', 'Pie'),
                icon: _.createIconNoSpan('chartPie', this.gridOptionsWrapper, null),
                action: () => this.chartController.setChartType(ChartType.Pie)
            },
            {
                name: localeTextFunc('lineRangeChart', 'Line'),
                icon: _.createIconNoSpan('chartLine', this.gridOptionsWrapper, null),
                action: () => this.chartController.setChartType(ChartType.Line)
            },
            {
                name: localeTextFunc('donutRangeChart', 'Donut'),
                icon: _.createIconNoSpan('chartDonut', this.gridOptionsWrapper, null),
                action: () => this.chartController.setChartType(ChartType.Donut)
            }
        ];
    }

    public showTab(tab: number) {
        const tabItem = this.tabs[tab];
        this.tabbedLayout.showItem(tabItem);
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout && this.tabbedLayout.getGui();
    }

    public destroy(): void {
        if (this.chartColumnPanel) {
            this.chartColumnPanel.destroy();
        }

        if (this.parentComponent && this.parentComponent.isAlive()) {
            this.parentComponent.destroy();
        }
        super.destroy();
    }
}