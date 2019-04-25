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
import { ChartColumnPanel } from "./chartColumnPanel";
import { GridChartComp } from "../gridChartComp";
import { palettes } from "../../../charts/chart/palettes";

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
        this.addDestroyableEventListener(this.eChartButton, 'click', () => this.showMenu(0));
        this.addDestroyableEventListener(this.eDataButton, 'click', () => this.showMenu(1));
        this.addDestroyableEventListener(this.eSaveButton, 'click', () => this.saveChart());
    }

    private saveChart() {
            const event: DownloadChartEvent = {
                type: ChartMenu.EVENT_DOWNLOAD_CHART
            };
            this.dispatchEvent(event);
    }

    private showMenu(tab: number): void {
        const chartComp = this.parentComponent as GridChartComp;
        const parentGui = chartComp.getGui();
        const parentRect = parentGui.getBoundingClientRect();

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
            height: 450,
            x: parentRect.right - 225,
            y: parentRect.top + 5
        });

        this.tabbedMenu = new TabbedChartMenu(this.chartController, chartComp.getCurrentChartType());

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
    private currentChartType: ChartType;

    private chartColumnPanel: ChartColumnPanel;

    private tabs: TabbedItem[];
    private readonly chartController: ChartController;

    private chartIcons: HTMLElement[] = [];

    constructor(chartController: ChartController, currentChartType: ChartType) {
        super();
        this.chartController = chartController;
        this.currentChartType = currentChartType;
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
        const mainPanel = document.createElement('div');
        _.addCssClass(mainPanel, 'ag-chart-settings');

        this.addThumbnails(mainPanel);
        this.addColorSchemes(mainPanel);

        return {
            title: _.createIconNoSpan('chart', this.gridOptionsWrapper, null),
            bodyPromise: Promise.resolve(mainPanel),
            name: TabbedChartMenu.TAB_MAIN,
            afterAttachedCallback: () => {
                (this.parentComponent as Dialog).setTitle('Chart Settings');
            }
        };
    }

    private addThumbnails(el: HTMLElement) {
        const chartTypesEl = document.createElement('div');
        _.addCssClass(chartTypesEl, 'ag-chart-types');

        const menuItems = this.chartTypes();

        menuItems.forEach((item, idx) => {
            const thumbEl = document.createElement('div');
            _.addCssClass(thumbEl, 'ag-chart-type');
            if (idx === this.currentChartType) {
                _.addCssClass(thumbEl, 'ag-selected');
            }
            thumbEl.appendChild((item.icon as HTMLElement));
            thumbEl.setAttribute('title', item.name);

            if (item.action) {
                thumbEl.addEventListener('click', item.action);
            }
            this.chartIcons.push(thumbEl);

            chartTypesEl.appendChild(thumbEl);
        });

        el.appendChild(chartTypesEl);
    }

    private addColorSchemes(el: HTMLElement) {
        const groupEl = document.createElement('div');
        const groupLabel = document.createElement('div');
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc()

        _.addCssClass(groupEl, 'ag-chart-menu-group');
        _.addCssClass(groupLabel, 'ag-chart-menu-group-label');

        groupLabel.innerHTML = localeTextFunc('chartColorScheme', 'Colour Palette');
        groupEl.appendChild(groupLabel);
        
        palettes.forEach(scheme => {
            const itemEl = document.createElement('div');
            _.addCssClass(itemEl, 'ag-chart-menu-item');
            
            scheme.forEach((color: string) => {
                const colorEl = document.createElement('div');
                _.addCssClass(colorEl, 'ag-chart-menu-item-child');
                colorEl.style.backgroundColor = color;
                itemEl.appendChild(colorEl);
            });

            groupEl.appendChild(itemEl);
        });

        el.appendChild(groupEl);
    }

    private createColumnsPanel(): TabbedItem {
        const eWrapperDiv: HTMLElement = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-chart-data');

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
                action: () => {
                    this.chartController.setChartType(ChartType.GroupedBar);
                    this.updateCurrentChartType(ChartType.GroupedBar);
                }
            },
            {
                name: localeTextFunc('stackedBarRangeChart', 'Bar (Stacked)'),
                icon: _.createIconNoSpan('chartBarStacked', this.gridOptionsWrapper, null),
                action: () => {
                    this.chartController.setChartType(ChartType.StackedBar);
                    this.updateCurrentChartType(ChartType.StackedBar);
                }
            },
            {
                name: localeTextFunc('lineRangeChart', 'Line'),
                icon: _.createIconNoSpan('chartLine', this.gridOptionsWrapper, null),
                action: () => {
                    this.chartController.setChartType(ChartType.Line);
                    this.updateCurrentChartType(ChartType.Line);
                }
            },
            {
                name: localeTextFunc('pieRangeChart', 'Pie'),
                icon: _.createIconNoSpan('chartPie', this.gridOptionsWrapper, null),
                action: () => {
                    this.chartController.setChartType(ChartType.Pie);
                    this.updateCurrentChartType(ChartType.Pie);
                }
            },
            {
                name: localeTextFunc('doughnutRangeChart', 'Doughnut'),
                icon: _.createIconNoSpan('chartDonut', this.gridOptionsWrapper, null),
                action: () => {
                    this.chartController.setChartType(ChartType.Doughnut);
                    this.updateCurrentChartType(ChartType.Doughnut);
                }
            }
        ];
    }

    private updateCurrentChartType(chartType: ChartType) {
        _.removeCssClass(this.chartIcons[this.currentChartType], 'ag-selected');
        this.currentChartType = chartType;
        _.addCssClass(this.chartIcons[chartType], 'ag-selected');
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