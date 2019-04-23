import {
    _,
    AgEvent,
    Autowired,
    ChartType,
    Component,
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
import { ChartController } from "../chartController";
import { MenuList } from "../../../menu/menuList";
import { ChartColumnPanel } from "./chartColumnPanel";
import { MenuItemComponent } from "../../../menu/menuItemComponent";

export interface DownloadChartEvent extends AgEvent {}

export class ChartMenu extends Component {

    public static EVENT_DOWNLOAD_CHART = 'downloadChart';

    private static TEMPLATE =
        `<div class="ag-chart-menu">
            <span ref="eChartButton" class="ag-icon-chart"></span>
            <span ref="eDataButton" class="ag-icon-data"></span>
            <span ref="eSaveButton" class="ag-icon-save"></span>
        </div>`;

    @Autowired('popupService') private popupService: PopupService;

    @RefSelector('eChartButton') private eChartButton: HTMLElement;
    @RefSelector('eDataButton') private eDataButton: HTMLElement;
    @RefSelector('eSaveButton') private eSaveButton: HTMLElement;

    private readonly chartController: ChartController;
    private tabbedMenu: TabbedChartMenu;

    constructor(chartController: ChartController) {
        super(ChartMenu.TEMPLATE);
        this.chartController = chartController;
    }

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eChartButton, 'click', () => this.showMenu());
        this.addDestroyableEventListener(this.eDataButton, 'click', () => this.showMenu(1));
        this.addDestroyableEventListener(this.eSaveButton, 'click', () => this.saveChart());
    }

    private saveChart() {
            const event: DownloadChartEvent = {
                type: ChartMenu.EVENT_DOWNLOAD_CHART
            };
            this.dispatchEvent(event);
    }

    private showMenu(tab?: number): void {
        this.tabbedMenu = new TabbedChartMenu(this.chartController);
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

        this.popupService.positionPopupUnderComponent({
                type: 'chartMenu',
                eventSource: this.eChartButton,
                ePopup: this.tabbedMenu.getGui(),
                alignSide: 'right',
                keepWithinBounds: true
            }
        );

        this.tabbedMenu.showTab(tab);
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

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private mainMenuList: MenuList;

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
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this)
        });
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

        this.chartColumnPanel = new ChartColumnPanel(this.chartController);
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
                        action: () => this.chartController.setChartType(ChartType.GroupedBar)
                    },
                    {
                        name: localeTextFunc('stackedBarRangeChart', 'Bar (Stacked)'),
                        action: () => this.chartController.setChartType(ChartType.StackedBar)
                    },
                    {
                        name: localeTextFunc('lineRangeChart', 'Line'),
                        action: () => this.chartController.setChartType(ChartType.Line)
                    },
                    {
                        name: localeTextFunc('pieRangeChart', 'Pie'),
                        action: () => this.chartController.setChartType(ChartType.Pie)
                    }
                ]
            }
        ];
    }

    public showTab(tab?: number) {
        if (!tab) {
            this.tabbedLayout.showFirstItem();
        } else {
            this.tabbedLayout.showItem(this.tabs[tab]);
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
        if (this.chartColumnPanel) {
            this.chartColumnPanel.destroy();
        }
        super.destroy();
    }
}