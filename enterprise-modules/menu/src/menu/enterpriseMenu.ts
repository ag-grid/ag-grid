import {
    _,
    AgEvent,
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnApi,
    ColumnModel,
    ColumnMenuTab,
    Constants,
    FilterManager,
    FilterWrapper,
    GridApi,
    IMenuFactory,
    IPrimaryColsPanel,
    IRowModel,
    MenuItemDef,
    ModuleNames,
    ModuleRegistry,
    PopupService,
    PostConstruct,
    AgPromise,
    TabbedItem,
    TabbedLayout,
    FocusService,
    IAfterGuiAttachedParams,
    ContainerType,
    CtrlsService,
    AgMenuList,
    AgMenuItemComponent,
    MenuItemSelectedEvent,
    HeaderNavigationService

} from '@ag-grid-community/core';

import { MenuItemMapper } from './menuItemMapper';
import { PrimaryColsPanel } from '@ag-grid-enterprise/column-tool-panel';

export interface TabSelectedEvent extends AgEvent {
    key: string;
}

@Bean('menuFactory')
export class EnterpriseMenuFactory extends BeanStub implements IMenuFactory {

    @Autowired('popupService') private readonly popupService: PopupService;
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('headerNavigationService') private readonly headerNavigationService: HeaderNavigationService;
    @Autowired('ctrlsService') private readonly ctrlsService: CtrlsService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    private lastSelectedTab: string;
    private activeMenu: EnterpriseMenu | null;

    public hideActiveMenu(): void {
        this.destroyBean(this.activeMenu);
    }

