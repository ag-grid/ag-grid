import {
    Utils,
    SvgFactory,
    Bean,
    IMenuFactory,
    Autowired,
    Context,
    PopupService,
    GridOptionsWrapper,
    Column,
    ColumnController,
    FilterManager,
    MenuItemDef,
    GridApi,
    TabbedLayout,
    EventService,
    TabbedItem,
    PostConstruct
} from "ag-grid";
import {ColumnSelectPanel} from "../toolPanel/columnsSelect/columnSelectPanel";
import {MenuList} from "./menuList";
import {MenuItemComponent} from "./menuItemComponent";
import {MenuItemMapper} from "./menuItemMapper";

var svgFactory = SvgFactory.getInstance();

@Bean('menuFactory')
export class EnterpriseMenuFactory implements IMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private lastSelectedTab: string;

    public showMenuAfterMouseEvent(column:Column, mouseEvent:MouseEvent): void {

        this.showMenu(column, (menu: EnterpriseMenu)=> {
            this.popupService.positionPopupUnderMouseEvent({
                mouseEvent: mouseEvent,
                ePopup: menu.getGui()
            });
        });

    }

    public showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void {

        this.showMenu(column, (menu: EnterpriseMenu)=> {
            this.popupService.positionPopupUnderComponent({eventSource: eventSource,
                ePopup: menu.getGui(),
                nudgeX: -9,
                nudgeY: -26,
                minWidth: menu.getMinWidth(),
                keepWithinBounds: true
            });
        });

    }

    public showMenu(column: Column, positionCallback: (menu: EnterpriseMenu)=>void): void {

        var menu = new EnterpriseMenu(column, this.lastSelectedTab);
        this.context.wireBean(menu);

        var eMenuGui =  menu.getGui();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            ()=> menu.destroy()
        );

        positionCallback(menu);

        menu.afterGuiAttached({
            hidePopup: hidePopup
        });

        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event: any) => {
            this.lastSelectedTab = event.key
        } );
    }

    public isMenuEnabled(column: Column): boolean {

        var showColumnPanel = !this.gridOptionsWrapper.isSuppressMenuColumnPanel();
        var showMainPanel = !this.gridOptionsWrapper.isSuppressMenuMainPanel();
        var showFilterPanel = !this.gridOptionsWrapper.isSuppressMenuFilterPanel() && column.isFilterAllowed();

        return showColumnPanel || showMainPanel || showFilterPanel;
    }
}

export class EnterpriseMenu {

    public static EVENT_TAB_SELECTED = 'tabSelected';

    public static TAB_FILTER = 'filter';
    public static TAB_GENERAL = 'general';
    public static TAB_COLUMNS = 'columns';

    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private column: Column;
    private mainMenuList: MenuList;

    private columnSelectPanel: ColumnSelectPanel;
    private localEventService = new EventService();

    private tabItemFilter: TabbedItem;
    private tabItemGeneral: TabbedItem;
    private tabItemColumns: TabbedItem;

    private initialSelection: string;
    private destroyFunctions: Function[] = [];

    constructor(column: Column, initialSelection: string) {
        this.column = column;
        this.initialSelection = initialSelection;
    }

    public addEventListener(event: string, listener: Function): void {
        this.localEventService.addEventListener(event, listener);
    }

    public getMinWidth(): number {
        return this.tabbedLayout.getMinWidth();
    }

