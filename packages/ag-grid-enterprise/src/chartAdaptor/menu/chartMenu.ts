import {
    _,
    Autowired,
    ChartType,
    Component,
    Dialog,
    GridOptionsWrapper,
    MenuItemDef,
    PopupComponent,
    PopupService,
    PostConstruct,
    Promise,
    RefSelector,
    TabbedItem,
    TabbedLayout
} from "ag-grid-community";
import {MenuList} from "../../menu/menuList";
import {MenuItemComponent} from "../../menu/menuItemComponent";
import {IGridChartComp} from "../gridChartComp";
import {ChartColumnPanel} from "./chartColumnPanel";

export class ChartMenu extends Component {

    private static TEMPLATE =
        `<div class="ag-chart-menu">
            <span ref="eChartMenu" class="ag-icon-menu"></span>
        </div>`;

    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eChartMenu') private eChartMenu: HTMLElement;

    private readonly chart: Component;

    constructor(chart: Component) {
        super(ChartMenu.TEMPLATE);
        this.chart = chart;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eChartMenu, 'click', () => this.showMenu());
    }

    private showMenu(): void {
        const chartMenu = new TabbedChartMenu(this.chart);
        this.getContext().wireBean(chartMenu);

        chartMenu.setParentComponent(this);

        const eMenu = chartMenu.getGui();

        const hidePopup = this.popupService.addAsModalPopup(
            eMenu,
            true,
            () => chartMenu.destroy()
        );

        chartMenu.afterGuiAttached({
            hidePopup: hidePopup
        });

        this.popupService.positionPopupUnderComponent(
            {
                type: 'chartMenu',
                eventSource: this.eChartMenu,
                ePopup: chartMenu.getGui(),
                alignSide: 'right',
                keepWithinBounds: true
            });
    }
}

class TabbedChartMenu extends PopupComponent {

    public static EVENT_TAB_SELECTED = 'tabSelected';
    public static TAB_MAIN = 'mainMenuTab';
    public static TAB_COLUMNS = 'columnsMenuTab';
    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private mainMenuList: MenuList;

    private chartColumnPanel: ChartColumnPanel;

    private mainTab: TabbedItem;
    private columnsTab: TabbedItem;

    private readonly chart: Component;

    constructor(chart: Component) {
        super();
        this.chart = chart;
    }

    @PostConstruct
    public init(): void {
        this.mainTab = this.createMainPanel();
        this.columnsTab = this.createColumnsPanel();

        this.tabbedLayout = new TabbedLayout({
            items: [this.mainTab, this.columnsTab],
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this)
        });

        this.showTab(TabbedChartMenu.TAB_MAIN);
    }

    public getMinDimensions(): {width: number, height: number} {
        return this.tabbedLayout.getMinDimensions();
    }

    private createMainPanel(): TabbedItem {
        this.mainMenuList = new MenuList();
        this.getContext().wireBean(this.mainMenuList);

        const menuItems = this.getMenuItems();

        this.mainMenuList.addMenuItems(menuItems);
        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

        return {
            title: _.createIconNoSpan('menu', this.gridOptionsWrapper, null),
            bodyPromise: Promise.resolve(this.mainMenuList.getGui()),
            name: TabbedChartMenu.TAB_MAIN
        };
    }

    private createColumnsPanel(): TabbedItem {
        const eWrapperDiv: HTMLElement = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-column-select-panel');
        eWrapperDiv.style.height = '204px'; //TODO

        const chartComp: any = this.chart;
        this.chartColumnPanel = new ChartColumnPanel(chartComp as IGridChartComp);
        this.getContext().wireBean(this.chartColumnPanel);
        this.chartColumnPanel.init();

        eWrapperDiv.appendChild(this.chartColumnPanel.getGui());

        return {
            title: _.createIconNoSpan('columns', this.gridOptionsWrapper, null),
            bodyPromise: Promise.resolve(eWrapperDiv),
            name: TabbedChartMenu.TAB_COLUMNS
        };
    }

    private getMenuItems(): (string | MenuItemDef)[] {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        return [
            {
                name: 'Chart Type',
                subMenu: [
                    {
                        name: localeTextFunc('groupedBarRangeChart', 'Bar (Grouped)'),
                        action: () => {
                            const chartComp: any = this.chart;
                            (chartComp as IGridChartComp).setChartType(ChartType.GroupedBar);
                        }
                    },
                    {
                        name: localeTextFunc('stackedBarRangeChart', 'Bar (Stacked)'),
                        action: () => {
                            const chartComp: any = this.chart;
                            (chartComp as IGridChartComp).setChartType(ChartType.StackedBar);
                        }
                    },
                    {
                        name: localeTextFunc('lineRangeChart', 'Line'),
                        action: () => {
                            const chartComp: any = this.chart;
                            (chartComp as IGridChartComp).setChartType(ChartType.Line);
                        }
                    },
                    {
                        name: localeTextFunc('pieRangeChart', 'Pie'),
                        action: () => {
                            const chartComp: any = this.chart;
                            (chartComp as IGridChartComp).setChartType(ChartType.Pie);
                        }
                    }
                ]
            },
            TabbedChartMenu.MENU_ITEM_SEPARATOR,
            {
                name: localeTextFunc('formatChart', 'Format Chart'),
                action: () => {
                    console.log('See chart formatting tool panel...');
                }
            },
            {
                name: localeTextFunc('downloadChart', 'Download'),
                action: () => {
                    const chartComp: any = this.chart;
                    const chart = (chartComp as IGridChartComp).getChart();
                    chart.scene.download("chart");
                }
            },
            TabbedChartMenu.MENU_ITEM_SEPARATOR,
            {
                name: localeTextFunc('closeDialog', 'Close'),
                action: () => {
                    const chartContainer = this.chart.getParentComponent();
                    (chartContainer as Dialog).close();
                }
            }
        ];
    }

    public showTab(toShow?: string) {
        if (this.mainTab && toShow === TabbedChartMenu.TAB_MAIN) {
            this.tabbedLayout.showItem(this.mainTab);
        } else {
            this.tabbedLayout.showFirstItem();
        }
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    public afterGuiAttached(params: any): void {
        this.tabbedLayout.setAfterAttachedParams({hidePopup: params.hidePopup});
        this.hidePopupFunc = params.hidePopup;
        this.addDestroyFunc(params.hidePopup);
    }

    public getGui(): HTMLElement {
        const layout = this.tabbedLayout;
        return layout && layout.getGui();
    }

    public destroy(): void {
        if (this.mainMenuList) {
            this.mainMenuList.destroy();
        }
        super.destroy();
    }
}