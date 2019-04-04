import {
    _,
    Autowired,
    Component,
    MenuItemDef,
    PostConstruct,
    RefSelector,
    Dialog,
    PopupService,
    GridOptionsWrapper,
    ChartType,
    EventService,
    TabbedLayout,
    TabbedItem,
    Promise,
    GridApi,
    PopupComponent
} from "ag-grid-community";
import { MenuItemMapper } from "../../menu/menuItemMapper";
import { MenuList } from "../../menu/menuList";
import { MenuItemComponent } from "../../menu/menuItemComponent";
import { IGridChartComp } from "../gridChartComp";
import { TabSelectedEvent } from "../../menu/enterpriseMenu";

export class ChartMenu extends Component {

    private static TEMPLATE =
        `<div class="ag-chart-menu">
            <span ref="eChartMenu" class="ag-icon-menu"></span>
        </div>`;

    @RefSelector('eChartMenu') private eChartMenu: HTMLElement;

    private readonly chart: Component;

    constructor(chart: Component) {
        super(ChartMenu.TEMPLATE);
        this.chart = chart;
    }

    @Autowired('popupService') private popupService: PopupService;

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

    public static TAB_GENERAL = 'generalMenuTab';

    public static TABS_DEFAULT = [TabbedChartMenu.TAB_GENERAL];

    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;
    @Autowired('gridApi') private gridApi: GridApi;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private mainMenuList: MenuList;

    private tabItemGeneral: TabbedItem;
    private tabFactories:{[p:string]:() => TabbedItem} = {};

    private readonly chart: Component;

    constructor(chart: Component) {
        super();
        this.chart = chart;
        this.tabFactories[TabbedChartMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
    }

    public getMinDimensions(): {width: number, height: number} {
        return this.tabbedLayout.getMinDimensions();
    }

    @PostConstruct
    public init(): void {
        const tabs = TabbedChartMenu.TABS_DEFAULT.map(menuTabName => this.createTab(menuTabName));

        this.tabbedLayout = new TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });

        this.showTab(TabbedChartMenu.TAB_GENERAL);
    }

    private createTab(name: string):TabbedItem {
        return this.tabFactories[name]();
    }

    private createMainPanel(): TabbedItem {

        this.mainMenuList = new MenuList();
        this.getContext().wireBean(this.mainMenuList);

        const menuItems = this.getMenuItems();

        this.mainMenuList.addMenuItems(menuItems);
        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsWrapper, null),
            bodyPromise: Promise.resolve(this.mainMenuList.getGui()),
            name: TabbedChartMenu.TAB_GENERAL
        };

        return this.tabItemGeneral;
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
        if (this.tabItemGeneral && toShow === TabbedChartMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        } else {
            this.tabbedLayout.showFirstItem();
        }
    }

    private onTabItemClicked(event: any): void {
        let key: string | null = null;
        switch (event.item) {
            case this.tabItemGeneral: key = TabbedChartMenu.TAB_GENERAL; break;
        }
        if (key) {
            const ev: TabSelectedEvent = {
                type: TabbedChartMenu.EVENT_TAB_SELECTED,
                key: key
            };
            this.dispatchEvent(ev);
        }
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    public afterGuiAttached(params: any): void {
        this.tabbedLayout.setAfterAttachedParams({hidePopup: params.hidePopup});
        this.hidePopupFunc = params.hidePopup;
        const initialScroll = this.gridApi.getHorizontalPixelRange().left;
        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        const onBodyScroll = (event: any) => {
            // if h scroll, popup is no longer over the column
            if (event.direction === 'horizontal') {
                const newScroll = this.gridApi.getHorizontalPixelRange().left;

                if (Math.abs(newScroll - initialScroll) > this.gridOptionsWrapper.getScrollbarWidth()) {
                    params.hidePopup();
                }
            }
        };

        this.addDestroyFunc(params.hidePopup);

        this.addDestroyableEventListener(this.eventService, 'bodyScroll', onBodyScroll);
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