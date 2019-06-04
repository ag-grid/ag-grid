import {
    AgEvent,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnController,
    Constants,
    Context,
    EventService,
    FilterManager,
    FilterWrapper,
    GridApi,
    GridOptionsWrapper,
    IMenuFactory,
    IRowModel,
    MenuItemDef,
    PopupService,
    PostConstruct,
    Promise,
    TabbedItem,
    TabbedLayout,
    _
} from "ag-grid-community";
import { MenuList } from "./menuList";
import { MenuItemComponent } from "./menuItemComponent";
import { MenuItemMapper } from "./menuItemMapper";
import { PrimaryColsPanel } from "../sideBar/providedPanels/columns/panels/primaryColsPanel/primaryColsPanel";

export interface TabSelectedEvent extends AgEvent {
    key: string;
}

@Bean('menuFactory')
export class EnterpriseMenuFactory implements IMenuFactory {

    @Autowired('context') private context: Context;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private lastSelectedTab: string;

    private activeMenu: EnterpriseMenu | null;

    public hideActiveMenu(): void {
        if (this.activeMenu) {
            this.activeMenu.destroy();
        }
    }

    public showMenuAfterMouseEvent(column:Column, mouseEvent:MouseEvent, defaultTab?:string): void {

        this.showMenu(column, (menu: EnterpriseMenu) => {
            this.popupService.positionPopupUnderMouseEvent({
                column: column,
                type: 'columnMenu',
                mouseEvent: mouseEvent,
                ePopup: menu.getGui()
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, defaultTab);

    }

    public showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, defaultTab?:string, restrictToTabs?:string[]): void {

        let multiplier = -1;
        let alignSide: 'left' | 'right' = 'left';

        if (this.gridOptionsWrapper.isEnableRtl()) {
            multiplier = 1;
            alignSide = 'right';
        }

        this.showMenu(column, (menu: EnterpriseMenu) => {
            const minDims = menu.getMinDimensions();
            this.popupService.positionPopupUnderComponent({
                column: column,
                type: 'columnMenu',
                eventSource: eventSource,
                ePopup: menu.getGui(),
                nudgeX: 9 * multiplier,
                nudgeY: -23,
                minWidth: minDims.width,
                minHeight: minDims.height,
                alignSide,
                keepWithinBounds: true
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, defaultTab, restrictToTabs);

    }

    public showMenu(column: Column, positionCallback: (menu: EnterpriseMenu) => void, defaultTab?:string, restrictToTabs?:string[]): void {
        const menu = new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs);
        this.context.wireBean(menu);

        const eMenuGui =  menu.getGui();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        const hidePopup = this.popupService.addAsModalPopup(
            eMenuGui,
            true,
            () => { // menu closed callback
                menu.destroy();
                column.setMenuVisible(false, "contextMenu");
            }
        );

        menu.afterGuiAttached({
            hidePopup: hidePopup
        });

        positionCallback(menu);

        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
        }

        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event: any) => {
            this.lastSelectedTab = event.key;
        });

        column.setMenuVisible(true, "contextMenu");

        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
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
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('menuItemMapper') private menuItemMapper: MenuItemMapper;
    @Autowired('rowModel') private rowModel: IRowModel;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private column: Column;
    private mainMenuList: MenuList;

    private columnSelectPanel: PrimaryColsPanel;

    private tabItemFilter: TabbedItem;
    private tabItemGeneral: TabbedItem;
    private tabItemColumns: TabbedItem;

    private initialSelection: string;
    private tabFactories:{[p:string]:() => TabbedItem} = {};
    private includeChecks:{[p:string]:() => boolean} = {};
    private restrictTo ?: string[];

    constructor(column: Column, initialSelection: string, restrictTo ?: string[]) {
        super();
        this.column = column;
        this.initialSelection = initialSelection;
        this.tabFactories[EnterpriseMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_FILTER] = this.createFilterPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = this.createColumnsPanel.bind(this);

        this.includeChecks[EnterpriseMenu.TAB_GENERAL] = () => true;
        this.includeChecks[EnterpriseMenu.TAB_FILTER] = () => column.isFilterAllowed();
        this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = () => true;
        this.restrictTo = restrictTo;
    }

    public getMinDimensions(): {width: number, height: number} {
        return this.tabbedLayout.getMinDimensions();
    }

    @PostConstruct
    public init(): void {
        const tabs = this.getTabsToCreate()
            .map(menuTabName => this.createTab(menuTabName));

        this.tabbedLayout = new TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
    }

    private getTabsToCreate() {
        if (this.restrictTo) { return this.restrictTo; }

        return this.column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT)
            .filter(tabName => this.isValidMenuTabItem(tabName))
            .filter(tabName => this.isNotSuppressed(tabName));
    }

    private isValidMenuTabItem(menuTabName: string): boolean {
        let isValid: boolean = true;
        let itemsToConsider: string[] = EnterpriseMenu.TABS_DEFAULT;

        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1 ;
            itemsToConsider = this.restrictTo;
        }

        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1 ;

        if (!isValid) { console.warn(`Trying to render an invalid menu item '${menuTabName}'. Check that your 'menuTabs' contains one of [${itemsToConsider}]`); }

        return isValid;
    }

