import {
    Utils,
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
    AgEvent,
    IRowModel,
    Constants,
    PostConstruct,
    FilterWrapper,
    Promise,
    BeanStub
} from "ag-grid";
import {ColumnSelectComp} from "../toolPanel/columnsSelect/columnSelectComp";
import {MenuList} from "./menuList";
import {MenuItemComponent} from "./menuItemComponent";
import {MenuItemMapper} from "./menuItemMapper";

export interface TabSelectedEvent extends AgEvent {
    key: string;
}

@Bean('menuFactory')
export class EnterpriseMenuFactory implements IMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private lastSelectedTab: string;

    private activeMenu: EnterpriseMenu;

    public hideActiveMenu(): void {
        if (this.activeMenu) {
            this.activeMenu.destroy();
        }
    }

    public showMenuAfterMouseEvent(column:Column, mouseEvent:MouseEvent, defaultTab?:string): void {

        this.showMenu(column, (menu: EnterpriseMenu)=> {
            this.popupService.positionPopupUnderMouseEvent({
                column: column,
                type: 'columnMenu',
                mouseEvent: mouseEvent,
                ePopup: menu.getGui()
            });
            if (defaultTab){
                menu.showTab(defaultTab);
            }
        }, defaultTab);

    }

    public showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, defaultTab?:string, restrictToTabs?:string[]): void {

        this.showMenu(column, (menu: EnterpriseMenu)=> {
            this.popupService.positionPopupUnderComponent({
                column: column,
                type: 'columnMenu',
                eventSource: eventSource,
                ePopup: menu.getGui(),
                nudgeX: -9,
                nudgeY: -26,
                minWidth: menu.getMinWidth(),
                keepWithinBounds: true
            });
            if (defaultTab){
                menu.showTab(defaultTab);
            }
        }, defaultTab, restrictToTabs);

    }

    public showMenu(column: Column, positionCallback: (menu: EnterpriseMenu)=>void, defaultTab?:string, restrictToTabs?:string[]): void {
        let menu = new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs);
        this.context.wireBean(menu);

        let eMenuGui =  menu.getGui();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        let hidePopup = this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            () => { // menu closed callback
                menu.destroy();
                column.setMenuVisible(false, "contextMenu");
            }
        );

        positionCallback(menu);

        menu.afterGuiAttached({
            hidePopup: hidePopup
        });

        if (!defaultTab){
            menu.showTabBasedOnPreviousSelection();
        }

        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event: any) => {
            this.lastSelectedTab = event.key
        } );

        column.setMenuVisible(true, "contextMenu");

        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTORYED, ()=> {
            if (this.activeMenu===menu) {
                this.activeMenu = null;
            }
        });
    }

    public isMenuEnabled(column: Column): boolean {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    }
}

export class EnterpriseMenu extends BeanStub {

    public static EVENT_TAB_SELECTED = 'tabSelected';

    public static TAB_FILTER = 'filterMenuTab';
    public static TAB_GENERAL = 'generalMenuTab';
    public static TAB_COLUMNS = 'columnsMenuTab';

