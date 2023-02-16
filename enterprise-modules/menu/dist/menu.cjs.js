/**
          * @ag-grid-enterprise/menu - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v29.1.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');
var columnToolPanel = require('@ag-grid-enterprise/column-tool-panel');

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EnterpriseMenuFactory = /** @class */ (function (_super) {
    __extends$3(EnterpriseMenuFactory, _super);
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
        }, 'columnMenu', defaultTab, undefined, mouseEvent.target);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource, containerType, defaultTab, restrictToTabs) {
        var _this = this;
        var multiplier = -1;
        var alignSide = 'left';
        if (this.gridOptionsService.is('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        this.showMenu(column, function (menu) {
            var ePopup = menu.getGui();
            _this.popupService.positionPopupByComponent({
                type: containerType,
                column: column,
                eventSource: eventSource,
                ePopup: ePopup,
                alignSide: alignSide,
                nudgeX: 9 * multiplier,
                nudgeY: -23,
                position: 'under',
                keepWithinBounds: true
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, containerType, defaultTab, restrictToTabs, eventSource);
    };
    EnterpriseMenuFactory.prototype.showMenu = function (column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
        var _this = this;
        var _a = this.getMenuParams(column, restrictToTabs, eventSource), menu = _a.menu, eMenuGui = _a.eMenuGui, currentHeaderPosition = _a.currentHeaderPosition, currentColumnIndex = _a.currentColumnIndex, anchorToElement = _a.anchorToElement;
        var closedFuncs = [];
        closedFuncs.push(this.getClosedCallback(column, menu, currentHeaderPosition, currentColumnIndex, eventSource));
        var translate = this.localeService.getLocaleTextFunc();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: function (e) {
                closedFuncs.forEach(function (f) { return f(e); });
            },
            afterGuiAttached: function (params) { return menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)); },
            // if defaultTab is not present, positionCallback will be called
            // after `showTabBasedOnPreviousSelection` is called.
            positionCallback: !!defaultTab ? function () { return positionCallback(menu); } : undefined,
            anchorToElement: anchorToElement,
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
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, function (event) {
            _this.lastSelectedTab = event.key;
        });
        column.setMenuVisible(true, 'contextMenu');
        this.activeMenu = menu;
        menu.addEventListener(core.BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    EnterpriseMenuFactory.prototype.getClosedCallback = function (column, menu, headerPosition, columnIndex, eventSource) {
        var _this = this;
        return function (e) {
            _this.destroyBean(menu);
            column.setMenuVisible(false, 'contextMenu');
            var isKeyboardEvent = e instanceof KeyboardEvent;
            if (!isKeyboardEvent || !eventSource) {
                return;
            }
            if (core._.isVisible(eventSource)) {
                var focusableEl = _this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    if (column) {
                        _this.headerNavigationService.scrollToColumn(column);
                    }
                    focusableEl.focus();
                }
            }
            // if the focusEl is no longer in the DOM, we try to focus
            // the header that is closest to the previous header position
            else if (headerPosition && columnIndex !== -1) {
                var allColumns = _this.columnModel.getAllDisplayedColumns();
                var columnToFocus = allColumns[columnIndex] || core._.last(allColumns);
                if (columnToFocus) {
                    _this.focusService.focusHeaderPosition({
                        headerPosition: {
                            headerRowIndex: headerPosition.headerRowIndex,
                            column: columnToFocus
                        }
                    });
                }
            }
        };
    };
    EnterpriseMenuFactory.prototype.addStopAnchoring = function (stopAnchoringPromise, column, closedFuncsArr) {
        if (!stopAnchoringPromise) {
            return;
        }
        stopAnchoringPromise.then(function (stopAnchoringFunc) {
            column.addEventListener('leftChanged', stopAnchoringFunc);
            column.addEventListener('visibleChanged', stopAnchoringFunc);
            closedFuncsArr.push(function () {
                column.removeEventListener('leftChanged', stopAnchoringFunc);
                column.removeEventListener('visibleChanged', stopAnchoringFunc);
            });
        });
    };
    EnterpriseMenuFactory.prototype.getMenuParams = function (column, restrictToTabs, eventSource) {
        var menu = this.createBean(new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs));
        return {
            menu: menu,
            eMenuGui: menu.getGui(),
            currentHeaderPosition: this.focusService.getFocusedHeader(),
            currentColumnIndex: this.columnModel.getAllDisplayedColumns().indexOf(column),
            anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui()
        };
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    };
    __decorate$3([
        core.Autowired('popupService')
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate$3([
        core.Autowired('focusService')
    ], EnterpriseMenuFactory.prototype, "focusService", void 0);
    __decorate$3([
        core.Autowired('headerNavigationService')
    ], EnterpriseMenuFactory.prototype, "headerNavigationService", void 0);
    __decorate$3([
        core.Autowired('ctrlsService')
    ], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
    __decorate$3([
        core.Autowired('columnModel')
    ], EnterpriseMenuFactory.prototype, "columnModel", void 0);
    EnterpriseMenuFactory = __decorate$3([
        core.Bean('menuFactory')
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
}(core.BeanStub));
var EnterpriseMenu = /** @class */ (function (_super) {
    __extends$3(EnterpriseMenu, _super);
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
        _this.includeChecks[EnterpriseMenu.TAB_FILTER] = function () { return _this.filterManager.isFilterAllowed(column); };
        _this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = function () { return true; };
        _this.restrictTo = restrictTo;
        return _this;
    }
    EnterpriseMenu.prototype.init = function () {
        var _this = this;
        var tabs = this.getTabsToCreate().map(function (name) { return _this.createTab(name); });
        this.tabbedLayout = new core.TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
        this.createBean(this.tabbedLayout);
        if (this.mainMenuList) {
            this.mainMenuList.setParentComponent(this.tabbedLayout);
        }
        this.addDestroyFunc(function () { return _this.destroyBean(_this.tabbedLayout); });
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
            return core.ModuleRegistry.isRegistered(core.ModuleNames.ColumnToolPanelModule);
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
            console.warn("AG Grid: Trying to render an invalid menu item '" + menuTabName + "'. Check that your 'menuTabs' contains one of [" + itemsToConsider + "]");
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
        var userFunc = this.gridOptionsService.getCallback('getMainMenuItems');
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
        core._.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);
        return result;
    };
    EnterpriseMenu.prototype.getDefaultMenuOptions = function () {
        var result = [];
        var allowPinning = !this.column.getColDef().lockPinned;
        var rowGroupCount = this.columnModel.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var groupedByThisColumn = this.columnModel.getRowGroupColumns().indexOf(this.column) >= 0;
        var allowValue = this.column.isAllowValue();
        var allowRowGroup = this.column.isAllowRowGroup();
        var isPrimary = this.column.isPrimary();
        var pivotModeOn = this.columnModel.isPivotMode();
        var isInMemoryRowModel = this.rowModel.getType() === 'clientSide';
        var usingTreeData = this.gridOptionsService.isTreeData();
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
        var allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    EnterpriseMenu.prototype.createMainPanel = function () {
        this.mainMenuList = this.createManagedBean(new core.AgMenuList());
        var menuItems = this.getMenuItems();
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);
        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(core.AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: core._.createIconNoSpan('menu', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: core.AgPromise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    };
    EnterpriseMenu.prototype.onHidePopup = function (event) {
        var keyboardEvent;
        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }
        this.hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });
        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        var focusedCell = this.focusService.getFocusedCell();
        var eDocument = this.gridOptionsService.getDocument();
        if (eDocument.activeElement === eDocument.body && focusedCell) {
            var rowIndex = focusedCell.rowIndex, rowPinned = focusedCell.rowPinned, column = focusedCell.column;
            this.focusService.setFocusedCell({ rowIndex: rowIndex, column: column, rowPinned: rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
        }
    };
    EnterpriseMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');
        if (!filterWrapper) {
            throw new Error('AG Grid - Unable to instantiate filter');
        }
        var afterFilterAttachedCallback = function (params) {
            if (!(filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise)) {
                return;
            }
            // slightly odd block this - this promise will always have been resolved by the time it gets here, so won't be
            // async (_unless_ in react or similar, but if so why not encountered before now?).
            // I'd suggest a future improvement would be to remove/replace this promise as this block just wont work if it is
            // async and is confusing if you don't have this context
            filterWrapper.filterPromise.then(function (filter) {
                if (filter && filter.afterGuiAttached) {
                    filter.afterGuiAttached(params);
                }
            });
        };
        // see comment above
        var afterDetachedCallback = function () { var _a; return (_a = filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.filterPromise) === null || _a === void 0 ? void 0 : _a.then(function (filter) { var _a; return (_a = filter === null || filter === void 0 ? void 0 : filter.afterGuiDetached) === null || _a === void 0 ? void 0 : _a.call(filter); }); };
        this.tabItemFilter = {
            title: core._.createIconNoSpan('filter', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            afterDetachedCallback: afterDetachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    };
    EnterpriseMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');
        var columnSelectPanel = this.createManagedBean(new columnToolPanel.PrimaryColsPanel());
        var columnsMenuParams = this.column.getColDef().columnsMenuParams;
        if (!columnsMenuParams) {
            columnsMenuParams = {};
        }
        var contractColumnSelection = columnsMenuParams.contractColumnSelection, suppressColumnExpandAll = columnsMenuParams.suppressColumnExpandAll, suppressColumnFilter = columnsMenuParams.suppressColumnFilter, suppressColumnSelectAll = columnsMenuParams.suppressColumnSelectAll, suppressSyncLayoutWithGrid = columnsMenuParams.suppressSyncLayoutWithGrid, columnLayout = columnsMenuParams.columnLayout;
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
        var columnSelectPanelGui = columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);
        this.tabItemColumns = {
            title: core._.createIconNoSpan('columns', this.gridOptionsService, this.column),
            titleLabel: EnterpriseMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: core.AgPromise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    };
    EnterpriseMenu.prototype.afterGuiAttached = function (params) {
        var container = params.container, hidePopup = params.hidePopup;
        this.tabbedLayout.setAfterAttachedParams({ container: container, hidePopup: hidePopup });
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
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
    __decorate$3([
        core.Autowired('columnModel')
    ], EnterpriseMenu.prototype, "columnModel", void 0);
    __decorate$3([
        core.Autowired('filterManager')
    ], EnterpriseMenu.prototype, "filterManager", void 0);
    __decorate$3([
        core.Autowired('gridApi')
    ], EnterpriseMenu.prototype, "gridApi", void 0);
    __decorate$3([
        core.Autowired('columnApi')
    ], EnterpriseMenu.prototype, "columnApi", void 0);
    __decorate$3([
        core.Autowired('menuItemMapper')
    ], EnterpriseMenu.prototype, "menuItemMapper", void 0);
    __decorate$3([
        core.Autowired('rowModel')
    ], EnterpriseMenu.prototype, "rowModel", void 0);
    __decorate$3([
        core.Autowired('focusService')
    ], EnterpriseMenu.prototype, "focusService", void 0);
    __decorate$3([
        core.PostConstruct
    ], EnterpriseMenu.prototype, "init", null);
    return EnterpriseMenu;
}(core.BeanStub));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$2 = (undefined && undefined.__assign) || function () {
    __assign$2 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CSS_MENU = 'ag-menu';
var CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';
var ContextMenuFactory = /** @class */ (function (_super) {
    __extends$2(ContextMenuFactory, _super);
    function ContextMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions = [];
        if (core._.exists(node) && core.ModuleRegistry.isRegistered(core.ModuleNames.ClipboardModule)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                defaultMenuOptions.push('cut', 'copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsService.is('enableCharts') && core.ModuleRegistry.isRegistered(core.ModuleNames.GridChartsModule)) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (core._.exists(node)) {
            // if user clicks a cell
            var csvModuleMissing = !core.ModuleRegistry.isRegistered(core.ModuleNames.CsvExportModule);
            var excelModuleMissing = !core.ModuleRegistry.isRegistered(core.ModuleNames.ExcelExportModule);
            var suppressExcel = this.gridOptionsService.is('suppressExcelExport') || excelModuleMissing;
            var suppressCsv = this.gridOptionsService.is('suppressCsvExport') || csvModuleMissing;
            var onIPad = core._.isIOSUserAgent();
            var anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }
        var userFunc = this.gridOptionsService.getCallback('getContextMenuItems');
        if (userFunc) {
            var params = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions.length ? defaultMenuOptions : undefined,
            };
            return userFunc(params);
        }
        return defaultMenuOptions;
    };
    ContextMenuFactory.prototype.onContextMenu = function (mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsService.is('allowContextMenuWithControlKey')) {
            // then do the check
            if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
                return;
            }
        }
        // need to do this regardless of context menu showing or not, so doing
        // before the isSuppressContextMenu() check
        if (mouseEvent) {
            this.blockMiddleClickScrollsIfNeeded(mouseEvent);
        }
        if (this.gridOptionsService.is('suppressContextMenu')) {
            return;
        }
        var eventOrTouch = mouseEvent ? mouseEvent : touchEvent.touches[0];
        if (this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement)) {
            var event_1 = mouseEvent ? mouseEvent : touchEvent;
            event_1.preventDefault();
        }
    };
    ContextMenuFactory.prototype.blockMiddleClickScrollsIfNeeded = function (mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        var gridOptionsService = this.gridOptionsService;
        var which = mouseEvent.which;
        if (gridOptionsService.is('suppressMiddleClickScrolls') && which === 2) {
            mouseEvent.preventDefault();
        }
    };
    ContextMenuFactory.prototype.showMenu = function (node, column, value, mouseEvent, anchorToElement) {
        var _this = this;
        var menuItems = this.getMenuItems(node, column, value);
        var eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
        if (menuItems === undefined || core._.missingOrEmpty(menuItems)) {
            return false;
        }
        var menu = new ContextMenu(menuItems);
        this.createBean(menu);
        var eMenuGui = menu.getGui();
        var positionParams = {
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1
        };
        var translate = this.localeService.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: function () {
                eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
                _this.destroyBean(menu);
            },
            click: mouseEvent,
            positionCallback: function () {
                var isRtl = _this.gridOptionsService.is('enableRtl');
                _this.popupService.positionPopupUnderMouseEvent(__assign$2(__assign$2({}, positionParams), { nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1 }));
            },
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelContextMenu', 'Context Menu')
        });
        if (addPopupRes) {
            eGridBodyGui.classList.add(CSS_CONTEXT_MENU_OPEN);
            menu.afterGuiAttached({ container: 'contextMenu', hidePopup: addPopupRes.hideFunc });
        }
        // there should never be an active menu at this point, however it was found
        // that you could right click a second time just 1 or 2 pixels from the first
        // click, and another menu would pop up. so somehow the logic for closing the
        // first menu (clicking outside should close it) was glitchy somehow. an easy
        // way to avoid this is just remove the old context menu here if it exists.
        if (this.activeMenu) {
            this.hideActiveMenu();
        }
        this.activeMenu = menu;
        menu.addEventListener(core.BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(core.AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, addPopupRes.hideFunc);
        }
        return true;
    };
    __decorate$2([
        core.Autowired('popupService')
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate$2([
        core.Optional('rangeService')
    ], ContextMenuFactory.prototype, "rangeService", void 0);
    __decorate$2([
        core.Autowired('ctrlsService')
    ], ContextMenuFactory.prototype, "ctrlsService", void 0);
    __decorate$2([
        core.Autowired('columnModel')
    ], ContextMenuFactory.prototype, "columnModel", void 0);
    ContextMenuFactory = __decorate$2([
        core.Bean('contextMenuFactory')
    ], ContextMenuFactory);
    return ContextMenuFactory;
}(core.BeanStub));
var ContextMenu = /** @class */ (function (_super) {
    __extends$2(ContextMenu, _super);
    function ContextMenu(menuItems) {
        var _this = _super.call(this, /* html */ "<div class=\"" + CSS_MENU + "\" role=\"presentation\"></div>") || this;
        _this.menuList = null;
        _this.focusedCell = null;
        _this.menuItems = menuItems;
        return _this;
    }
    ContextMenu.prototype.addMenuItems = function () {
        var _this = this;
        var menuList = this.createManagedBean(new core.AgMenuList());
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(core.AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, function (e) { return _this.dispatchEvent(e); });
    };
    ContextMenu.prototype.afterGuiAttached = function (params) {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }
        this.focusedCell = this.focusService.getFocusedCell();
        if (this.menuList) {
            this.focusService.focusInto(this.menuList.getGui());
        }
    };
    ContextMenu.prototype.restoreFocusedCell = function () {
        var currentFocusedCell = this.focusService.getFocusedCell();
        if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
            var _a = this.focusedCell, rowIndex = _a.rowIndex, rowPinned = _a.rowPinned, column = _a.column;
            var doc = this.gridOptionsService.getDocument();
            if (doc.activeElement === doc.body) {
                this.focusService.setFocusedCell({ rowIndex: rowIndex, column: column, rowPinned: rowPinned, forceBrowserFocus: true });
            }
        }
    };
    ContextMenu.prototype.destroy = function () {
        this.restoreFocusedCell();
        _super.prototype.destroy.call(this);
    };
    __decorate$2([
        core.Autowired('menuItemMapper')
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate$2([
        core.Autowired('focusService')
    ], ContextMenu.prototype, "focusService", void 0);
    __decorate$2([
        core.Autowired('cellPositionUtils')
    ], ContextMenu.prototype, "cellPositionUtils", void 0);
    __decorate$2([
        core.PostConstruct
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
}(core.Component));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MenuItemMapper = /** @class */ (function (_super) {
    __extends$1(MenuItemMapper, _super);
    function MenuItemMapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuItemMapper.prototype.mapWithStockItems = function (originalList, column) {
        var _this = this;
        if (!originalList) {
            return [];
        }
        var resultList = [];
        originalList.forEach(function (menuItemOrString) {
            var result;
            if (typeof menuItemOrString === 'string') {
                result = _this.getStockMenuItem(menuItemOrString, column);
            }
            else {
                // Spread to prevent leaking mapped subMenus back into the original menuItem
                result = __assign$1({}, menuItemOrString);
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                return;
            }
            var resultDef = result;
            var subMenu = resultDef.subMenu;
            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = _this.mapWithStockItems(subMenu, column);
            }
            if (result != null) {
                resultList.push(result);
            }
        });
        return resultList;
    };
    MenuItemMapper.prototype.getStockMenuItem = function (key, column) {
        var _this = this;
        var _a;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var skipHeaderOnAutoSize = this.gridOptionsService.is('skipHeaderOnAutoSize');
        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: core._.createIconNoSpan('menuPin', this.gridOptionsService, null),
                    subMenu: ['clearPinned', 'pinLeft', 'pinRight']
                };
            case 'pinLeft':
                return {
                    name: localeTextFunc('pinLeft', 'Pin Left'),
                    action: function () { return _this.columnModel.setColumnPinned(column, 'left', "contextMenu"); },
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: function () { return _this.columnModel.setColumnPinned(column, 'right', "contextMenu"); },
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: function () { return _this.columnModel.setColumnPinned(column, null, "contextMenu"); },
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (core.ModuleRegistry.assertRegistered(core.ModuleNames.RowGroupingModule, 'Aggregation from Menu')) {
                    if (!(column === null || column === void 0 ? void 0 : column.isPrimary()) && !(column === null || column === void 0 ? void 0 : column.getColDef().pivotValueColumn)) {
                        return null;
                    }
                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: core._.createIconNoSpan('menuValue', this.gridOptionsService, null),
                        subMenu: this.createAggregationSubMenu(column)
                    };
                }
                else {
                    return null;
                }
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                    action: function () { return _this.columnModel.autoSizeColumn(column, skipHeaderOnAutoSize, "contextMenu"); }
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: function () { return _this.columnModel.autoSizeAllColumns(skipHeaderOnAutoSize, "contextMenu"); }
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + core._.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: function () { return _this.columnModel.addRowGroupColumn(column, "contextMenu"); },
                    icon: core._.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + core._.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: function () { return _this.columnModel.removeRowGroupColumn(column, "contextMenu"); },
                    icon: core._.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null)
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: function () { return _this.columnModel.resetColumnState("contextMenu"); }
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All'),
                    action: function () { return _this.gridApi.expandAll(); }
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All'),
                    action: function () { return _this.gridApi.collapseAll(); }
                };
            case 'copy':
                if (core.ModuleRegistry.assertRegistered(core.ModuleNames.ClipboardModule, 'Copy from Menu')) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: core._.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.copyToClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'copyWithHeaders':
                if (core.ModuleRegistry.assertRegistered(core.ModuleNames.ClipboardModule, 'Copy with Headers from Menu')) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: core._.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.copyToClipboard({ includeHeaders: true }); }
                    };
                }
                else {
                    return null;
                }
            case 'copyWithGroupHeaders':
                if (core.ModuleRegistry.assertRegistered(core.ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu')) {
                    return {
                        name: localeTextFunc('copyWithGroupHeaders', 'Copy with Group Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: core._.createIconNoSpan('clipboardCopy', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.copyToClipboard({ includeHeaders: true, includeGroupHeaders: true }); }
                    };
                }
                else {
                    return null;
                }
            case 'cut':
                if (core.ModuleRegistry.assertRegistered(core.ModuleNames.ClipboardModule, 'Cut from Menu')) {
                    var focusedCell = this.focusService.getFocusedCell();
                    var rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    var isEditable = rowNode ? focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: core._.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable,
                        action: function () { return _this.clipboardService.cutToClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (core.ModuleRegistry.assertRegistered(core.ModuleNames.ClipboardModule, 'Paste from Clipboard')) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: core._.createIconNoSpan('clipboardPaste', this.gridOptionsService, null),
                        action: function () { return _this.clipboardService.pasteFromClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'export':
                var exportSubMenuItems = [];
                var csvModuleLoaded = core.ModuleRegistry.isRegistered(core.ModuleNames.CsvExportModule);
                var excelModuleLoaded = core.ModuleRegistry.isRegistered(core.ModuleNames.ExcelExportModule);
                if (!this.gridOptionsService.is('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsService.is('suppressExcelExport') && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: core._.createIconNoSpan('save', this.gridOptionsService, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: core._.createIconNoSpan('csvExport', this.gridOptionsService, null),
                    action: function () { return _this.gridApi.exportDataAsCsv({}); }
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: core._.createIconNoSpan('excelExport', this.gridOptionsService, null),
                    action: function () { return _this.gridApi.exportDataAsExcel(); }
                };
            case 'separator':
                return 'separator';
            case 'pivotChart':
            case 'chartRange':
                return (_a = this.chartMenuItemMapper.getChartItems(key)) !== null && _a !== void 0 ? _a : null;
            default: {
                console.warn("AG Grid: unknown menu item type " + key);
                return null;
            }
        }
    };
    MenuItemMapper.prototype.createAggregationSubMenu = function (column) {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var columnToUse;
        if (column.isPrimary()) {
            columnToUse = column;
        }
        else {
            var pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = core._.exists(pivotValueColumn) ? pivotValueColumn : undefined;
        }
        var result = [];
        if (columnToUse) {
            var columnIsAlreadyAggValue_1 = columnToUse.isValueActive();
            var funcNames = this.aggFuncService.getFuncNames(columnToUse);
            result.push({
                name: localeTextFunc('noAggregation', 'None'),
                action: function () {
                    _this.columnModel.removeValueColumn(columnToUse, "contextMenu");
                    _this.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue_1
            });
            funcNames.forEach(function (funcName) {
                result.push({
                    name: localeTextFunc(funcName, core._.capitalise(funcName)),
                    action: function () {
                        _this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        _this.columnModel.addValueColumn(columnToUse, "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue_1 && columnToUse.getAggFunc() === funcName
                });
            });
        }
        return result;
    };
    __decorate$1([
        core.Autowired('columnModel')
    ], MenuItemMapper.prototype, "columnModel", void 0);
    __decorate$1([
        core.Autowired('gridApi')
    ], MenuItemMapper.prototype, "gridApi", void 0);
    __decorate$1([
        core.Optional('clipboardService')
    ], MenuItemMapper.prototype, "clipboardService", void 0);
    __decorate$1([
        core.Optional('aggFuncService')
    ], MenuItemMapper.prototype, "aggFuncService", void 0);
    __decorate$1([
        core.Autowired('focusService')
    ], MenuItemMapper.prototype, "focusService", void 0);
    __decorate$1([
        core.Autowired('rowPositionUtils')
    ], MenuItemMapper.prototype, "rowPositionUtils", void 0);
    __decorate$1([
        core.Autowired('chartMenuItemMapper')
    ], MenuItemMapper.prototype, "chartMenuItemMapper", void 0);
    MenuItemMapper = __decorate$1([
        core.Bean('menuItemMapper')
    ], MenuItemMapper);
    return MenuItemMapper;
}(core.BeanStub));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '29.1.0';

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var ChartMenuItemMapper = /** @class */ (function (_super) {
    __extends(ChartMenuItemMapper, _super);
    function ChartMenuItemMapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartMenuItemMapper_1 = ChartMenuItemMapper;
    ChartMenuItemMapper.prototype.getChartItems = function (key) {
        var _a, _b;
        if (!this.chartService) {
            core.ModuleRegistry.assertRegistered(core.ModuleNames.GridChartsModule, "the Context Menu key \"" + key + "\"");
            return undefined;
        }
        var builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);
        var topLevelMenuItem = builder.getMenuItem();
        var chartGroupsDef = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if (chartGroupsDef) {
            // Apply filtering and ordering if chartGroupsDef provided
            topLevelMenuItem = ChartMenuItemMapper_1.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    };
    // Remove our internal _key properties so this does not leak out of the class on the menu items.
    ChartMenuItemMapper.prototype.cleanInternals = function (menuItem) {
        if (!menuItem) {
            return menuItem;
        }
        var removeKey = function (m) {
            var _a;
            m === null || m === void 0 ? true : delete m._key;
            (_a = m === null || m === void 0 ? void 0 : m.subMenu) === null || _a === void 0 ? void 0 : _a.forEach(function (s) { return removeKey(s); });
            return m;
        };
        return removeKey(menuItem);
    };
    ChartMenuItemMapper.buildLookup = function (menuItem) {
        var itemLookup = {};
        var addItem = function (item) {
            itemLookup[item._key] = item;
            if (item.subMenu) {
                item.subMenu.map(function (s) { return addItem(s); });
            }
        };
        addItem(menuItem);
        return itemLookup;
    };
    /**
     * Make the MenuItem match the charts provided and their ordering on the ChartGroupsDef config object as provided by the user.
     */
    ChartMenuItemMapper.filterAndOrderChartMenu = function (topLevelMenuItem, chartGroupsDef, configLookup) {
        var _a;
        var menuItemLookup = this.buildLookup(topLevelMenuItem);
        var orderedAndFiltered = __assign(__assign({}, topLevelMenuItem), { subMenu: [] });
        Object.entries(chartGroupsDef).map(function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), group = _d[0], chartTypes = _d[1];
            var chartConfigGroup = configLookup[group];
            if (chartConfigGroup == undefined) {
                core._.doOnce(function () { return console.warn("AG Grid - invalid chartGroupsDef config '" + group + "'"); }, "invalid_chartGroupsDef" + group);
                return undefined;
            }
            var menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    var subMenus = chartTypes.map(function (chartType) {
                        var itemKey = chartConfigGroup[chartType];
                        if (itemKey == undefined) {
                            core._.doOnce(function () { return console.warn("AG Grid - invalid chartGroupsDef config '" + group + "." + chartType + "'"); }, "invalid_chartGroupsDef" + chartType + "_" + group);
                            return undefined;
                        }
                        return menuItemLookup[itemKey];
                    }).filter(function (s) { return s !== undefined; });
                    if (subMenus.length > 0) {
                        menuItem.subMenu = subMenus;
                        (_b = orderedAndFiltered.subMenu) === null || _b === void 0 ? void 0 : _b.push(menuItem);
                    }
                }
                else {
                    // Handles line case which is not actually a sub subMenu
                    (_c = orderedAndFiltered.subMenu) === null || _c === void 0 ? void 0 : _c.push(menuItem);
                }
            }
        });
        if (((_a = orderedAndFiltered.subMenu) === null || _a === void 0 ? void 0 : _a.length) == 0) {
            return undefined;
        }
        return orderedAndFiltered;
    };
    var ChartMenuItemMapper_1;
    __decorate([
        core.Optional('chartService')
    ], ChartMenuItemMapper.prototype, "chartService", void 0);
    ChartMenuItemMapper = ChartMenuItemMapper_1 = __decorate([
        core.Bean('chartMenuItemMapper')
    ], ChartMenuItemMapper);
    return ChartMenuItemMapper;
}(core.BeanStub));
var PivotMenuItemMapper = /** @class */ (function () {
    function PivotMenuItemMapper(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    PivotMenuItemMapper.prototype.getMenuItem = function () {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var getMenuItem = function (localeKey, defaultText, chartType, key) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createPivotChart({ chartType: chartType }); },
                _key: key
            };
        };
        return {
            name: localeTextFunc('pivotChart', 'Pivot Chart'),
            _key: 'pivotChart',
            subMenu: [
                {
                    _key: 'pivotColumnChart',
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: [
                        getMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn', 'pivotGroupedColumn'),
                        getMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn', 'pivotStackedColumn'),
                        getMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn', 'pivotNormalizedColumn')
                    ]
                },
                {
                    _key: 'pivotBarChart',
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: [
                        getMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar', 'pivotGroupedBar'),
                        getMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar', 'pivotStackedBar'),
                        getMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar', 'pivotNormalizedBar')
                    ]
                },
                {
                    _key: 'pivotPieChart',
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: [
                        getMenuItem('pie', 'Pie&lrm;', 'pie', 'pivotPie'),
                        getMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut', 'pivotDoughnut')
                    ]
                },
                getMenuItem('line', 'Line&lrm;', 'line', 'pivotLineChart'),
                {
                    _key: 'pivotXYChart',
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: [
                        getMenuItem('scatter', 'Scatter&lrm;', 'scatter', 'pivotScatter'),
                        getMenuItem('bubble', 'Bubble&lrm;', 'bubble', 'pivotBubble')
                    ]
                },
                {
                    _key: 'pivotAreaChart',
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: [
                        getMenuItem('area', 'Area&lrm;', 'area', 'pivotArea'),
                        getMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea', 'pivotStackedArea'),
                        getMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea', 'pivotNormalizedArea')
                    ]
                },
                getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'pivotHistogramChart'),
                {
                    _key: 'pivotCombinationChart',
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'pivotColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'pivotAreaColumnCombo')
                    ]
                }
            ],
            icon: core._.createIconNoSpan('chart', this.gridOptionsService, undefined),
        };
    };
    PivotMenuItemMapper.prototype.getConfigLookup = function () {
        return {
            columnGroup: {
                _key: 'pivotColumnChart',
                column: 'pivotGroupedColumn',
                stackedColumn: 'pivotStackedColumn',
                normalizedColumn: 'pivotNormalizedColumn',
            },
            barGroup: {
                _key: 'pivotBarChart',
                bar: 'pivotGroupedBar',
                stackedBar: 'pivotStackedBar',
                normalizedBar: 'pivotNormalizedBar',
            },
            pieGroup: {
                _key: 'pivotPieChart',
                pie: 'pivotPie',
                doughnut: 'pivotDoughnut',
            },
            lineGroup: {
                _key: 'pivotLineChart',
                line: 'pivotLineChart',
            },
            scatterGroup: {
                _key: 'pivotXYChart',
                bubble: 'pivotBubble',
                scatter: 'pivotScatter',
            },
            areaGroup: {
                _key: 'pivotAreaChart',
                area: 'pivotArea',
                stackedArea: 'pivotStackedArea',
                normalizedArea: 'pivotNormalizedArea',
            },
            histogramGroup: {
                _key: 'pivotHistogramChart',
                histogram: 'pivotHistogramChart',
            },
            combinationGroup: {
                _key: 'pivotCombinationChart',
                columnLineCombo: 'pivotColumnLineCombo',
                areaColumnCombo: 'pivotAreaColumnCombo',
                customCombo: '' // Not currently supported but needs a value to separate from a missing value
            }
        };
    };
    return PivotMenuItemMapper;
}());
var RangeMenuItemMapper = /** @class */ (function () {
    function RangeMenuItemMapper(gridOptionsService, chartService, localeService) {
        this.gridOptionsService = gridOptionsService;
        this.chartService = chartService;
        this.localeService = localeService;
    }
    RangeMenuItemMapper.prototype.getMenuItem = function () {
        var _this = this;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var getMenuItem = function (localeKey, defaultText, chartType, key) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createChartFromCurrentRange(chartType); },
                _key: key
            };
        };
        return {
            name: localeTextFunc('chartRange', 'Chart Range'),
            _key: 'chartRange',
            subMenu: [
                {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: [
                        getMenuItem('groupedColumn', 'Grouped&lrm;', 'groupedColumn', 'rangeGroupedColumn'),
                        getMenuItem('stackedColumn', 'Stacked&lrm;', 'stackedColumn', 'rangeStackedColumn'),
                        getMenuItem('normalizedColumn', '100% Stacked&lrm;', 'normalizedColumn', 'rangeNormalizedColumn')
                    ],
                    _key: 'rangeColumnChart'
                },
                {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: [
                        getMenuItem('groupedBar', 'Grouped&lrm;', 'groupedBar', 'rangeGroupedBar'),
                        getMenuItem('stackedBar', 'Stacked&lrm;', 'stackedBar', 'rangeStackedBar'),
                        getMenuItem('normalizedBar', '100% Stacked&lrm;', 'normalizedBar', 'rangeNormalizedBar')
                    ],
                    _key: 'rangeBarChart'
                },
                {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: [
                        getMenuItem('pie', 'Pie&lrm;', 'pie', 'rangePie'),
                        getMenuItem('doughnut', 'Doughnut&lrm;', 'doughnut', 'rangeDoughnut')
                    ],
                    _key: 'rangePieChart'
                },
                getMenuItem('line', 'Line&lrm;', 'line', 'rangeLineChart'),
                {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: [
                        getMenuItem('scatter', 'Scatter&lrm;', 'scatter', 'rangeScatter'),
                        getMenuItem('bubble', 'Bubble&lrm;', 'bubble', 'rangeBubble')
                    ],
                    _key: 'rangeXYChart'
                },
                {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: [
                        getMenuItem('area', 'Area&lrm;', 'area', 'rangeArea'),
                        getMenuItem('stackedArea', 'Stacked&lrm;', 'stackedArea', 'rangeStackedArea'),
                        getMenuItem('normalizedArea', '100% Stacked&lrm;', 'normalizedArea', 'rangeNormalizedArea')
                    ],
                    _key: 'rangeAreaChart'
                },
                getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'rangeHistogramChart'),
                {
                    name: localeTextFunc('combinationChart', 'Combination'),
                    subMenu: [
                        getMenuItem('columnLineCombo', 'Column & Line&lrm;', 'columnLineCombo', 'rangeColumnLineCombo'),
                        getMenuItem('AreaColumnCombo', 'Area & Column&lrm;', 'areaColumnCombo', 'rangeAreaColumnCombo')
                    ],
                    _key: 'rangeCombinationChart'
                }
            ],
            icon: core._.createIconNoSpan('chart', this.gridOptionsService, undefined),
        };
    };
    RangeMenuItemMapper.prototype.getConfigLookup = function () {
        return {
            columnGroup: {
                _key: 'rangeColumnChart',
                column: 'rangeGroupedColumn',
                stackedColumn: 'rangeStackedColumn',
                normalizedColumn: 'rangeNormalizedColumn',
            },
            barGroup: {
                _key: 'rangeBarChart',
                bar: 'rangeGroupedBar',
                stackedBar: 'rangeStackedBar',
                normalizedBar: 'rangeNormalizedBar',
            },
            pieGroup: {
                _key: 'rangePieChart',
                pie: 'rangePie',
                doughnut: 'rangeDoughnut',
            },
            lineGroup: {
                _key: 'rangeLineChart',
                line: 'rangeLineChart',
            },
            scatterGroup: {
                _key: 'rangeXYChart',
                bubble: 'rangeBubble',
                scatter: 'rangeScatter',
            },
            areaGroup: {
                _key: 'rangeAreaChart',
                area: 'rangeArea',
                stackedArea: 'rangeStackedArea',
                normalizedArea: 'rangeNormalizedArea',
            },
            histogramGroup: {
                _key: 'rangeHistogramChart',
                histogram: 'rangeHistogramChart',
            },
            combinationGroup: {
                _key: 'rangeCombinationChart',
                columnLineCombo: 'rangeColumnLineCombo',
                areaColumnCombo: 'rangeAreaColumnCombo',
                customCombo: '' // Not currently supported but needs a value to separate from a missing value
            }
        };
    };
    return RangeMenuItemMapper;
}());

var MenuModule = {
    version: VERSION,
    moduleName: core.ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.MenuModule = MenuModule;