    private isNotSuppressed(menuTabName: string):boolean {
        return this.includeChecks[menuTabName]();
    }

    private createTab(name: string):TabbedItem {
        return this.tabFactories[name]();
    }

    public showTabBasedOnPreviousSelection(): void {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    }

    public showTab(toShow:string) {
        if (this.tabItemColumns && toShow === EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        } else if (this.tabItemFilter && toShow === EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        } else if (this.tabItemGeneral && toShow === EnterpriseMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        } else {
            this.tabbedLayout.showFirstItem();
        }
    }

    private onTabItemClicked(event: any): void {
        let key: string | null = null;
        switch (event.item) {
            case this.tabItemColumns: key = EnterpriseMenu.TAB_COLUMNS; break;
            case this.tabItemFilter: key = EnterpriseMenu.TAB_FILTER; break;
            case this.tabItemGeneral: key = EnterpriseMenu.TAB_GENERAL; break;
        }
        if (key) {
            const ev: TabSelectedEvent = {
                type: EnterpriseMenu.EVENT_TAB_SELECTED,
                key: key
            };
            this.dispatchEvent(ev);
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

    private getMenuItems(): (string | MenuItemDef)[] {
        const defaultMenuOptions = this.getDefaultMenuOptions();
        let result: (string | MenuItemDef)[];

        const userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();
        if (userFunc) {
            const userOptions = userFunc({
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
        _.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);

        return result;
    }

    private getDefaultMenuOptions(): string[] {
        const result: string[] = [];

        const allowPinning = !this.column.getColDef().lockPinned;

        const rowGroupCount = this.columnController.getRowGroupColumns().length;
        const doingGrouping = rowGroupCount > 0;

        const groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        const allowValue = this.column.isAllowValue();
        const allowRowGroup = this.column.isAllowRowGroup();
        const isPrimary = this.column.isPrimary();
        const pivotModeOn = this.columnController.isPivotMode();

        const isInMemoryRowModel = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;

        const usingTreeData = this.gridOptionsWrapper.isTreeData();

        const allowValueAgg =
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

        // only add grouping expand/collapse if grouping in the InMemoryRowModel

        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.

        let allowExpandAndContract = false;
        if (isInMemoryRowModel) {
            if (usingTreeData) {
                allowExpandAndContract = true;
            } else {
                allowExpandAndContract = pivotModeOn ? rowGroupCount > 1 : rowGroupCount > 0;
            }
        }
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }

        return result;
    }

    private createMainPanel(): TabbedItem {

        this.mainMenuList = new MenuList();
        this.getContext().wireBean(this.mainMenuList);

        const menuItems = this.getMenuItems();
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);

        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));

        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsWrapper, this.column),
            bodyPromise: Promise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };

        return this.tabItemGeneral;
    }

    private onHidePopup(): void {
        this.hidePopupFunc();
    }

    private createFilterPanel(): TabbedItem {
        const filterWrapper:FilterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');

        let afterFilterAttachedCallback: any = null;

        // slightly odd block this - this promise will always have been resolved by the time it gets here, so won't be
        // async (_unless_ in react or similar, but if so why not encountered before now?).
        // I'd suggest a future improvement would be to remove/replace this promise as this block just wont work if it is
        // async and is confusing if you don't have this context
        filterWrapper.filterPromise.then(filter => {
            if (filter.afterGuiAttached) {
                afterFilterAttachedCallback = filter.afterGuiAttached.bind(filter);
            }
        });

        this.tabItemFilter = {
            title: _.createIconNoSpan('filter', this.gridOptionsWrapper, this.column),
            bodyPromise: filterWrapper.guiPromise.promise,
            afterAttachedCallback: afterFilterAttachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };

        return this.tabItemFilter;
    }

    private createColumnsPanel(): TabbedItem {

        const eWrapperDiv = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');

        this.columnSelectPanel = new PrimaryColsPanel(false, {
            suppressValues: false,
            suppressPivots: false,
            suppressRowGroups: false,
            suppressPivotMode: false,
            contractColumnSelection: false,
            suppressColumnExpandAll: false,
            suppressColumnFilter: false,
            suppressColumnSelectAll: false,
            suppressSideButtons: false,
            api: this.gridApi
        });
        this.getContext().wireBean(this.columnSelectPanel);

        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());

        this.tabItemColumns = {
            title: _.createIconNoSpan('columns', this.gridOptionsWrapper, this.column), //createColumnsIcon(),
            bodyPromise: Promise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };

        return this.tabItemColumns;
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
        return this.tabbedLayout.getGui();
    }
}