    public static TABS_DEFAULT = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];

    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('context') private context: Context;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;
    @Autowired('rowModel') private rowModel: IRowModel;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private column: Column;
    private mainMenuList: MenuList;

    private columnSelectPanel: ColumnSelectComp;

    private tabItemFilter: TabbedItem;
    private tabItemGeneral: TabbedItem;
    private tabItemColumns: TabbedItem;

    private initialSelection: string;
    private tabFactories:{[p:string]:()=>TabbedItem} = {};
    private includeChecks:{[p:string]:()=>boolean} = {};
    private restrictTo ?: string[];

    constructor(column: Column, initialSelection: string, restrictTo ?: string[]) {
        super();
        this.column = column;
        this.initialSelection = initialSelection;
        this.tabFactories[EnterpriseMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_FILTER] = this.createFilterPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = this.createColumnsPanel.bind(this);

        this.includeChecks[EnterpriseMenu.TAB_GENERAL] = ()=> true;
        this.includeChecks[EnterpriseMenu.TAB_FILTER] = () => {
            let isFilterEnabled: boolean = this.gridOptionsWrapper.isEnableFilter();
            let isFloatingFiltersEnabled: boolean = this.gridOptionsWrapper.isFloatingFilter();
            let isAnyFilteringEnabled = isFilterEnabled || isFloatingFiltersEnabled;

            let suppressFilterForThisColumn = this.column.getColDef().suppressFilter;
            return isAnyFilteringEnabled && !suppressFilterForThisColumn;
        };
        this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = ()=> true;
        this.restrictTo = restrictTo;
    }

    public getMinWidth(): number {
        return this.tabbedLayout.getMinWidth();
    }

    @PostConstruct
    public init(): void {
        let items:TabbedItem[] = this.column.getMenuTabs (this.restrictTo ? this.restrictTo : EnterpriseMenu.TABS_DEFAULT)
            .filter(menuTabName=>
                this.isValidMenuTabItem(menuTabName)
            )
            .filter(menuTabName=>
                this.isNotSuppressed(menuTabName)
            )
            .map(menuTabName=>
                this.createTab(menuTabName)
            );
        this.tabbedLayout = new TabbedLayout({
            items: items,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
    }

    private isValidMenuTabItem(menuTabName: string): boolean {
        let isValid: boolean = true;
        let itemsToConsider: string[] = EnterpriseMenu.TABS_DEFAULT;

        if (this.restrictTo != null){
            isValid = this.restrictTo.indexOf(menuTabName) > -1 ;
            itemsToConsider = this.restrictTo;
        }

        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1 ;

        if (!isValid) console.warn(`Trying to render an invalid menu item '${menuTabName}'. Check that your 'menuTabs' contains one of [${itemsToConsider}]`);

        return isValid;
    }

    private isNotSuppressed(menuTabName: string):boolean{
        return this.includeChecks[menuTabName]();
    }

    private createTab(name: string):TabbedItem{
        return this.tabFactories[name]();
    }

    public showTabBasedOnPreviousSelection(): void {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    }

    public showTab(toShow:string) {
        if (this.tabItemColumns && toShow === EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter && toShow === EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && toShow === EnterpriseMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            this.tabbedLayout.showFirstItem();
        }
    }

    private onTabItemClicked(event: any): void {
        let key: string;
        switch (event.item) {
            case this.tabItemColumns: key = EnterpriseMenu.TAB_COLUMNS; break;
            case this.tabItemFilter: key = EnterpriseMenu.TAB_FILTER; break;
            case this.tabItemGeneral: key = EnterpriseMenu.TAB_GENERAL; break;
        }
        if (key) {
            let event: TabSelectedEvent = {
                type: EnterpriseMenu.EVENT_TAB_SELECTED,
                key: key
            };
            this.dispatchEvent(event);
        }
    }

    public destroy(): void {
        if (this.columnSelectPanel) {
            this.columnSelectPanel.destroy();
        }
        if (this.mainMenuList) {
            this.mainMenuList.destroy();
        }
        super.destroy();
    }

    private getMenuItems(): (string|MenuItemDef)[] {
        let defaultMenuOptions = this.getDefaultMenuOptions();
        let result: (string|MenuItemDef)[];

        let userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();
        if (userFunc) {
            let userOptions = userFunc({
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
        let result: string[] = [];

        let allowPinning = !this.column.isLockPinned();

        let rowGroupCount = this.columnController.getRowGroupColumns().length;
        let doingGrouping = rowGroupCount > 0;

        let groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        let allowValue = this.column.isAllowValue();
        let allowRowGroup = this.column.isAllowRowGroup();
        let isPrimary = this.column.isPrimary();
        let pivotModeOn = this.columnController.isPivotMode();

        let isInMemoryRowModel = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_IN_MEMORY;

        let allowValueAgg =
            // if primary, then only allow aggValue if grouping and it's a value columns
            (isPrimary && doingGrouping && allowValue)
            // secondary columns can always have aggValue, as it means it's a pivot value column
            || !isPrimary;

        if (allowPinning) {
            result.push('pinSubMenu');
        }

        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }

        if (allowPinning || allowValueAgg) {
            result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        }

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

        // only add grouping expand/collapse if grouping in the InMemoryRowModel

        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        let allowExpandAndContract = isInMemoryRowModel && (pivotModeOn ? rowGroupCount > 1 : rowGroupCount > 0);
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }

        return result;
    }

    private createMainPanel(): TabbedItem {

        this.mainMenuList = new MenuList();
        this.context.wireBean(this.mainMenuList);

        let menuItems = this.getMenuItems();
        let menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);

        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

        this.tabItemGeneral = {
            title: Utils.createIconNoSpan('menu', this.gridOptionsWrapper, this.column),
            bodyPromise: Promise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };

        return this.tabItemGeneral;
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    private createFilterPanel(): TabbedItem {

        let filterWrapper:FilterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column);

        let afterFilterAttachedCallback: Function;
        filterWrapper.filterPromise.then(filter=>{
            if (filter.afterGuiAttached) {
                afterFilterAttachedCallback = filter.afterGuiAttached.bind(filter);
            }
        });

        this.tabItemFilter = {
            title: Utils.createIconNoSpan('filter', this.gridOptionsWrapper, this.column),
            bodyPromise: filterWrapper.guiPromise.promise,
            afterAttachedCallback: afterFilterAttachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };

        return this.tabItemFilter;
    }

    private createColumnsPanel(): TabbedItem {

        let eWrapperDiv = document.createElement('div');
        Utils.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');

        this.columnSelectPanel = new ColumnSelectComp(false);
        this.context.wireBean(this.columnSelectPanel);

        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());

        this.tabItemColumns = {
            title: Utils.createIconNoSpan('columns', this.gridOptionsWrapper, this.column),//createColumnsIcon(),
            bodyPromise: Promise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };

        return this.tabItemColumns;
    }

    public afterGuiAttached(params: any): void {
        this.tabbedLayout.setAfterAttachedParams({hidePopup: params.hidePopup});
        this.hidePopupFunc = params.hidePopup;

        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        let onBodyScroll = (event: any) => {
            // if h scroll, popup is no longer over the column
            if (event.direction==='horizontal') {
                params.hidePopup();
            }
        };

        this.addDestroyFunc(params.hidePopup);

        this.addDestroyableEventListener(this.eventService, 'bodyScroll', onBodyScroll);
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }

}