    @PostConstruct
    public init(): void {

        var tabItems: TabbedItem[] = [];
        if (!this.gridOptionsWrapper.isSuppressMenuMainPanel()) {
            this.createMainPanel();
            tabItems.push(this.tabItemGeneral);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuFilterPanel() && this.column.isFilterAllowed()) {
            this.createFilterPanel();
            tabItems.push(this.tabItemFilter);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuColumnPanel()) {
            this.createColumnsPanel();
            tabItems.push(this.tabItemColumns);
        }

        this.tabbedLayout = new TabbedLayout({
            items: tabItems,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
    }

    private showTabBasedOnPreviousSelection(): void {
        // show the tab the user was on last time they had a menu open
        if (this.tabItemColumns && this.initialSelection===EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter&& this.initialSelection===EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && this.initialSelection===EnterpriseMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            this.tabbedLayout.showFirstItem();
        }
    }

    private onTabItemClicked(event: any): void {
        var key: string;
        switch (event.item) {
            case this.tabItemColumns: key = EnterpriseMenu.TAB_COLUMNS; break;
            case this.tabItemFilter: key = EnterpriseMenu.TAB_FILTER; break;
            case this.tabItemGeneral: key = EnterpriseMenu.TAB_GENERAL; break;
        }
        if (key) {
            this.localEventService.dispatchEvent(EnterpriseMenu.EVENT_TAB_SELECTED, {key: key});
        }
    }

    public destroy(): void {
        if (this.columnSelectPanel) {
            this.columnSelectPanel.destroy();
        }
        if (this.mainMenuList) {
            this.mainMenuList.destroy();
        }
        this.destroyFunctions.forEach(func => func());
    }

    private getMenuItems(): (string|MenuItemDef)[] {
        var defaultMenuOptions = this.getDefaultMenuOptions();
        var result: (string|MenuItemDef)[];

        var userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();
        if (userFunc) {
            var userOptions = userFunc({
                column: this.column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                defaultItems: defaultMenuOptions
            });
            result = userOptions;
        } else {
            result = defaultMenuOptions;
        }

        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        Utils.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);

        return result;
    }

    private getDefaultMenuOptions(): string[] {
        var result: string[] = [];

        var rowGroupCount = this.columnController.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;

        var groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        var allowValue = this.column.isAllowValue();
        var allowRowGroup = this.column.isAllowRowGroup();
        var isPrimary = this.column.isPrimary();
        var pivotModeOn = this.columnController.isPivotMode();

        result.push('pinSubMenu');

        var allowValueAgg =
            // if primary, then only allow aggValue if grouping and it's a value columns
            (isPrimary && doingGrouping && allowValue)
            // secondary columns can always have aggValue, as it means it's a pivot value column
            || !isPrimary;

        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }

        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);

        if (allowRowGroup && this.column.isPrimary()) {
            if (groupedByThisColumn) {
                result.push('rowUnGroup');
            } else {
                result.push('rowGroup');
            }
        }
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        result.push('resetColumns');
        result.push('toolPanel');

        // only add grouping expand/collapse if grouping

        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        var allowExpandAndContract = pivotModeOn ? rowGroupCount > 1 : rowGroupCount > 0;
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }

        return result;
    }

    private createMainPanel(): void {

        this.mainMenuList = new MenuList();
        this.context.wireBean(this.mainMenuList);

        let menuItems = this.getMenuItems();
        let menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);

        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

        this.tabItemGeneral = {
            title: svgFactory.createMenuSvg(),
            body: this.mainMenuList.getGui()
        };
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    private createFilterPanel(): void {

        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column);

        var afterFilterAttachedCallback: Function;
        if (filterWrapper.filter.afterGuiAttached) {
            afterFilterAttachedCallback = filterWrapper.filter.afterGuiAttached.bind(filterWrapper.filter);
        }

        this.tabItemFilter = {
            title: svgFactory.createFilterSvg12(),
            body: filterWrapper.gui,
            afterAttachedCallback: afterFilterAttachedCallback
        };
    }

    private createColumnsPanel(): void {

        var eWrapperDiv = document.createElement('div');
        Utils.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');

        this.columnSelectPanel = new ColumnSelectPanel(false);
        this.context.wireBean(this.columnSelectPanel);

        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());

        this.tabItemColumns = {
            title: svgFactory.createColumnsSvg12(),//createColumnsIcon(),
            body: eWrapperDiv
        };
    }

    public afterGuiAttached(params: any): void {
        this.tabbedLayout.setAfterAttachedParams({hidePopup: params.hidePopup});
        this.showTabBasedOnPreviousSelection();
        this.hidePopupFunc = params.hidePopup;

        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        var onBodyScroll = (event: any) => {
            // if h scroll, popup is no longer over the column
            if (event.direction==='horizontal') {
                params.hidePopup();
            }
        };
        this.eventService.addEventListener('bodyScroll', onBodyScroll);
        this.destroyFunctions.push( ()=> this.eventService.removeEventListener('bodyScroll', onBodyScroll) );
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }

}
