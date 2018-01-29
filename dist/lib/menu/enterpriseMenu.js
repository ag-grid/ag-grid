// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_1 = require("ag-grid");
var columnSelectComp_1 = require("../toolPanel/columnsSelect/columnSelectComp");
var menuList_1 = require("./menuList");
var menuItemComponent_1 = require("./menuItemComponent");
var menuItemMapper_1 = require("./menuItemMapper");
var EnterpriseMenuFactory = (function () {
    function EnterpriseMenuFactory() {
    }
    EnterpriseMenuFactory.prototype.hideActiveMenu = function () {
        if (this.activeMenu) {
            this.activeMenu.destroy();
        }
    };
    EnterpriseMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent, defaultTab) {
        var _this = this;
        this.showMenu(column, function (menu) {
            _this.popupService.positionPopupUnderMouseEvent({
                column: column,
                type: 'columnMenu',
                mouseEvent: mouseEvent,
                ePopup: menu.getGui()
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, defaultTab);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource, defaultTab, restrictToTabs) {
        var _this = this;
        this.showMenu(column, function (menu) {
            _this.popupService.positionPopupUnderComponent({
                column: column,
                type: 'columnMenu',
                eventSource: eventSource,
                ePopup: menu.getGui(),
                nudgeX: -9,
                nudgeY: -26,
                minWidth: menu.getMinWidth(),
                keepWithinBounds: true
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, defaultTab, restrictToTabs);
    };
    EnterpriseMenuFactory.prototype.showMenu = function (column, positionCallback, defaultTab, restrictToTabs) {
        var _this = this;
        var menu = new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs);
        this.context.wireBean(menu);
        var eMenuGui = menu.getGui();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenuGui, true, function () {
            menu.destroy();
            column.setMenuVisible(false, "contextMenu");
        });
        positionCallback(menu);
        menu.afterGuiAttached({
            hidePopup: hidePopup
        });
        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
        }
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, function (event) {
            _this.lastSelectedTab = event.key;
        });
        column.setMenuVisible(true, "contextMenu");
        this.activeMenu = menu;
        menu.addEventListener(ag_grid_1.BeanStub.EVENT_DESTORYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    };
    __decorate([
        ag_grid_1.Autowired('context'),
        __metadata("design:type", ag_grid_1.Context)
    ], EnterpriseMenuFactory.prototype, "context", void 0);
    __decorate([
        ag_grid_1.Autowired('popupService'),
        __metadata("design:type", ag_grid_1.PopupService)
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_1.GridOptionsWrapper)
    ], EnterpriseMenuFactory.prototype, "gridOptionsWrapper", void 0);
    EnterpriseMenuFactory = __decorate([
        ag_grid_1.Bean('menuFactory')
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
}());
exports.EnterpriseMenuFactory = EnterpriseMenuFactory;
var EnterpriseMenu = (function (_super) {
    __extends(EnterpriseMenu, _super);
    function EnterpriseMenu(column, initialSelection, restrictTo) {
        var _this = _super.call(this) || this;
        _this.tabFactories = {};
        _this.includeChecks = {};
        _this.column = column;
        _this.initialSelection = initialSelection;
        _this.tabFactories[EnterpriseMenu.TAB_GENERAL] = _this.createMainPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_FILTER] = _this.createFilterPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = _this.createColumnsPanel.bind(_this);
        _this.includeChecks[EnterpriseMenu.TAB_GENERAL] = function () { return true; };
        _this.includeChecks[EnterpriseMenu.TAB_FILTER] = function () {
            var isFilterEnabled = _this.gridOptionsWrapper.isEnableFilter();
            var isFloatingFiltersEnabled = _this.gridOptionsWrapper.isFloatingFilter();
            var isAnyFilteringEnabled = isFilterEnabled || isFloatingFiltersEnabled;
            var suppressFilterForThisColumn = _this.column.getColDef().suppressFilter;
            return isAnyFilteringEnabled && !suppressFilterForThisColumn;
        };
        _this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = function () { return true; };
        _this.restrictTo = restrictTo;
        return _this;
    }
    EnterpriseMenu.prototype.getMinWidth = function () {
        return this.tabbedLayout.getMinWidth();
    };
    EnterpriseMenu.prototype.init = function () {
        var _this = this;
        var items = this.column.getMenuTabs(this.restrictTo ? this.restrictTo : EnterpriseMenu.TABS_DEFAULT)
            .filter(function (menuTabName) {
            return _this.isValidMenuTabItem(menuTabName);
        })
            .filter(function (menuTabName) {
            return _this.isNotSuppressed(menuTabName);
        })
            .map(function (menuTabName) {
            return _this.createTab(menuTabName);
        });
        this.tabbedLayout = new ag_grid_1.TabbedLayout({
            items: items,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
    };
    EnterpriseMenu.prototype.isValidMenuTabItem = function (menuTabName) {
        var isValid = true;
        var itemsToConsider = EnterpriseMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
        if (!isValid)
            console.warn("Trying to render an invalid menu item '" + menuTabName + "'. Check that your 'menuTabs' contains one of [" + itemsToConsider + "]");
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
        var key;
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
            var event_1 = {
                type: EnterpriseMenu.EVENT_TAB_SELECTED,
                key: key
            };
            this.dispatchEvent(event_1);
        }
    };
    EnterpriseMenu.prototype.destroy = function () {
        if (this.columnSelectPanel) {
            this.columnSelectPanel.destroy();
        }
        if (this.mainMenuList) {
            this.mainMenuList.destroy();
        }
        _super.prototype.destroy.call(this);
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
        ag_grid_1.Utils.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);
        return result;
    };
    EnterpriseMenu.prototype.getDefaultMenuOptions = function () {
        var result = [];
        var allowPinning = !this.column.isLockPinned();
        var rowGroupCount = this.columnController.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        var allowValue = this.column.isAllowValue();
        var allowRowGroup = this.column.isAllowRowGroup();
        var isPrimary = this.column.isPrimary();
        var pivotModeOn = this.columnController.isPivotMode();
        var isInMemoryRowModel = this.rowModel.getType() === ag_grid_1.Constants.ROW_MODEL_TYPE_IN_MEMORY;
        var allowValueAgg = 
        // if primary, then only allow aggValue if grouping and it's a value columns
        (isPrimary && doingGrouping && allowValue)
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
        result.push('toolPanel');
        // only add grouping expand/collapse if grouping in the InMemoryRowModel
        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        var allowExpandAndContract = isInMemoryRowModel && (pivotModeOn ? rowGroupCount > 1 : rowGroupCount > 0);
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    EnterpriseMenu.prototype.createMainPanel = function () {
        this.mainMenuList = new menuList_1.MenuList();
        this.context.wireBean(this.mainMenuList);
        var menuItems = this.getMenuItems();
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);
        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(menuItemComponent_1.MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: ag_grid_1.Utils.createIconNoSpan('menu', this.gridOptionsWrapper, this.column),
            bodyPromise: ag_grid_1.Promise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    };
    EnterpriseMenu.prototype.onHidePopup = function () {
        this.hidePopupFunc();
    };
    EnterpriseMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column);
        var afterFilterAttachedCallback;
        filterWrapper.filterPromise.then(function (filter) {
            if (filter.afterGuiAttached) {
                afterFilterAttachedCallback = filter.afterGuiAttached.bind(filter);
            }
        });
        this.tabItemFilter = {
            title: ag_grid_1.Utils.createIconNoSpan('filter', this.gridOptionsWrapper, this.column),
            bodyPromise: filterWrapper.guiPromise.promise,
            afterAttachedCallback: afterFilterAttachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    };
    EnterpriseMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        ag_grid_1.Utils.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');
        this.columnSelectPanel = new columnSelectComp_1.ColumnSelectComp(false);
        this.context.wireBean(this.columnSelectPanel);
        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());
        this.tabItemColumns = {
            title: ag_grid_1.Utils.createIconNoSpan('columns', this.gridOptionsWrapper, this.column),
            bodyPromise: ag_grid_1.Promise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    };
    EnterpriseMenu.prototype.afterGuiAttached = function (params) {
        this.tabbedLayout.setAfterAttachedParams({ hidePopup: params.hidePopup });
        this.hidePopupFunc = params.hidePopup;
        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        var onBodyScroll = function (event) {
            // if h scroll, popup is no longer over the column
            if (event.direction === 'horizontal') {
                params.hidePopup();
            }
        };
        this.addDestroyFunc(params.hidePopup);
        this.addDestroyableEventListener(this.eventService, 'bodyScroll', onBodyScroll);
    };
    EnterpriseMenu.prototype.getGui = function () {
        return this.tabbedLayout.getGui();
    };
    EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
    EnterpriseMenu.TAB_FILTER = 'filterMenuTab';
    EnterpriseMenu.TAB_GENERAL = 'generalMenuTab';
    EnterpriseMenu.TAB_COLUMNS = 'columnsMenuTab';
    EnterpriseMenu.TABS_DEFAULT = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];
    EnterpriseMenu.MENU_ITEM_SEPARATOR = 'separator';
    __decorate([
        ag_grid_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_1.ColumnController)
    ], EnterpriseMenu.prototype, "columnController", void 0);
    __decorate([
        ag_grid_1.Autowired('filterManager'),
        __metadata("design:type", ag_grid_1.FilterManager)
    ], EnterpriseMenu.prototype, "filterManager", void 0);
    __decorate([
        ag_grid_1.Autowired('context'),
        __metadata("design:type", ag_grid_1.Context)
    ], EnterpriseMenu.prototype, "context", void 0);
    __decorate([
        ag_grid_1.Autowired('gridApi'),
        __metadata("design:type", ag_grid_1.GridApi)
    ], EnterpriseMenu.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_1.GridOptionsWrapper)
    ], EnterpriseMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_1.EventService)
    ], EnterpriseMenu.prototype, "eventService", void 0);
    __decorate([
        ag_grid_1.Autowired('menuItemMapper'),
        __metadata("design:type", menuItemMapper_1.MenuItemMapper)
    ], EnterpriseMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        ag_grid_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], EnterpriseMenu.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], EnterpriseMenu.prototype, "init", null);
    return EnterpriseMenu;
}(ag_grid_1.BeanStub));
exports.EnterpriseMenu = EnterpriseMenu;