    public showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent, defaultTab?: string): void {
        this.showMenu(column, (menu: EnterpriseMenu) => {
            const ePopup = menu.getGui();

            this.popupService.positionPopupUnderMouseEvent({
                type: 'columnMenu',
                column,
                mouseEvent,
                ePopup
            });

            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, 'columnMenu', defaultTab, undefined, mouseEvent.target as HTMLElement);
    }

    public showMenuAfterButtonClick(column: Column, eventSource: HTMLElement, containerType: ContainerType, defaultTab?: string, restrictToTabs?: ColumnMenuTab[]): void {
        let multiplier = -1;
        let alignSide: 'left' | 'right' = 'left';

        if (this.gridOptionsWrapper.isEnableRtl()) {
            multiplier = 1;
            alignSide = 'right';
        }

        this.showMenu(column, (menu: EnterpriseMenu) => {
            const ePopup = menu.getGui();

            this.popupService.positionPopupByComponent({
                type: containerType,
                column,
                eventSource,
                ePopup,
                alignSide,
                nudgeX: 9 * multiplier,
                nudgeY: -23,
                position: 'under',
                keepWithinBounds: true
            });

            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, containerType, defaultTab, restrictToTabs, eventSource);
    }

    public showMenu(
        column: Column,
        positionCallback: (menu: EnterpriseMenu) => void,
        containerType: ContainerType,
        defaultTab?: string,
        restrictToTabs?: ColumnMenuTab[],
        eventSource?: HTMLElement
    ): void {
        const menu = this.createBean(new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs));
        const eMenuGui = menu.getGui();
        const currentHeaderPosition = this.focusService.getFocusedHeader();
        const currentColumnIndex = this.columnModel.getAllDisplayedColumns().indexOf(column);

        const anchorToElement = eventSource || this.ctrlsService.getGridBodyCtrl().getGui();

        const closedFuncs: ((e?: Event) => void)[] = [];

        closedFuncs.push((e?: Event) => {
            this.destroyBean(menu);
            column.setMenuVisible(false, 'contextMenu');

            const isKeyboardEvent = e instanceof KeyboardEvent;

            if (isKeyboardEvent && eventSource) {

                if (_.isVisible(eventSource)) {
                    const focusableEl = this.focusService.findTabbableParent(eventSource);
                    if (focusableEl) {
                        if (column) {
                            this.headerNavigationService.scrollToColumn(column);
                        }
                        focusableEl.focus();
                    }
                }
                // if the focusEl is no longer in the DOM, we try to focus
                // the header that is closest to the previous header position
                else if (currentHeaderPosition && currentColumnIndex !== -1) {
                    const allColumns = this.columnModel.getAllDisplayedColumns();
                    const columnToFocus = allColumns[currentColumnIndex] || _.last(allColumns);

                    if (columnToFocus) {
                        this.focusService.focusHeaderPosition({
                            headerPosition:{
                                headerRowIndex: currentHeaderPosition.headerRowIndex,
                                column: columnToFocus
                            }
                        });
                    }
                }
            }
        });

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: (e?: Event) => { // menu closed callback
                closedFuncs.forEach(f => f(e));
            },
            afterGuiAttached: params => menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)),
            positionCallback: () => positionCallback(menu),
            anchorToElement,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });

        if (addPopupRes) {
            // if user starts showing / hiding columns, or otherwise move the underlying column
            // for this menu, we want to stop tracking the menu with the column position. otherwise
            // the menu would move as the user is using the columns tab inside the menu.
            const stopAnchoringPromise = addPopupRes.stopAnchoringPromise;

            if (stopAnchoringPromise) {
                stopAnchoringPromise.then((stopAnchoringFunc: Function) => {
                    column.addEventListener(Column.EVENT_LEFT_CHANGED, stopAnchoringFunc);
                    column.addEventListener(Column.EVENT_VISIBLE_CHANGED, stopAnchoringFunc);

                    closedFuncs.push(() => {
                        column.removeEventListener(Column.EVENT_LEFT_CHANGED, stopAnchoringFunc);
                        column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, stopAnchoringFunc);
                    });
                });
            }
        }

        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
            // reposition the menu because the method above could load
            // an element that is bigger than enterpriseMenu header.
            positionCallback(menu);
        }

        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event: any) => {
            this.lastSelectedTab = event.key;
        });

        column.setMenuVisible(true, 'contextMenu');

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
    public static TAB_FILTER: 'filterMenuTab' = 'filterMenuTab';
    public static TAB_GENERAL: 'generalMenuTab' = 'generalMenuTab';
    public static TAB_COLUMNS: 'columnsMenuTab' = 'columnsMenuTab';
    public static TABS_DEFAULT: ColumnMenuTab[] = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];
    public static MENU_ITEM_SEPARATOR = 'separator';

    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('gridApi') private readonly gridApi: GridApi;
    @Autowired('columnApi') private readonly columnApi: ColumnApi;
    @Autowired('menuItemMapper') private readonly menuItemMapper: MenuItemMapper;
    @Autowired('rowModel') private readonly rowModel: IRowModel;
    @Autowired('focusService') private readonly focusService: FocusService;

    private tabbedLayout: TabbedLayout;
    private hidePopupFunc: Function;
    private column: Column;
    private mainMenuList: AgMenuList;

    private columnSelectPanel: IPrimaryColsPanel;

    private tabItemFilter: TabbedItem;
    private tabItemGeneral: TabbedItem;
    private tabItemColumns: TabbedItem;

    private initialSelection: string;
    private tabFactories: { [p: string]: () => TabbedItem; } = {};
    private includeChecks: { [p: string]: () => boolean; } = {};
    private restrictTo?: ColumnMenuTab[];

    constructor(column: Column, initialSelection: string, restrictTo?: ColumnMenuTab[]) {
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

    @PostConstruct
    public init(): void {
        const tabs = this.getTabsToCreate().map(name => this.createTab(name));

        this.tabbedLayout = new TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });

        this.createBean(this.tabbedLayout);

        if (this.mainMenuList) {
            this.mainMenuList.setParentComponent(this.tabbedLayout);
        }
    }

    private getTabsToCreate() {
        if (this.restrictTo) { return this.restrictTo; }

        return this.column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT)
            .filter(tabName => this.isValidMenuTabItem(tabName))
            .filter(tabName => this.isNotSuppressed(tabName))
            .filter(tabName => this.isModuleLoaded(tabName));
    }

    private isModuleLoaded(menuTabName: string): boolean {
        if (menuTabName === EnterpriseMenu.TAB_COLUMNS) {
            return ModuleRegistry.isRegistered(ModuleNames.ColumnToolPanelModule);
        }

        return true;
    }

    private isValidMenuTabItem(menuTabName: ColumnMenuTab): boolean {
        let isValid: boolean = true;
        let itemsToConsider = EnterpriseMenu.TABS_DEFAULT;

        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }

        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;

        if (!isValid) { console.warn(`AG Grid: Trying to render an invalid menu item '${menuTabName}'. Check that your 'menuTabs' contains one of [${itemsToConsider}]`); }

        return isValid;
    }

    private isNotSuppressed(menuTabName: string): boolean {
        return this.includeChecks[menuTabName]();
    }

    private createTab(name: string): TabbedItem {
        return this.tabFactories[name]();
    }

    public showTabBasedOnPreviousSelection(): void {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    }

    public showTab(toShow: string) {
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

        if (key) { this.activateTab(key); }
    }

    private activateTab(tab: string): void {
        const ev: TabSelectedEvent = {
            type: EnterpriseMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    }

    private getMenuItems(): (string | MenuItemDef)[] {
        const defaultMenuOptions = this.getDefaultMenuOptions();
        let result: (string | MenuItemDef)[];

        const userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();

        if (userFunc) {
            result = userFunc({
                column: this.column,
                defaultItems: defaultMenuOptions
            });
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

        const rowGroupCount = this.columnModel.getRowGroupColumns().length;
        const doingGrouping = rowGroupCount > 0;

        const groupedByThisColumn = this.columnModel.getRowGroupColumns().indexOf(this.column) >= 0;
        const allowValue = this.column.isAllowValue();
        const allowRowGroup = this.column.isAllowRowGroup();
        const isPrimary = this.column.isPrimary();
        const pivotModeOn = this.columnModel.isPivotMode();

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
        const allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));

        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }

        return result;
    }

    private createMainPanel(): TabbedItem {
        this.mainMenuList = this.createManagedBean(new AgMenuList());

        const menuItems = this.getMenuItems();
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);

        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, this.onHidePopup.bind(this));

        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsService, this.column)!,
            titleLabel: EnterpriseMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };

        return this.tabItemGeneral;
    }

    private onHidePopup(event?: MenuItemSelectedEvent): void {
        let keyboardEvent: KeyboardEvent | undefined;

        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }

        this.hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });

        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        const focusedCell = this.focusService.getFocusedCell();
        const eDocument = this.gridOptionsWrapper.getDocument();

        if (eDocument.activeElement === eDocument.body && focusedCell) {
            const { rowIndex, rowPinned, column } = focusedCell;
            this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
        }
    }

    private createFilterPanel(): TabbedItem {
        const filterWrapper: FilterWrapper | null = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');
        if (!filterWrapper) {
            throw new Error('AG Grid - Unable to instantiate filter');
        }

        const afterFilterAttachedCallback = (params: IAfterGuiAttachedParams) => {
            if (!filterWrapper?.filterPromise) { return; }

            // slightly odd block this - this promise will always have been resolved by the time it gets here, so won't be
            // async (_unless_ in react or similar, but if so why not encountered before now?).
            // I'd suggest a future improvement would be to remove/replace this promise as this block just wont work if it is
            // async and is confusing if you don't have this context
            filterWrapper.filterPromise.then(filter => {
                if (filter && filter.afterGuiAttached) {
                    filter.afterGuiAttached(params);
                }
            });
        };

        this.tabItemFilter = {
            title: _.createIconNoSpan('filter', this.gridOptionsService, this.column)!,
            titleLabel: EnterpriseMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper?.guiPromise as AgPromise<HTMLElement>,
            afterAttachedCallback: afterFilterAttachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };

        return this.tabItemFilter;
    }

    private createColumnsPanel(): TabbedItem {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');

        this.columnSelectPanel = this.createManagedBean(new PrimaryColsPanel());

        let columnsMenuParams = this.column.getColDef().columnsMenuParams;
        if (!columnsMenuParams) { columnsMenuParams = {}; }

        this.columnSelectPanel.init(false, {
            suppressColumnMove: false,
            suppressValues: false,
            suppressPivots: false,
            suppressRowGroups: false,
            suppressPivotMode: false,
            contractColumnSelection: !!columnsMenuParams.contractColumnSelection,
            suppressColumnExpandAll: !!columnsMenuParams.suppressColumnExpandAll,
            suppressColumnFilter: !!columnsMenuParams.suppressColumnFilter,
            suppressColumnSelectAll: !!columnsMenuParams.suppressColumnSelectAll,
            suppressSyncLayoutWithGrid: !!columnsMenuParams.suppressSyncLayoutWithGrid,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context')
        }, 'columnMenu');

        const columnSelectPanelGui = this.columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);

        this.tabItemColumns = {
            title: _.createIconNoSpan('columns', this.gridOptionsService, this.column)!, //createColumnsIcon(),
            titleLabel: EnterpriseMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };

        return this.tabItemColumns;
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        const { container, hidePopup } = params;

        this.tabbedLayout.setAfterAttachedParams({ container, hidePopup });

        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
    }

    public getGui(): HTMLElement {
        return this.tabbedLayout.getGui();
    }
}
