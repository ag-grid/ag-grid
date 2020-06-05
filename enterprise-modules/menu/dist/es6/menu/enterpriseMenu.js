var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, Constants, Events, ModuleNames, ModuleRegistry, PostConstruct, Promise, TabbedLayout } from "@ag-grid-community/core";
import { MenuList } from "./menuList";
import { MenuItemComponent } from "./menuItemComponent";
import { PrimaryColsPanel } from "@ag-grid-enterprise/column-tool-panel";
var EnterpriseMenuFactory = /** @class */ (function (_super) {
    __extends(EnterpriseMenuFactory, _super);
    function EnterpriseMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnterpriseMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent, defaultTab) {
        var _this = this;
        this.showMenu(column, function (menu) {
            var ePopup = menu.getGui();
            _this.popupService.positionPopupUnderMouseEvent({
                type: 'columnMenu',
                column: column,
                mouseEvent: mouseEvent,
                ePopup: ePopup
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, defaultTab, undefined, mouseEvent.target);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource, defaultTab, restrictToTabs) {
        var _this = this;
        var multiplier = -1;
        var alignSide = 'left';
        if (this.gridOptionsWrapper.isEnableRtl()) {
            multiplier = 1;
            alignSide = 'right';
        }
        this.showMenu(column, function (menu) {
            var minDims = menu.getMinDimensions();
            var minWidth = minDims.width, minHeight = minDims.height;
            var ePopup = menu.getGui();
            _this.popupService.positionPopupUnderComponent({
                type: 'columnMenu',
                column: column,
                eventSource: eventSource,
                ePopup: ePopup,
                minWidth: minWidth,
                minHeight: minHeight,
                alignSide: alignSide,
                nudgeX: 9 * multiplier,
                nudgeY: -23,
                keepWithinBounds: true
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, defaultTab, restrictToTabs, eventSource);
    };
    EnterpriseMenuFactory.prototype.showMenu = function (column, positionCallback, defaultTab, restrictToTabs, eventSource) {
        var _this = this;
        var menu = new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs);
        this.createBean(menu);
        var eMenuGui = menu.getGui();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenuGui, true, function (e) {
            _this.destroyBean(menu);
            column.setMenuVisible(false, "contextMenu");
            var isKeyboardEvent = e instanceof KeyboardEvent;
            if (isKeyboardEvent && eventSource && _.isVisible(eventSource)) {
                var focusableEl = _this.focusController.findTabbableParent(eventSource);
                if (focusableEl) {
                    focusableEl.focus();
                }
            }
        });
        menu.afterGuiAttached({
            hidePopup: hidePopup
        });
        positionCallback(menu);
        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
        }
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, function (event) {
            _this.lastSelectedTab = event.key;
        });
        column.setMenuVisible(true, "contextMenu");
        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    };
    __decorate([
        Autowired('popupService')
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], EnterpriseMenuFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('focusController')
    ], EnterpriseMenuFactory.prototype, "focusController", void 0);
    EnterpriseMenuFactory = __decorate([
        Bean('menuFactory')
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
}(BeanStub));
export { EnterpriseMenuFactory };
var EnterpriseMenu = /** @class */ (function (_super) {
    __extends(EnterpriseMenu, _super);
    function EnterpriseMenu(column, initialSelection, restrictTo) {
        var _this = _super.call(this) || this;
        _this.tabFactories = {};
        _this.includeChecks = {};
        _this.timeOfLastColumnChange = Date.now();
        _this.column = column;
        _this.initialSelection = initialSelection;
        _this.tabFactories[EnterpriseMenu.TAB_GENERAL] = _this.createMainPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_FILTER] = _this.createFilterPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = _this.createColumnsPanel.bind(_this);
        _this.includeChecks[EnterpriseMenu.TAB_GENERAL] = function () { return true; };
        _this.includeChecks[EnterpriseMenu.TAB_FILTER] = function () { return column.isFilterAllowed(); };
        _this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = function () { return true; };
        _this.restrictTo = restrictTo;
        return _this;
    }
    EnterpriseMenu.prototype.getMinDimensions = function () {
        return this.tabbedLayout.getMinDimensions();
    };
    EnterpriseMenu.prototype.init = function () {
        var _this = this;
        var tabs = this.getTabsToCreate()
            .map(function (menuTabName) { return _this.createTab(menuTabName); });
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
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
    };
    EnterpriseMenu.prototype.getTabsToCreate = function () {
        var _this = this;
        if (this.restrictTo) {
            return this.restrictTo;
        }
        return this.column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT)
            .filter(function (tabName) { return _this.isValidMenuTabItem(tabName); })
            .filter(function (tabName) { return _this.isNotSuppressed(tabName); })
            .filter(function (tabName) { return _this.isModuleLoaded(tabName); });
    };
    EnterpriseMenu.prototype.isModuleLoaded = function (menuTabName) {
        if (menuTabName === EnterpriseMenu.TAB_COLUMNS) {
            return ModuleRegistry.isRegistered(ModuleNames.ColumnToolPanelModule);
        }
        return true;
    };
    EnterpriseMenu.prototype.isValidMenuTabItem = function (menuTabName) {
        var isValid = true;
        var itemsToConsider = EnterpriseMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
        if (!isValid) {
            console.warn("Trying to render an invalid menu item '" + menuTabName + "'. Check that your 'menuTabs' contains one of [" + itemsToConsider + "]");
        }
        return isValid;
    };
    EnterpriseMenu.prototype.isNotSuppressed = function (menuTabName) {
        return this.includeChecks[menuTabName]();
    };
    EnterpriseMenu.prototype.createTab = function (name) {
        return this.tabFactories[name]();
    };
    EnterpriseMenu.prototype.showTabBasedOnPreviousSelection = function () {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    };
    EnterpriseMenu.prototype.showTab = function (toShow) {
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
    };
    EnterpriseMenu.prototype.onTabItemClicked = function (event) {
        var key = null;
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
    };
    EnterpriseMenu.prototype.activateTab = function (tab) {
        var ev = {
            type: EnterpriseMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    };
    EnterpriseMenu.prototype.getMenuItems = function () {
        var defaultMenuOptions = this.getDefaultMenuOptions();
        var result;
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
        }
        else {
            result = defaultMenuOptions;
        }
        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        _.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);
        return result;
    };
    EnterpriseMenu.prototype.getDefaultMenuOptions = function () {
        var result = [];
        var allowPinning = !this.column.getColDef().lockPinned;
        var rowGroupCount = this.columnController.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        var allowValue = this.column.isAllowValue();
        var allowRowGroup = this.column.isAllowRowGroup();
        var isPrimary = this.column.isPrimary();
        var pivotModeOn = this.columnController.isPivotMode();
        var isInMemoryRowModel = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        var usingTreeData = this.gridOptionsWrapper.isTreeData();
        var allowValueAgg = 
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
        var allowExpandAndContract = false;
        if (isInMemoryRowModel) {
            if (usingTreeData) {
                allowExpandAndContract = true;
            }
            else {
                allowExpandAndContract = pivotModeOn ? rowGroupCount > 1 : rowGroupCount > 0;
            }
        }
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    EnterpriseMenu.prototype.createMainPanel = function () {
        this.mainMenuList = new MenuList();
        this.createManagedBean(this.mainMenuList);
        var menuItems = this.getMenuItems();
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);
        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsWrapper, this.column),
            titleLabel: EnterpriseMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: Promise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    };
    EnterpriseMenu.prototype.onHidePopup = function () {
        this.hidePopupFunc();
        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        var focusedCell = this.focusController.getFocusedCell();
        if (focusedCell) {
            var rowIndex = focusedCell.rowIndex, rowPinned = focusedCell.rowPinned, column = focusedCell.column;
            this.focusController.setFocusedCell(rowIndex, column, rowPinned, true);
        }
    };
    EnterpriseMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');
        var afterFilterAttachedCallback = null;
        // slightly odd block this - this promise will always have been resolved by the time it gets here, so won't be
        // async (_unless_ in react or similar, but if so why not encountered before now?).
        // I'd suggest a future improvement would be to remove/replace this promise as this block just wont work if it is
        // async and is confusing if you don't have this context
        if (filterWrapper.filterPromise) {
            filterWrapper.filterPromise.then(function (filter) {
                if (filter.afterGuiAttached) {
                    afterFilterAttachedCallback = filter.afterGuiAttached.bind(filter);
                }
            });
        }
        this.tabItemFilter = {
            title: _.createIconNoSpan('filter', this.gridOptionsWrapper, this.column),
            titleLabel: EnterpriseMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    };
    EnterpriseMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');
        this.columnSelectPanel = this.createManagedBean(new PrimaryColsPanel());
        this.columnSelectPanel.init(false, {
            suppressValues: false,
            suppressPivots: false,
            suppressRowGroups: false,
            suppressPivotMode: false,
            contractColumnSelection: false,
            suppressColumnExpandAll: false,
            suppressColumnFilter: false,
            suppressColumnSelectAll: false,
            suppressSideButtons: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi
        });
        _.addCssClass(this.columnSelectPanel.getGui(), 'ag-menu-column-select');
        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());
        this.tabItemColumns = {
            title: _.createIconNoSpan('columns', this.gridOptionsWrapper, this.column),
            titleLabel: EnterpriseMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: Promise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    };
    EnterpriseMenu.prototype.afterGuiAttached = function (params) {
        var _this = this;
        this.tabbedLayout.setAfterAttachedParams({ hidePopup: params.hidePopup });
        this.hidePopupFunc = params.hidePopup;
        var initialScroll = this.gridApi.getHorizontalPixelRange().left;
        // if the user scrolls the grid horizontally, we want to hide the menu, as the menu will not appear in the right location anymore
        var onBodyScroll = function (event) {
            // If the user hides columns using the columns tab in this menu, it will change the size of the
            // grid content and lead to a bodyScroll event. But we don't want to hide the menu for that kind
            // of indirect scrolling. Assume that any bodyScroll that happens right after a column change is
            // caused by that change, and ignore it.
            var msSinceLastColumnChange = Date.now() - _this.timeOfLastColumnChange;
            if (msSinceLastColumnChange < 500) {
                return;
            }
            // if h scroll, popup is no longer over the column
            if (event.direction === 'horizontal') {
                var newScroll = _this.gridApi.getHorizontalPixelRange().left;
                if (Math.abs(newScroll - initialScroll) > _this.gridOptionsWrapper.getScrollbarWidth()) {
                    params.hidePopup();
                }
            }
        };
        this.addDestroyFunc(params.hidePopup);
        this.addManagedListener(this.eventService, 'bodyScroll', onBodyScroll);
    };
    EnterpriseMenu.prototype.getGui = function () {
        return this.tabbedLayout.getGui();
    };
    EnterpriseMenu.prototype.onDisplayedColumnsChanged = function () {
        this.timeOfLastColumnChange = Date.now();
    };
    EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
    EnterpriseMenu.TAB_FILTER = 'filterMenuTab';
    EnterpriseMenu.TAB_GENERAL = 'generalMenuTab';
    EnterpriseMenu.TAB_COLUMNS = 'columnsMenuTab';
    EnterpriseMenu.TABS_DEFAULT = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];
    EnterpriseMenu.MENU_ITEM_SEPARATOR = 'separator';
    __decorate([
        Autowired('columnController')
    ], EnterpriseMenu.prototype, "columnController", void 0);
    __decorate([
        Autowired('filterManager')
    ], EnterpriseMenu.prototype, "filterManager", void 0);
    __decorate([
        Autowired('gridApi')
    ], EnterpriseMenu.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], EnterpriseMenu.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], EnterpriseMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('menuItemMapper')
    ], EnterpriseMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        Autowired('rowModel')
    ], EnterpriseMenu.prototype, "rowModel", void 0);
    __decorate([
        Autowired('focusController')
    ], EnterpriseMenu.prototype, "focusController", void 0);
    __decorate([
        PostConstruct
    ], EnterpriseMenu.prototype, "init", null);
    return EnterpriseMenu;
}(BeanStub));
export { EnterpriseMenu };
