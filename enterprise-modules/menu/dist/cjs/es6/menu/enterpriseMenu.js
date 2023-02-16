"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseMenu = exports.EnterpriseMenuFactory = void 0;
const core_1 = require("@ag-grid-community/core");
const column_tool_panel_1 = require("@ag-grid-enterprise/column-tool-panel");
let EnterpriseMenuFactory = class EnterpriseMenuFactory extends core_1.BeanStub {
    hideActiveMenu() {
        this.destroyBean(this.activeMenu);
    }
    showMenuAfterMouseEvent(column, mouseEvent, defaultTab) {
        this.showMenu(column, (menu) => {
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
        }, 'columnMenu', defaultTab, undefined, mouseEvent.target);
    }
    showMenuAfterButtonClick(column, eventSource, containerType, defaultTab, restrictToTabs) {
        let multiplier = -1;
        let alignSide = 'left';
        if (this.gridOptionsService.is('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        this.showMenu(column, (menu) => {
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
    showMenu(column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
        const { menu, eMenuGui, currentHeaderPosition, currentColumnIndex, anchorToElement } = this.getMenuParams(column, restrictToTabs, eventSource);
        const closedFuncs = [];
        closedFuncs.push(this.getClosedCallback(column, menu, currentHeaderPosition, currentColumnIndex, eventSource));
        const translate = this.localeService.getLocaleTextFunc();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: (e) => {
                closedFuncs.forEach(f => f(e));
            },
            afterGuiAttached: params => menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)),
            // if defaultTab is not present, positionCallback will be called
            // after `showTabBasedOnPreviousSelection` is called.
            positionCallback: !!defaultTab ? () => positionCallback(menu) : undefined,
            anchorToElement,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        // if user starts showing / hiding columns, or otherwise move the underlying column
        // for this menu, we want to stop tracking the menu with the column position. otherwise
        // the menu would move as the user is using the columns tab inside the menu.
        this.addStopAnchoring(addPopupRes === null || addPopupRes === void 0 ? void 0 : addPopupRes.stopAnchoringPromise, column, closedFuncs);
        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
            // reposition the menu because the method above could load
            // an element that is bigger than enterpriseMenu header.
            positionCallback(menu);
        }
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, (event) => {
            this.lastSelectedTab = event.key;
        });
        column.setMenuVisible(true, 'contextMenu');
        this.activeMenu = menu;
        menu.addEventListener(core_1.BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });
    }
    getClosedCallback(column, menu, headerPosition, columnIndex, eventSource) {
        return (e) => {
            this.destroyBean(menu);
            column.setMenuVisible(false, 'contextMenu');
            const isKeyboardEvent = e instanceof KeyboardEvent;
            if (!isKeyboardEvent || !eventSource) {
                return;
            }
            if (core_1._.isVisible(eventSource)) {
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
            else if (headerPosition && columnIndex !== -1) {
                const allColumns = this.columnModel.getAllDisplayedColumns();
                const columnToFocus = allColumns[columnIndex] || core_1._.last(allColumns);
                if (columnToFocus) {
                    this.focusService.focusHeaderPosition({
                        headerPosition: {
                            headerRowIndex: headerPosition.headerRowIndex,
                            column: columnToFocus
                        }
                    });
                }
            }
        };
    }
    addStopAnchoring(stopAnchoringPromise, column, closedFuncsArr) {
        if (!stopAnchoringPromise) {
            return;
        }
        stopAnchoringPromise.then((stopAnchoringFunc) => {
            column.addEventListener('leftChanged', stopAnchoringFunc);
            column.addEventListener('visibleChanged', stopAnchoringFunc);
            closedFuncsArr.push(() => {
                column.removeEventListener('leftChanged', stopAnchoringFunc);
                column.removeEventListener('visibleChanged', stopAnchoringFunc);
            });
        });
    }
    getMenuParams(column, restrictToTabs, eventSource) {
        const menu = this.createBean(new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs));
        return {
            menu,
            eMenuGui: menu.getGui(),
            currentHeaderPosition: this.focusService.getFocusedHeader(),
            currentColumnIndex: this.columnModel.getAllDisplayedColumns().indexOf(column),
            anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui()
        };
    }
    isMenuEnabled(column) {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    }
};
__decorate([
    core_1.Autowired('popupService')
], EnterpriseMenuFactory.prototype, "popupService", void 0);
__decorate([
    core_1.Autowired('focusService')
], EnterpriseMenuFactory.prototype, "focusService", void 0);
__decorate([
    core_1.Autowired('headerNavigationService')
], EnterpriseMenuFactory.prototype, "headerNavigationService", void 0);
__decorate([
    core_1.Autowired('ctrlsService')
], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
__decorate([
    core_1.Autowired('columnModel')
], EnterpriseMenuFactory.prototype, "columnModel", void 0);
EnterpriseMenuFactory = __decorate([
    core_1.Bean('menuFactory')
], EnterpriseMenuFactory);
exports.EnterpriseMenuFactory = EnterpriseMenuFactory;
class EnterpriseMenu extends core_1.BeanStub {
    constructor(column, initialSelection, restrictTo) {
        super();
        this.tabFactories = {};
        this.includeChecks = {};
        this.column = column;
        this.initialSelection = initialSelection;
        this.tabFactories[EnterpriseMenu.TAB_GENERAL] = this.createMainPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_FILTER] = this.createFilterPanel.bind(this);
        this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = this.createColumnsPanel.bind(this);
        this.includeChecks[EnterpriseMenu.TAB_GENERAL] = () => true;
        this.includeChecks[EnterpriseMenu.TAB_FILTER] = () => this.filterManager.isFilterAllowed(column);
        this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = () => true;
        this.restrictTo = restrictTo;
    }
    init() {
        const tabs = this.getTabsToCreate().map(name => this.createTab(name));
        this.tabbedLayout = new core_1.TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
        this.createBean(this.tabbedLayout);
        if (this.mainMenuList) {
            this.mainMenuList.setParentComponent(this.tabbedLayout);
        }
        this.addDestroyFunc(() => this.destroyBean(this.tabbedLayout));
    }
    getTabsToCreate() {
        if (this.restrictTo) {
            return this.restrictTo;
        }
        return this.column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT)
            .filter(tabName => this.isValidMenuTabItem(tabName))
            .filter(tabName => this.isNotSuppressed(tabName))
            .filter(tabName => this.isModuleLoaded(tabName));
    }
    isModuleLoaded(menuTabName) {
        if (menuTabName === EnterpriseMenu.TAB_COLUMNS) {
            return core_1.ModuleRegistry.isRegistered(core_1.ModuleNames.ColumnToolPanelModule);
        }
        return true;
    }
    isValidMenuTabItem(menuTabName) {
        let isValid = true;
        let itemsToConsider = EnterpriseMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
        if (!isValid) {
            console.warn(`AG Grid: Trying to render an invalid menu item '${menuTabName}'. Check that your 'menuTabs' contains one of [${itemsToConsider}]`);
        }
        return isValid;
    }
    isNotSuppressed(menuTabName) {
        return this.includeChecks[menuTabName]();
    }
    createTab(name) {
        return this.tabFactories[name]();
    }
    showTabBasedOnPreviousSelection() {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    }
    showTab(toShow) {
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
    onTabItemClicked(event) {
        let key = null;
        switch (event.item) {
            case this.tabItemColumns:
                key = EnterpriseMenu.TAB_COLUMNS;
                break;
            case this.tabItemFilter:
                key = EnterpriseMenu.TAB_FILTER;
                break;
            case this.tabItemGeneral:
                key = EnterpriseMenu.TAB_GENERAL;
                break;
        }
        if (key) {
            this.activateTab(key);
        }
    }
    activateTab(tab) {
        const ev = {
            type: EnterpriseMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    }
    getMenuItems() {
        const defaultMenuOptions = this.getDefaultMenuOptions();
        let result;
        const userFunc = this.gridOptionsService.getCallback('getMainMenuItems');
        if (userFunc) {
            result = userFunc({
                column: this.column,
                defaultItems: defaultMenuOptions
            });
        }
        else {
            result = defaultMenuOptions;
        }
        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        core_1._.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);
        return result;
    }
    getDefaultMenuOptions() {
        const result = [];
        const allowPinning = !this.column.getColDef().lockPinned;
        const rowGroupCount = this.columnModel.getRowGroupColumns().length;
        const doingGrouping = rowGroupCount > 0;
        const groupedByThisColumn = this.columnModel.getRowGroupColumns().indexOf(this.column) >= 0;
        const allowValue = this.column.isAllowValue();
        const allowRowGroup = this.column.isAllowRowGroup();
        const isPrimary = this.column.isPrimary();
        const pivotModeOn = this.columnModel.isPivotMode();
        const isInMemoryRowModel = this.rowModel.getType() === 'clientSide';
        const usingTreeData = this.gridOptionsService.isTreeData();
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
            }
            else {
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
    createMainPanel() {
        this.mainMenuList = this.createManagedBean(new core_1.AgMenuList());
        const menuItems = this.getMenuItems();
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);
        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(core_1.AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: core_1._.createIconNoSpan('menu', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: core_1.AgPromise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    }
    onHidePopup(event) {
        let keyboardEvent;
        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }
        this.hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });
        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        const focusedCell = this.focusService.getFocusedCell();
        const eDocument = this.gridOptionsService.getDocument();
        if (eDocument.activeElement === eDocument.body && focusedCell) {
            const { rowIndex, rowPinned, column } = focusedCell;
            this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
        }
    }
    createFilterPanel() {
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');
        if (!filterWrapper) {
            throw new Error('AG Grid - Unable to instantiate filter');
        }
        const afterFilterAttachedCallback = (params) => {
            if (!(filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise)) {
                return;
            }
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
        // see comment above
        const afterDetachedCallback = () => { var _a; return (_a = filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(filter => { var _a; return (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter); }); };
        this.tabItemFilter = {
            title: core_1._.createIconNoSpan('filter', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            afterDetachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    }
    createColumnsPanel() {
        const eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');
        const columnSelectPanel = this.createManagedBean(new column_tool_panel_1.PrimaryColsPanel());
        let columnsMenuParams = this.column.getColDef().columnsMenuParams;
        if (!columnsMenuParams) {
            columnsMenuParams = {};
        }
        const { contractColumnSelection, suppressColumnExpandAll, suppressColumnFilter, suppressColumnSelectAll, suppressSyncLayoutWithGrid, columnLayout } = columnsMenuParams;
        columnSelectPanel.init(false, {
            suppressColumnMove: false,
            suppressValues: false,
            suppressPivots: false,
            suppressRowGroups: false,
            suppressPivotMode: false,
            contractColumnSelection: !!contractColumnSelection,
            suppressColumnExpandAll: !!suppressColumnExpandAll,
            suppressColumnFilter: !!suppressColumnFilter,
            suppressColumnSelectAll: !!suppressColumnSelectAll,
            suppressSyncLayoutWithGrid: !!columnLayout || !!suppressSyncLayoutWithGrid,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        }, 'columnMenu');
        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }
        const columnSelectPanelGui = columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);
        this.tabItemColumns = {
            title: core_1._.createIconNoSpan('columns', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: core_1.AgPromise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    }
    afterGuiAttached(params) {
        const { container, hidePopup } = params;
        this.tabbedLayout.setAfterAttachedParams({ container, hidePopup });
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
    }
    getGui() {
        return this.tabbedLayout.getGui();
    }
}
EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
EnterpriseMenu.TAB_FILTER = 'filterMenuTab';
EnterpriseMenu.TAB_GENERAL = 'generalMenuTab';
EnterpriseMenu.TAB_COLUMNS = 'columnsMenuTab';
EnterpriseMenu.TABS_DEFAULT = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];
EnterpriseMenu.MENU_ITEM_SEPARATOR = 'separator';
__decorate([
    core_1.Autowired('columnModel')
], EnterpriseMenu.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('filterManager')
], EnterpriseMenu.prototype, "filterManager", void 0);
__decorate([
    core_1.Autowired('gridApi')
], EnterpriseMenu.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired('columnApi')
], EnterpriseMenu.prototype, "columnApi", void 0);
__decorate([
    core_1.Autowired('menuItemMapper')
], EnterpriseMenu.prototype, "menuItemMapper", void 0);
__decorate([
    core_1.Autowired('rowModel')
], EnterpriseMenu.prototype, "rowModel", void 0);
__decorate([
    core_1.Autowired('focusService')
], EnterpriseMenu.prototype, "focusService", void 0);
__decorate([
    core_1.PostConstruct
], EnterpriseMenu.prototype, "init", null);
exports.EnterpriseMenu = EnterpriseMenu;
