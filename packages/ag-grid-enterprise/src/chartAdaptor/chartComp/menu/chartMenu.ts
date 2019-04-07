import {
    _,
    AgEvent,
    Autowired,
    ChartType,
    Component,
    EventService,
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
import {ChartModel} from "../chartModel";
import {MenuList} from "../../../menu/menuList";
import {ChartColumnPanel} from "./chartColumnPanel";
import {MenuItemComponent} from "../../../menu/menuItemComponent";

export interface DownloadChartEvent extends AgEvent {}
export interface CloseChartEvent extends AgEvent {}

export class ChartMenu extends Component {

    public static EVENT_DOWNLOAD_CHART = 'downloadChart';
    public static EVENT_CLOSE_CHART = 'closeChart';

    private static TEMPLATE =
        `<div class="ag-chart-menu">
            <span ref="eChartMenu" class="ag-icon-menu"></span>
        </div>`;

    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eChartMenu') private eChartMenu: HTMLElement;

    private readonly chartModel: ChartModel;
    private tabbedMenu: TabbedChartMenu;

    constructor(chartModel: ChartModel) {
        super(ChartMenu.TEMPLATE);
        this.chartModel = chartModel;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eChartMenu, 'click', () => this.showMenu());
    }

    private showMenu(): void {
        this.tabbedMenu = new TabbedChartMenu(this, this.chartModel);
        this.getContext().wireBean(this.tabbedMenu);

        this.tabbedMenu.setParentComponent(this);
        const eMenu = this.tabbedMenu.getGui();

        const hidePopup = this.popupService.addAsModalPopup(
            eMenu,
            true,
            () => this.tabbedMenu.destroy()
        );

        this.tabbedMenu.afterGuiAttached({
            hidePopup: hidePopup
        });

        this.popupService.positionPopupUnderComponent(
            {
                type: 'chartMenu',
                eventSource: this.eChartMenu,
                ePopup: this.tabbedMenu.getGui(),
                alignSide: 'right',
                keepWithinBounds: true
            });
    }

    public destroy() {
        super.destroy();
        if (this.tabbedMenu) {
            this.tabbedMenu.destroy();
        }
    }
}

class TabbedChartMenu extends PopupComponent {

    public static EVENT_TAB_SELECTED = 'tabSelected';

    public static TAB_MAIN = 'mainMenuTab';
    public static TAB_COLUMNS = 'columnsMenuTab';
    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private mainMenuList: MenuList;

    private chartColumnPanel: ChartColumnPanel;

    private mainTab: TabbedItem;
    private columnsTab: TabbedItem;

    private readonly chartMenu: ChartMenu;
    private readonly chartModel: ChartModel;

    constructor(chartMenu: ChartMenu, chartModel: ChartModel) {
        super();
        this.chartMenu = chartMenu;
        this.chartModel = chartModel;
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
        //TODO refactor class to be chart menu specific
        const eWrapperDiv: HTMLElement = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-column-select-panel');
        eWrapperDiv.style.height = '204px'; //TODO

        this.chartColumnPanel = new ChartColumnPanel(this.chartModel);
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
                        action: () => this.chartModel.setChartType(ChartType.GroupedBar)
                    },
                    {
                        name: localeTextFunc('stackedBarRangeChart', 'Bar (Stacked)'),
                        action: () => this.chartModel.setChartType(ChartType.StackedBar)
                    },
                    {
                        name: localeTextFunc('lineRangeChart', 'Line'),
                        action: () => this.chartModel.setChartType(ChartType.Line)
                    },
                    {
                        name: localeTextFunc('pieRangeChart', 'Pie'),
                        action: () => this.chartModel.setChartType(ChartType.Pie)
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
                name: localeTextFunc('testError', 'Show Error Message'),
                action: () => {
                    // TODO remove - just for testing
                    this.chartModel.setErrors(['Something went wrong - sorry!']);
                }
            },
            {
                name: localeTextFunc('downloadChart', 'Download'),
                action: () => {
                    const event: DownloadChartEvent = {
                        type: ChartMenu.EVENT_DOWNLOAD_CHART
                    };
                    this.chartMenu.dispatchEvent(event);
                }
            },
            TabbedChartMenu.MENU_ITEM_SEPARATOR,
            {
                name: localeTextFunc('closeDialog', 'Close'),
                action: () => {
                    const event: CloseChartEvent = {
                        type: ChartMenu.EVENT_CLOSE_CHART
                    };
                    this.chartMenu.dispatchEvent(event);
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