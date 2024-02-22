/**
          * @ag-grid-enterprise/menu - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v31.1.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');
var columnToolPanel = require('@ag-grid-enterprise/column-tool-panel');

var __extends$6 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EnterpriseMenuFactory = /** @class */ (function (_super) {
    __extends$6(EnterpriseMenuFactory, _super);
    function EnterpriseMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnterpriseMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent, containerType, filtersOnly) {
        var _this = this;
        var defaultTab = filtersOnly ? 'filterMenuTab' : undefined;
        this.showMenu(column, function (menu) {
            var _a;
            var ePopup = menu.getGui();
            _this.popupService.positionPopupUnderMouseEvent({
                type: containerType,
                column: column,
                mouseEvent: mouseEvent,
                ePopup: ePopup
            });
            if (defaultTab) {
                (_a = menu.showTab) === null || _a === void 0 ? void 0 : _a.call(menu, defaultTab);
            }
            _this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
        }, containerType, defaultTab, undefined, mouseEvent.target);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource, containerType, filtersOnly) {
        var _this = this;
        var multiplier = -1;
        var alignSide = 'left';
        if (this.gridOptionsService.get('enableRtl')) {
            multiplier = 1;
            alignSide = 'right';
        }
        var defaultTab = filtersOnly ? 'filterMenuTab' : undefined;
        var restrictToTabs = defaultTab ? [defaultTab] : undefined;
        var isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        var nudgeX = (isLegacyMenuEnabled ? 9 : 4) * multiplier;
        var nudgeY = isLegacyMenuEnabled ? -23 : 4;
        this.showMenu(column, function (menu) {
            var _a;
            var ePopup = menu.getGui();
            _this.popupService.positionPopupByComponent({
                type: containerType,
                column: column,
                eventSource: eventSource,
                ePopup: ePopup,
                alignSide: alignSide,
                nudgeX: nudgeX,
                nudgeY: nudgeY,
                position: 'under',
                keepWithinBounds: true,
            });
            if (defaultTab) {
                (_a = menu.showTab) === null || _a === void 0 ? void 0 : _a.call(menu, defaultTab);
            }
            _this.dispatchVisibleChangedEvent(true, false, column, defaultTab);
        }, containerType, defaultTab, restrictToTabs, eventSource);
    };
    EnterpriseMenuFactory.prototype.showMenu = function (column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
        var _this = this;
        var _a;
        var _b = this.getMenuParams(column, restrictToTabs, eventSource), menu = _b.menu, eMenuGui = _b.eMenuGui, anchorToElement = _b.anchorToElement, restoreFocusParams = _b.restoreFocusParams;
        var closedFuncs = [];
        if (column) {
            // if we don't have a column, then the menu wasn't launched via keyboard navigation
            closedFuncs.push(function (e) {
                var eComp = menu.getGui();
                _this.destroyBean(menu);
                column === null || column === void 0 ? void 0 : column.setMenuVisible(false, 'contextMenu');
                _this.menuUtils.restoreFocusOnClose(restoreFocusParams, eComp, e);
            });
        }
        var translate = this.localeService.getLocaleTextFunc();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: function (e) {
                closedFuncs.forEach(function (f) { return f(e); });
                _this.dispatchVisibleChangedEvent(false, false, column, defaultTab);
            },
            afterGuiAttached: function (params) { return menu.afterGuiAttached(Object.assign({}, { container: containerType }, params)); },
            // if defaultTab is not present, positionCallback will be called
            // after `showTabBasedOnPreviousSelection` is called.
            positionCallback: !!defaultTab ? function () { return positionCallback(menu); } : undefined,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        if (!defaultTab) {
            (_a = menu.showTabBasedOnPreviousSelection) === null || _a === void 0 ? void 0 : _a.call(menu);
            // reposition the menu because the method above could load
            // an element that is bigger than enterpriseMenu header.
            positionCallback(menu);
        }
        if (this.menuService.isColumnMenuAnchoringEnabled()) {
            // if user starts showing / hiding columns, or otherwise move the underlying column
            // for this menu, we want to stop tracking the menu with the column position. otherwise
            // the menu would move as the user is using the columns tab inside the menu.
            var stopAnchoringPromise = this.popupService.setPopupPositionRelatedToElement(eMenuGui, anchorToElement);
            if (stopAnchoringPromise && column) {
                this.addStopAnchoring(stopAnchoringPromise, column, closedFuncs);
            }
        }
        menu.addEventListener(TabbedColumnMenu.EVENT_TAB_SELECTED, function (event) {
            _this.dispatchVisibleChangedEvent(false, true, column);
            _this.lastSelectedTab = event.key;
            _this.dispatchVisibleChangedEvent(true, true, column);
        });
        column === null || column === void 0 ? void 0 : column.setMenuVisible(true, 'contextMenu');
        this.activeMenu = menu;
        menu.addEventListener(core.BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    EnterpriseMenuFactory.prototype.addStopAnchoring = function (stopAnchoringPromise, column, closedFuncsArr) {
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
        var restoreFocusParams = {
            column: column,
            headerPosition: this.focusService.getFocusedHeader(),
            columnIndex: this.columnModel.getAllDisplayedColumns().indexOf(column),
            eventSource: eventSource
        };
        var menu = this.createMenu(column, restoreFocusParams, restrictToTabs, eventSource);
        return {
            menu: menu,
            eMenuGui: menu.getGui(),
            anchorToElement: eventSource || this.ctrlsService.getGridBodyCtrl().getGui(),
            restoreFocusParams: restoreFocusParams
        };
    };
    EnterpriseMenuFactory.prototype.createMenu = function (column, restoreFocusParams, restrictToTabs, eventSource) {
        if (this.menuService.isLegacyMenuEnabled()) {
            return this.createBean(new TabbedColumnMenu(column, restoreFocusParams, this.lastSelectedTab, restrictToTabs, eventSource));
        }
        else {
            return this.createBean(new ColumnContextMenu(column, restoreFocusParams, eventSource));
        }
    };
    EnterpriseMenuFactory.prototype.dispatchVisibleChangedEvent = function (visible, switchingTab, column, defaultTab) {
        var _a, _b;
        var event = {
            type: core.Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible: visible,
            switchingTab: switchingTab,
            key: ((_b = (_a = this.lastSelectedTab) !== null && _a !== void 0 ? _a : defaultTab) !== null && _b !== void 0 ? _b : (this.menuService.isLegacyMenuEnabled() ? TabbedColumnMenu.TAB_GENERAL : 'columnMenu')),
            column: column !== null && column !== void 0 ? column : null
        };
        this.eventService.dispatchEvent(event);
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        var _a;
        if (!this.menuService.isLegacyMenuEnabled()) {
            return true;
        }
        // Determine whether there are any tabs to show in the menu, given that the filter tab may be hidden
        var isFilterDisabled = !this.filterManager.isFilterAllowed(column);
        var tabs = (_a = column.getColDef().menuTabs) !== null && _a !== void 0 ? _a : TabbedColumnMenu.TABS_DEFAULT;
        var numActiveTabs = isFilterDisabled && tabs.includes(TabbedColumnMenu.TAB_FILTER)
            ? tabs.length - 1
            : tabs.length;
        return numActiveTabs > 0;
    };
    EnterpriseMenuFactory.prototype.showMenuAfterContextMenuEvent = function (column, mouseEvent, touchEvent) {
        var _this = this;
        this.menuUtils.onContextMenu(mouseEvent, touchEvent, function (eventOrTouch) {
            _this.showMenuAfterMouseEvent(column, eventOrTouch, 'columnMenu');
            return true;
        });
    };
    __decorate$6([
        core.Autowired('popupService')
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate$6([
        core.Autowired('focusService')
    ], EnterpriseMenuFactory.prototype, "focusService", void 0);
    __decorate$6([
        core.Autowired('ctrlsService')
    ], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
    __decorate$6([
        core.Autowired('columnModel')
    ], EnterpriseMenuFactory.prototype, "columnModel", void 0);
    __decorate$6([
        core.Autowired('filterManager')
    ], EnterpriseMenuFactory.prototype, "filterManager", void 0);
    __decorate$6([
        core.Autowired('menuUtils')
    ], EnterpriseMenuFactory.prototype, "menuUtils", void 0);
    __decorate$6([
        core.Autowired('menuService')
    ], EnterpriseMenuFactory.prototype, "menuService", void 0);
    EnterpriseMenuFactory = __decorate$6([
        core.Bean('enterpriseMenuFactory')
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
}(core.BeanStub));
var TabbedColumnMenu = /** @class */ (function (_super) {
    __extends$6(TabbedColumnMenu, _super);
    function TabbedColumnMenu(column, restoreFocusParams, initialSelection, restrictTo, sourceElement) {
        var _this = _super.call(this) || this;
        _this.column = column;
        _this.restoreFocusParams = restoreFocusParams;
        _this.initialSelection = initialSelection;
        _this.restrictTo = restrictTo;
        _this.sourceElement = sourceElement;
        _this.tabFactories = {};
        _this.includeChecks = {};
        _this.tabFactories[TabbedColumnMenu.TAB_GENERAL] = _this.createMainPanel.bind(_this);
        _this.tabFactories[TabbedColumnMenu.TAB_FILTER] = _this.createFilterPanel.bind(_this);
        _this.tabFactories[TabbedColumnMenu.TAB_COLUMNS] = _this.createColumnsPanel.bind(_this);
        _this.includeChecks[TabbedColumnMenu.TAB_GENERAL] = function () { return true; };
        _this.includeChecks[TabbedColumnMenu.TAB_FILTER] = function () { return column ? _this.filterManager.isFilterAllowed(column) : false; };
        _this.includeChecks[TabbedColumnMenu.TAB_COLUMNS] = function () { return true; };
        return _this;
    }
    TabbedColumnMenu.prototype.init = function () {
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
    TabbedColumnMenu.prototype.getTabsToCreate = function () {
        var _this = this;
        var _a, _b;
        if (this.restrictTo) {
            return this.restrictTo;
        }
        return ((_b = (_a = this.column) === null || _a === void 0 ? void 0 : _a.getColDef().menuTabs) !== null && _b !== void 0 ? _b : TabbedColumnMenu.TABS_DEFAULT)
            .filter(function (tabName) { return _this.isValidMenuTabItem(tabName); })
            .filter(function (tabName) { return _this.isNotSuppressed(tabName); })
            .filter(function (tabName) { return _this.isModuleLoaded(tabName); });
    };
    TabbedColumnMenu.prototype.isModuleLoaded = function (menuTabName) {
        if (menuTabName === TabbedColumnMenu.TAB_COLUMNS) {
            return core.ModuleRegistry.__isRegistered(core.ModuleNames.ColumnsToolPanelModule, this.context.getGridId());
        }
        return true;
    };
    TabbedColumnMenu.prototype.isValidMenuTabItem = function (menuTabName) {
        var isValid = true;
        var itemsToConsider = TabbedColumnMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && TabbedColumnMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
        if (!isValid) {
            console.warn("AG Grid: Trying to render an invalid menu item '".concat(menuTabName, "'. Check that your 'menuTabs' contains one of [").concat(itemsToConsider, "]"));
        }
        return isValid;
    };
    TabbedColumnMenu.prototype.isNotSuppressed = function (menuTabName) {
        return this.includeChecks[menuTabName]();
    };
    TabbedColumnMenu.prototype.createTab = function (name) {
        return this.tabFactories[name]();
    };
    TabbedColumnMenu.prototype.showTabBasedOnPreviousSelection = function () {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    };
    TabbedColumnMenu.prototype.showTab = function (toShow) {
        if (this.tabItemColumns && toShow === TabbedColumnMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter && toShow === TabbedColumnMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && toShow === TabbedColumnMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            this.tabbedLayout.showFirstItem();
        }
    };
    TabbedColumnMenu.prototype.onTabItemClicked = function (event) {
        var key = null;
        switch (event.item) {
            case this.tabItemColumns:
                key = TabbedColumnMenu.TAB_COLUMNS;
                break;
            case this.tabItemFilter:
                key = TabbedColumnMenu.TAB_FILTER;
                break;
            case this.tabItemGeneral:
                key = TabbedColumnMenu.TAB_GENERAL;
                break;
        }
        if (key) {
            this.activateTab(key);
        }
    };
    TabbedColumnMenu.prototype.activateTab = function (tab) {
        var ev = {
            type: TabbedColumnMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    };
    TabbedColumnMenu.prototype.createMainPanel = function () {
        var _this = this;
        this.mainMenuList = this.columnMenuFactory.createMenu(this, this.column, function () { var _a; return (_a = _this.sourceElement) !== null && _a !== void 0 ? _a : _this.getGui(); });
        this.mainMenuList.addEventListener(core.AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: core._.createIconNoSpan('menu', this.gridOptionsService, this.column),
            titleLabel: TabbedColumnMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: core.AgPromise.resolve(this.mainMenuList.getGui()),
            name: TabbedColumnMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    };
    TabbedColumnMenu.prototype.onHidePopup = function (event) {
        this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
    };
    TabbedColumnMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.column ? this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU') : null;
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
            titleLabel: TabbedColumnMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper === null || filterWrapper === void 0 ? void 0 : filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            afterDetachedCallback: afterDetachedCallback,
            name: TabbedColumnMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    };
    TabbedColumnMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        eWrapperDiv.classList.add('ag-menu-column-select-wrapper');
        var columnSelectPanel = this.columnChooserFactory.createColumnSelectPanel(this, this.column);
        var columnSelectPanelGui = columnSelectPanel.getGui();
        columnSelectPanelGui.classList.add('ag-menu-column-select');
        eWrapperDiv.appendChild(columnSelectPanelGui);
        this.tabItemColumns = {
            title: core._.createIconNoSpan('columns', this.gridOptionsService, this.column),
            titleLabel: TabbedColumnMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: core.AgPromise.resolve(eWrapperDiv),
            name: TabbedColumnMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    };
    TabbedColumnMenu.prototype.afterGuiAttached = function (params) {
        var container = params.container, hidePopup = params.hidePopup;
        this.tabbedLayout.setAfterAttachedParams({ container: container, hidePopup: hidePopup });
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
    };
    TabbedColumnMenu.prototype.getGui = function () {
        return this.tabbedLayout.getGui();
    };
    TabbedColumnMenu.EVENT_TAB_SELECTED = 'tabSelected';
    TabbedColumnMenu.TAB_FILTER = 'filterMenuTab';
    TabbedColumnMenu.TAB_GENERAL = 'generalMenuTab';
    TabbedColumnMenu.TAB_COLUMNS = 'columnsMenuTab';
    TabbedColumnMenu.TABS_DEFAULT = [TabbedColumnMenu.TAB_GENERAL, TabbedColumnMenu.TAB_FILTER, TabbedColumnMenu.TAB_COLUMNS];
    __decorate$6([
        core.Autowired('filterManager')
    ], TabbedColumnMenu.prototype, "filterManager", void 0);
    __decorate$6([
        core.Autowired('columnChooserFactory')
    ], TabbedColumnMenu.prototype, "columnChooserFactory", void 0);
    __decorate$6([
        core.Autowired('columnMenuFactory')
    ], TabbedColumnMenu.prototype, "columnMenuFactory", void 0);
    __decorate$6([
        core.Autowired('menuUtils')
    ], TabbedColumnMenu.prototype, "menuUtils", void 0);
    __decorate$6([
        core.PostConstruct
    ], TabbedColumnMenu.prototype, "init", null);
    return TabbedColumnMenu;
}(core.BeanStub));
var ColumnContextMenu = /** @class */ (function (_super) {
    __extends$6(ColumnContextMenu, _super);
    function ColumnContextMenu(column, restoreFocusParams, sourceElement) {
        var _this = _super.call(this, /* html */ "\n            <div ref=\"eColumnMenu\" role=\"presentation\" class=\"ag-menu ag-column-menu\"></div>\n        ") || this;
        _this.column = column;
        _this.restoreFocusParams = restoreFocusParams;
        _this.sourceElement = sourceElement;
        return _this;
    }
    ColumnContextMenu.prototype.init = function () {
        var _this = this;
        this.mainMenuList = this.columnMenuFactory.createMenu(this, this.column, function () { var _a; return (_a = _this.sourceElement) !== null && _a !== void 0 ? _a : _this.getGui(); });
        this.mainMenuList.addEventListener(core.AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
        this.eColumnMenu.appendChild(this.mainMenuList.getGui());
    };
    ColumnContextMenu.prototype.onHidePopup = function (event) {
        this.menuUtils.closePopupAndRestoreFocusOnSelect(this.hidePopupFunc, this.restoreFocusParams, event);
    };
    ColumnContextMenu.prototype.afterGuiAttached = function (_a) {
        var hidePopup = _a.hidePopup;
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
        this.focusService.focusInto(this.mainMenuList.getGui());
    };
    __decorate$6([
        core.Autowired('columnMenuFactory')
    ], ColumnContextMenu.prototype, "columnMenuFactory", void 0);
    __decorate$6([
        core.Autowired('menuUtils')
    ], ColumnContextMenu.prototype, "menuUtils", void 0);
    __decorate$6([
        core.Autowired('focusService')
    ], ColumnContextMenu.prototype, "focusService", void 0);
    __decorate$6([
        core.RefSelector('eColumnMenu')
    ], ColumnContextMenu.prototype, "eColumnMenu", void 0);
    __decorate$6([
        core.PostConstruct
    ], ColumnContextMenu.prototype, "init", null);
    return ColumnContextMenu;
}(core.Component));

var __extends$5 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CSS_MENU = 'ag-menu';
var CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';
var ContextMenuFactory = /** @class */ (function (_super) {
    __extends$5(ContextMenuFactory, _super);
    function ContextMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions = [];
        if (core._.exists(node) && core.ModuleRegistry.__isRegistered(core.ModuleNames.ClipboardModule, this.context.getGridId())) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gridOptionsService.get('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsService.get('enableCharts') && core.ModuleRegistry.__isRegistered(core.ModuleNames.GridChartsModule, this.context.getGridId())) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (core._.exists(node)) {
            // if user clicks a cell
            var csvModuleMissing = !core.ModuleRegistry.__isRegistered(core.ModuleNames.CsvExportModule, this.context.getGridId());
            var excelModuleMissing = !core.ModuleRegistry.__isRegistered(core.ModuleNames.ExcelExportModule, this.context.getGridId());
            var suppressExcel = this.gridOptionsService.get('suppressExcelExport') || excelModuleMissing;
            var suppressCsv = this.gridOptionsService.get('suppressCsvExport') || csvModuleMissing;
            var onIPad = core._.isIOSUserAgent();
            var anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }
        var defaultItems = defaultMenuOptions.length ? defaultMenuOptions : undefined;
        var columnContextMenuItems = column === null || column === void 0 ? void 0 : column.getColDef().contextMenuItems;
        if (Array.isArray(columnContextMenuItems)) {
            return columnContextMenuItems;
        }
        else if (typeof columnContextMenuItems === 'function') {
            return columnContextMenuItems(this.gridOptionsService.addGridCommonParams({
                column: column,
                node: node,
                value: value,
                defaultItems: defaultItems
            }));
        }
        else {
            var userFunc = this.gridOptionsService.getCallback('getContextMenuItems');
            if (userFunc) {
                return userFunc({ column: column, node: node, value: value, defaultItems: defaultItems });
            }
            else {
                return defaultMenuOptions;
            }
        }
    };
    ContextMenuFactory.prototype.onContextMenu = function (mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
        var _this = this;
        this.menuUtils.onContextMenu(mouseEvent, touchEvent, function (eventOrTouch) { return _this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement); });
    };
    ContextMenuFactory.prototype.showMenu = function (node, column, value, mouseEvent, anchorToElement) {
        var _this = this;
        var menuItems = this.getMenuItems(node, column, value);
        var eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
        if (menuItems === undefined || core._.missingOrEmpty(menuItems)) {
            return false;
        }
        var menu = new ContextMenu(menuItems, column, node, value);
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
                var isRtl = _this.gridOptionsService.get('enableRtl');
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
            menu.addEventListener(core.AgMenuItemComponent.EVENT_CLOSE_MENU, addPopupRes.hideFunc);
        }
        return true;
    };
    __decorate$5([
        core.Autowired('popupService')
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate$5([
        core.Optional('rangeService')
    ], ContextMenuFactory.prototype, "rangeService", void 0);
    __decorate$5([
        core.Autowired('ctrlsService')
    ], ContextMenuFactory.prototype, "ctrlsService", void 0);
    __decorate$5([
        core.Autowired('columnModel')
    ], ContextMenuFactory.prototype, "columnModel", void 0);
    __decorate$5([
        core.Autowired('menuUtils')
    ], ContextMenuFactory.prototype, "menuUtils", void 0);
    ContextMenuFactory = __decorate$5([
        core.Bean('contextMenuFactory')
    ], ContextMenuFactory);
    return ContextMenuFactory;
}(core.BeanStub));
var ContextMenu = /** @class */ (function (_super) {
    __extends$5(ContextMenu, _super);
    function ContextMenu(menuItems, column, node, value) {
        var _this = _super.call(this, /* html */ "<div class=\"".concat(CSS_MENU, "\" role=\"presentation\"></div>")) || this;
        _this.menuItems = menuItems;
        _this.column = column;
        _this.node = node;
        _this.value = value;
        _this.menuList = null;
        _this.focusedCell = null;
        return _this;
    }
    ContextMenu.prototype.addMenuItems = function () {
        var _this = this;
        var menuList = this.createManagedBean(new core.AgMenuList(0, {
            column: this.column,
            node: this.node,
            value: this.value
        }));
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null, function () { return _this.getGui(); });
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(core.AgMenuItemComponent.EVENT_CLOSE_MENU, function (e) { return _this.dispatchEvent(e); });
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
    __decorate$5([
        core.Autowired('menuItemMapper')
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate$5([
        core.Autowired('focusService')
    ], ContextMenu.prototype, "focusService", void 0);
    __decorate$5([
        core.Autowired('cellPositionUtils')
    ], ContextMenu.prototype, "cellPositionUtils", void 0);
    __decorate$5([
        core.PostConstruct
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
}(core.Component));

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MenuItemMapper = /** @class */ (function (_super) {
    __extends$4(MenuItemMapper, _super);
    function MenuItemMapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuItemMapper.prototype.mapWithStockItems = function (originalList, column, sourceElement) {
        var _this = this;
        if (!originalList) {
            return [];
        }
        var resultList = [];
        originalList.forEach(function (menuItemOrString) {
            var result;
            if (typeof menuItemOrString === 'string') {
                result = _this.getStockMenuItem(menuItemOrString, column, sourceElement);
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
                resultDef.subMenu = _this.mapWithStockItems(subMenu, column, sourceElement);
            }
            if (result != null) {
                resultList.push(result);
            }
        });
        return resultList;
    };
    MenuItemMapper.prototype.getStockMenuItem = function (key, column, sourceElement) {
        var _this = this;
        var _a;
        var localeTextFunc = this.localeService.getLocaleTextFunc();
        var skipHeaderOnAutoSize = this.gridOptionsService.get('skipHeaderOnAutoSize');
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
                    action: function () { return _this.columnModel.setColumnsPinned([column], 'left', "contextMenu"); },
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: function () { return _this.columnModel.setColumnsPinned([column], 'right', "contextMenu"); },
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: function () { return _this.columnModel.setColumnsPinned([column], null, "contextMenu"); },
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (core.ModuleRegistry.__assertRegistered(core.ModuleNames.RowGroupingModule, 'Aggregation from Menu', this.context.getGridId())) {
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
                    action: function () { return _this.columnModel.autoSizeColumn(column, "contextMenu", skipHeaderOnAutoSize); }
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: function () { return _this.columnModel.autoSizeAllColumns("contextMenu", skipHeaderOnAutoSize); }
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + core._.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: (column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup),
                    action: function () { return _this.columnModel.addRowGroupColumns([column], "contextMenu"); },
                    icon: core._.createIconNoSpan('menuAddRowGroup', this.gridOptionsService, null)
                };
            case 'rowUnGroup':
                var icon = core._.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsService, null);
                var showRowGroup_1 = column === null || column === void 0 ? void 0 : column.getColDef().showRowGroup;
                var lockedGroups_1 = this.gridOptionsService.get('groupLockGroupColumns');
                // Handle single auto group column
                if (showRowGroup_1 === true) {
                    return {
                        name: localeTextFunc('ungroupAll', 'Un-Group All'),
                        disabled: lockedGroups_1 === -1 || lockedGroups_1 >= this.columnModel.getRowGroupColumns().length,
                        action: function () { return _this.columnModel.setRowGroupColumns(_this.columnModel.getRowGroupColumns().slice(0, lockedGroups_1), "contextMenu"); },
                        icon: icon
                    };
                }
                // Handle multiple auto group columns
                if (typeof showRowGroup_1 === 'string') {
                    var underlyingColumn = this.columnModel.getPrimaryColumn(showRowGroup_1);
                    var ungroupByName = (underlyingColumn != null) ? core._.escapeString(this.columnModel.getDisplayNameForColumn(underlyingColumn, 'header')) : showRowGroup_1;
                    return {
                        name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + ungroupByName,
                        disabled: underlyingColumn != null && this.columnModel.isColumnGroupingLocked(underlyingColumn),
                        action: function () { return _this.columnModel.removeRowGroupColumns([showRowGroup_1], "contextMenu"); },
                        icon: icon
                    };
                }
                // Handle primary column
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + core._.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    disabled: !(column === null || column === void 0 ? void 0 : column.isRowGroupActive()) || !(column === null || column === void 0 ? void 0 : column.getColDef().enableRowGroup) || this.columnModel.isColumnGroupingLocked(column),
                    action: function () { return _this.columnModel.removeRowGroupColumns([column], "contextMenu"); },
                    icon: icon
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: function () { return _this.columnModel.resetColumnState("contextMenu"); }
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All Row Groups'),
                    action: function () { return _this.gridApi.expandAll(); }
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All Row Groups'),
                    action: function () { return _this.gridApi.collapseAll(); }
                };
            case 'copy':
                if (core.ModuleRegistry.__assertRegistered(core.ModuleNames.ClipboardModule, 'Copy from Menu', this.context.getGridId())) {
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
                if (core.ModuleRegistry.__assertRegistered(core.ModuleNames.ClipboardModule, 'Copy with Headers from Menu', this.context.getGridId())) {
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
                if (core.ModuleRegistry.__assertRegistered(core.ModuleNames.ClipboardModule, 'Copy with Group Headers from Menu', this.context.getGridId())) {
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
                if (core.ModuleRegistry.__assertRegistered(core.ModuleNames.ClipboardModule, 'Cut from Menu', this.context.getGridId())) {
                    var focusedCell = this.focusService.getFocusedCell();
                    var rowNode = focusedCell ? this.rowPositionUtils.getRowNode(focusedCell) : null;
                    var isEditable = rowNode ? focusedCell === null || focusedCell === void 0 ? void 0 : focusedCell.column.isCellEditable(rowNode) : false;
                    return {
                        name: localeTextFunc('cut', 'Cut'),
                        shortcut: localeTextFunc('ctrlX', 'Ctrl+X'),
                        icon: core._.createIconNoSpan('clipboardCut', this.gridOptionsService, null),
                        disabled: !isEditable || this.gridOptionsService.get('suppressCutToClipboard'),
                        action: function () { return _this.clipboardService.cutToClipboard(undefined, 'contextMenu'); }
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (core.ModuleRegistry.__assertRegistered(core.ModuleNames.ClipboardModule, 'Paste from Clipboard', this.context.getGridId())) {
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
                var csvModuleLoaded = core.ModuleRegistry.__isRegistered(core.ModuleNames.CsvExportModule, this.context.getGridId());
                var excelModuleLoaded = core.ModuleRegistry.__isRegistered(core.ModuleNames.ExcelExportModule, this.context.getGridId());
                if (!this.gridOptionsService.get('suppressCsvExport') && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsService.get('suppressExcelExport') && excelModuleLoaded) {
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
            case 'columnFilter':
                if (column) {
                    return {
                        name: localeTextFunc('columnFilter', 'Column Filter'),
                        icon: core._.createIconNoSpan('filter', this.gridOptionsService, null),
                        action: function () { return _this.menuService.showFilterMenu({
                            column: column,
                            buttonElement: sourceElement(), containerType: 'columnFilter', positionBy: 'button'
                        }); }
                    };
                }
                else {
                    return null;
                }
            case 'columnChooser':
                if (core.ModuleRegistry.__isRegistered(core.ModuleNames.ColumnsToolPanelModule, this.context.getGridId())) {
                    return {
                        name: localeTextFunc('columnChooser', 'Choose Columns'),
                        icon: core._.createIconNoSpan('columns', this.gridOptionsService, null),
                        action: function () { return _this.menuService.showColumnChooser({ column: column, eventSource: sourceElement() }); }
                    };
                }
                else {
                    return null;
                }
            case 'sortAscending':
                return {
                    name: localeTextFunc('sortAscending', 'Sort Ascending'),
                    icon: core._.createIconNoSpan('sortAscending', this.gridOptionsService, null),
                    action: function () { return _this.sortController.setSortForColumn(column, 'asc', false, 'columnMenu'); }
                };
            case 'sortDescending':
                return {
                    name: localeTextFunc('sortDescending', 'Sort Descending'),
                    icon: core._.createIconNoSpan('sortDescending', this.gridOptionsService, null),
                    action: function () { return _this.sortController.setSortForColumn(column, 'desc', false, 'columnMenu'); }
                };
            case 'sortUnSort':
                return {
                    name: localeTextFunc('sortUnSort', 'Clear Sort'),
                    icon: core._.createIconNoSpan('sortUnSort', this.gridOptionsService, null),
                    action: function () { return _this.sortController.setSortForColumn(column, null, false, 'columnMenu'); }
                };
            default: {
                console.warn("AG Grid: unknown menu item type ".concat(key));
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
                    _this.columnModel.removeValueColumns([columnToUse], "contextMenu");
                    _this.columnModel.setColumnAggFunc(columnToUse, undefined, "contextMenu");
                },
                checked: !columnIsAlreadyAggValue_1
            });
            funcNames.forEach(function (funcName) {
                result.push({
                    name: localeTextFunc(funcName, _this.aggFuncService.getDefaultFuncLabel(funcName)),
                    action: function () {
                        _this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                        _this.columnModel.addValueColumns([columnToUse], "contextMenu");
                    },
                    checked: columnIsAlreadyAggValue_1 && columnToUse.getAggFunc() === funcName
                });
            });
        }
        return result;
    };
    __decorate$4([
        core.Autowired('columnModel')
    ], MenuItemMapper.prototype, "columnModel", void 0);
    __decorate$4([
        core.Autowired('gridApi')
    ], MenuItemMapper.prototype, "gridApi", void 0);
    __decorate$4([
        core.Optional('clipboardService')
    ], MenuItemMapper.prototype, "clipboardService", void 0);
    __decorate$4([
        core.Optional('aggFuncService')
    ], MenuItemMapper.prototype, "aggFuncService", void 0);
    __decorate$4([
        core.Autowired('focusService')
    ], MenuItemMapper.prototype, "focusService", void 0);
    __decorate$4([
        core.Autowired('rowPositionUtils')
    ], MenuItemMapper.prototype, "rowPositionUtils", void 0);
    __decorate$4([
        core.Autowired('chartMenuItemMapper')
    ], MenuItemMapper.prototype, "chartMenuItemMapper", void 0);
    __decorate$4([
        core.Autowired('menuService')
    ], MenuItemMapper.prototype, "menuService", void 0);
    __decorate$4([
        core.Autowired('sortController')
    ], MenuItemMapper.prototype, "sortController", void 0);
    MenuItemMapper = __decorate$4([
        core.Bean('menuItemMapper')
    ], MenuItemMapper);
    return MenuItemMapper;
}(core.BeanStub));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '31.1.1';

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
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
    __extends$3(ChartMenuItemMapper, _super);
    function ChartMenuItemMapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartMenuItemMapper_1 = ChartMenuItemMapper;
    ChartMenuItemMapper.prototype.getChartItems = function (key) {
        var _a, _b;
        if (!this.chartService) {
            core.ModuleRegistry.__assertRegistered(core.ModuleNames.GridChartsModule, "the Context Menu key \"".concat(key, "\""), this.context.getGridId());
            return undefined;
        }
        var builder = key === 'pivotChart'
            ? new PivotMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService)
            : new RangeMenuItemMapper(this.gridOptionsService, this.chartService, this.localeService);
        var isEnterprise = this.chartService.isEnterprise();
        var topLevelMenuItem = builder.getMenuItem();
        if (topLevelMenuItem && topLevelMenuItem.subMenu && !isEnterprise) {
            // Filter out enterprise-only menu items if 'Community Integrated'
            var filterEnterpriseItems_1 = function (m) {
                var _a;
                return (__assign(__assign({}, m), { subMenu: (_a = m.subMenu) === null || _a === void 0 ? void 0 : _a.filter(function (menu) { return !menu._enterprise; }).map(function (menu) { return filterEnterpriseItems_1(menu); }) }));
            };
            topLevelMenuItem = filterEnterpriseItems_1(topLevelMenuItem);
        }
        var chartGroupsDef = (_b = (_a = this.gridOptionsService.get('chartToolPanelsDef')) === null || _a === void 0 ? void 0 : _a.settingsPanel) === null || _b === void 0 ? void 0 : _b.chartGroupsDef;
        if (chartGroupsDef) {
            topLevelMenuItem = ChartMenuItemMapper_1.filterAndOrderChartMenu(topLevelMenuItem, chartGroupsDef, builder.getConfigLookup());
        }
        return this.cleanInternals(topLevelMenuItem);
    };
    // Remove our internal _key and _enterprise properties so this does not leak out of the class on the menu items.
    ChartMenuItemMapper.prototype.cleanInternals = function (menuItem) {
        if (!menuItem) {
            return menuItem;
        }
        var removeKeys = function (m) {
            var _a;
            m === null || m === void 0 ? true : delete m._key;
            m === null || m === void 0 ? true : delete m._enterprise;
            (_a = m === null || m === void 0 ? void 0 : m.subMenu) === null || _a === void 0 ? void 0 : _a.forEach(function (s) { return removeKeys(s); });
            return m;
        };
        return removeKeys(menuItem);
    };
    ChartMenuItemMapper.buildLookup = function (menuItem) {
        var itemLookup = {};
        var addItem = function (item) {
            itemLookup[item._key] = item;
            if (item.subMenu) {
                item.subMenu.forEach(function (s) { return addItem(s); });
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
        Object.entries(chartGroupsDef).forEach(function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), group = _d[0], chartTypes = _d[1];
            var chartConfigGroup = configLookup[group];
            // Skip any context panels that are not enabled for the current chart type
            if (chartConfigGroup === null)
                return;
            if (chartConfigGroup == undefined) {
                core._.warnOnce("invalid chartGroupsDef config '".concat(group, "'"));
                return undefined;
            }
            var menuItem = menuItemLookup[chartConfigGroup._key];
            if (menuItem) {
                if (menuItem.subMenu) {
                    var subMenus = chartTypes.map(function (chartType) {
                        var itemKey = chartConfigGroup[chartType];
                        if (itemKey == undefined) {
                            core._.warnOnce("invalid chartGroupsDef config '".concat(group, ".").concat(chartType, "'"));
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
    __decorate$3([
        core.Optional('chartService')
    ], ChartMenuItemMapper.prototype, "chartService", void 0);
    ChartMenuItemMapper = ChartMenuItemMapper_1 = __decorate$3([
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
        var getMenuItem = function (localeKey, defaultText, chartType, key, enterprise) {
            if (enterprise === void 0) { enterprise = false; }
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createPivotChart({ chartType: chartType }); },
                _key: key,
                _enterprise: enterprise
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
                        getMenuItem('donut', 'Donut&lrm;', 'donut', 'pivotDonut')
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
                {
                    _key: 'pivotStatisticalChart',
                    _enterprise: false,
                    name: localeTextFunc('statisticalChart', 'Statistical'),
                    subMenu: [
                        getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'pivotHistogram', false),
                    ],
                },
                {
                    _key: 'pivotHierarchicalChart',
                    _enterprise: true,
                    name: localeTextFunc('hierarchicalChart', 'Hierarchical'),
                    subMenu: [
                        getMenuItem('treemapChart', 'Treemap&lrm;', 'treemap', 'pivotTreemap', true),
                        getMenuItem('sunburstChart', 'Sunburst&lrm;', 'sunburst', 'pivotSunburst', true),
                    ],
                },
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
                donut: 'pivotDonut',
                doughnut: 'pivotDonut',
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
            combinationGroup: {
                _key: 'pivotCombinationChart',
                columnLineCombo: 'pivotColumnLineCombo',
                areaColumnCombo: 'pivotAreaColumnCombo',
                customCombo: null, // Not currently supported
            },
            hierarchicalGroup: {
                _key: 'pivotHierarchicalChart',
                treemap: 'pivotTreemap',
                sunburst: 'pivotSunburst',
            },
            statisticalGroup: {
                _key: 'pivotStatisticalChart',
                histogram: 'pivotHistogram',
                // Some statistical charts do not currently support pivot mode
                rangeBar: null,
                rangeArea: null,
                boxPlot: null,
            },
            // Polar charts do not support pivot mode
            polarGroup: null,
            // Specialized charts do not currently support pivot mode
            specializedGroup: null,
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
        var getMenuItem = function (localeKey, defaultText, chartType, key, enterprise) {
            if (enterprise === void 0) { enterprise = false; }
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createChartFromCurrentRange(chartType); },
                _key: key,
                _enterprise: enterprise
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
                        getMenuItem('donut', 'Donut&lrm;', 'donut', 'rangeDonut')
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
                {
                    name: localeTextFunc('polarChart', 'Polar'),
                    subMenu: [
                        getMenuItem('radarLine', 'Radar Line&lrm;', 'radarLine', 'rangeRadarLine'),
                        getMenuItem('radarArea', 'Radar Area&lrm;', 'radarArea', 'rangeRadarArea'),
                        getMenuItem('nightingale', 'Nightingale&lrm;', 'nightingale', 'rangeNightingale'),
                        getMenuItem('radialColumn', 'Radial Column&lrm;', 'radialColumn', 'rangeRadialColumn'),
                        getMenuItem('radialBar', 'Radial Bar&lrm;', 'radialBar', 'rangeRadialBar'),
                    ],
                    _key: 'rangePolarChart',
                    _enterprise: true,
                },
                {
                    name: localeTextFunc('statisticalChart', 'Statistical'),
                    subMenu: [
                        getMenuItem('boxPlot', 'Box Plot&lrm;', 'boxPlot', 'rangeBoxPlot', true),
                        getMenuItem('histogramChart', 'Histogram&lrm;', 'histogram', 'rangeHistogram', false),
                        getMenuItem('rangeBar', 'Range Bar&lrm;', 'rangeBar', 'rangeRangeBar', true),
                        getMenuItem('rangeArea', 'Range Area&lrm;', 'rangeArea', 'rangeRangeArea', true),
                    ],
                    _key: 'rangeStatisticalChart',
                    _enterprise: false, // histogram chart is available in both community and enterprise distributions
                },
                {
                    name: localeTextFunc('hierarchicalChart', 'Hierarchical'),
                    subMenu: [
                        getMenuItem('treemap', 'Treemap&lrm;', 'treemap', 'rangeTreemap'),
                        getMenuItem('sunburst', 'Sunburst&lrm;', 'sunburst', 'rangeSunburst'),
                    ],
                    _key: 'rangeHierarchicalChart',
                    _enterprise: true,
                },
                {
                    name: localeTextFunc('specializedChart', 'Specialized'),
                    subMenu: [
                        getMenuItem('heatmap', 'Heatmap&lrm;', 'heatmap', 'rangeHeatmap'),
                        getMenuItem('waterfall', 'Waterfall&lrm;', 'waterfall', 'rangeWaterfall'),
                    ],
                    _key: 'rangeSpecializedChart',
                    _enterprise: true,
                },
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
                donut: 'rangeDonut',
                doughnut: 'rangeDonut',
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
            polarGroup: {
                _key: 'rangePolarChart',
                radarLine: 'rangeRadarLine',
                radarArea: 'rangeRadarArea',
                nightingale: 'rangeNightingale',
                radialColumn: 'rangeRadialColumn',
                radialBar: 'rangeRadialBar',
            },
            statisticalGroup: {
                _key: 'rangeStatisticalChart',
                boxPlot: 'rangeBoxPlot',
                histogram: 'rangeHistogram',
                rangeBar: 'rangeRangeBar',
                rangeArea: 'rangeRangeArea',
            },
            hierarchicalGroup: {
                _key: 'rangeHierarchicalChart',
                treemap: 'rangeTreemap',
                sunburst: 'rangeSunburst',
            },
            specializedGroup: {
                _key: 'rangeSpecializedChart',
                heatmap: 'rangeHeatmap',
                waterfall: 'rangeWaterfall',
            },
            combinationGroup: {
                _key: 'rangeCombinationChart',
                columnLineCombo: 'rangeColumnLineCombo',
                areaColumnCombo: 'rangeAreaColumnCombo',
                customCombo: null // Not currently supported
            }
        };
    };
    return RangeMenuItemMapper;
}());

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ColumnChooserFactory = /** @class */ (function (_super) {
    __extends$2(ColumnChooserFactory, _super);
    function ColumnChooserFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnChooserFactory.prototype.createColumnSelectPanel = function (parent, column, draggable, params) {
        var _a, _b;
        var columnSelectPanel = parent.createManagedBean(new columnToolPanel.PrimaryColsPanel());
        var columnChooserParams = (_b = (_a = params !== null && params !== void 0 ? params : column === null || column === void 0 ? void 0 : column.getColDef().columnChooserParams) !== null && _a !== void 0 ? _a : column === null || column === void 0 ? void 0 : column.getColDef().columnsMenuParams) !== null && _b !== void 0 ? _b : {};
        var contractColumnSelection = columnChooserParams.contractColumnSelection, suppressColumnExpandAll = columnChooserParams.suppressColumnExpandAll, suppressColumnFilter = columnChooserParams.suppressColumnFilter, suppressColumnSelectAll = columnChooserParams.suppressColumnSelectAll, suppressSyncLayoutWithGrid = columnChooserParams.suppressSyncLayoutWithGrid, columnLayout = columnChooserParams.columnLayout;
        columnSelectPanel.init(!!draggable, this.gridOptionsService.addGridCommonParams({
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
            onStateUpdated: function () { }
        }), 'columnMenu');
        if (columnLayout) {
            columnSelectPanel.setColumnLayout(columnLayout);
        }
        return columnSelectPanel;
    };
    ColumnChooserFactory.prototype.showColumnChooser = function (_a) {
        var _this = this;
        var column = _a.column, chooserParams = _a.chooserParams, eventSource = _a.eventSource;
        this.hideActiveColumnChooser();
        var columnSelectPanel = this.createColumnSelectPanel(this, column, true, chooserParams);
        var translate = this.localeService.getLocaleTextFunc();
        var columnIndex = this.columnModel.getAllDisplayedColumns().indexOf(column);
        var headerPosition = column ? this.focusService.getFocusedHeader() : null;
        this.activeColumnChooserDialog = this.createBean(new core.AgDialog({
            title: translate('chooseColumns', 'Choose Columns'),
            component: columnSelectPanel,
            width: 300,
            height: 300,
            resizable: true,
            movable: true,
            centered: true,
            closable: true,
            afterGuiAttached: function () {
                var _a;
                (_a = _this.focusService.findNextFocusableElement(columnSelectPanel.getGui())) === null || _a === void 0 ? void 0 : _a.focus();
                _this.dispatchVisibleChangedEvent(true, column);
            },
            closedCallback: function (event) {
                var eComp = _this.activeColumnChooser.getGui();
                _this.destroyBean(_this.activeColumnChooser);
                _this.activeColumnChooser = undefined;
                _this.activeColumnChooserDialog = undefined;
                _this.dispatchVisibleChangedEvent(false, column);
                if (column) {
                    _this.menuUtils.restoreFocusOnClose({ column: column, headerPosition: headerPosition, columnIndex: columnIndex, eventSource: eventSource }, eComp, event, true);
                }
            }
        }));
        this.activeColumnChooser = columnSelectPanel;
    };
    ColumnChooserFactory.prototype.hideActiveColumnChooser = function () {
        if (this.activeColumnChooserDialog) {
            this.destroyBean(this.activeColumnChooserDialog);
        }
    };
    ColumnChooserFactory.prototype.dispatchVisibleChangedEvent = function (visible, column) {
        var event = {
            type: core.Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
            visible: visible,
            switchingTab: false,
            key: 'columnChooser',
            column: column !== null && column !== void 0 ? column : null
        };
        this.eventService.dispatchEvent(event);
    };
    __decorate$2([
        core.Autowired('focusService')
    ], ColumnChooserFactory.prototype, "focusService", void 0);
    __decorate$2([
        core.Autowired('menuUtils')
    ], ColumnChooserFactory.prototype, "menuUtils", void 0);
    __decorate$2([
        core.Autowired('columnModel')
    ], ColumnChooserFactory.prototype, "columnModel", void 0);
    ColumnChooserFactory = __decorate$2([
        core.Bean('columnChooserFactory')
    ], ColumnChooserFactory);
    return ColumnChooserFactory;
}(core.BeanStub));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ColumnMenuFactory = /** @class */ (function (_super) {
    __extends$1(ColumnMenuFactory, _super);
    function ColumnMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColumnMenuFactory_1 = ColumnMenuFactory;
    ColumnMenuFactory.prototype.createMenu = function (parent, column, sourceElement) {
        var menuList = parent.createManagedBean(new core.AgMenuList(0, {
            column: column !== null && column !== void 0 ? column : null,
            node: null,
            value: null
        }));
        var menuItems = this.getMenuItems(column);
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, column !== null && column !== void 0 ? column : null, sourceElement);
        menuList.addMenuItems(menuItemsMapped);
        return menuList;
    };
    ColumnMenuFactory.prototype.getMenuItems = function (column) {
        var defaultItems = this.getDefaultMenuOptions(column);
        var result;
        var columnMainMenuItems = column === null || column === void 0 ? void 0 : column.getColDef().mainMenuItems;
        if (Array.isArray(columnMainMenuItems)) {
            result = columnMainMenuItems;
        }
        else if (typeof columnMainMenuItems === 'function') {
            result = columnMainMenuItems(this.gridOptionsService.addGridCommonParams({
                column: column,
                defaultItems: defaultItems
            }));
        }
        else {
            var userFunc = this.gridOptionsService.getCallback('getMainMenuItems');
            if (userFunc && column) {
                result = userFunc({
                    column: column,
                    defaultItems: defaultItems
                });
            }
            else {
                result = defaultItems;
            }
        }
        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        core._.removeRepeatsFromArray(result, ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        return result;
    };
    ColumnMenuFactory.prototype.getDefaultMenuOptions = function (column) {
        var result = [];
        var isLegacyMenuEnabled = this.menuService.isLegacyMenuEnabled();
        if (!column) {
            if (!isLegacyMenuEnabled) {
                result.push('columnChooser');
            }
            result.push('resetColumns');
            return result;
        }
        var allowPinning = !column.getColDef().lockPinned;
        var rowGroupCount = this.columnModel.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var allowValue = column.isAllowValue();
        var allowRowGroup = column.isAllowRowGroup();
        var isPrimary = column.isPrimary();
        var pivotModeOn = this.columnModel.isPivotMode();
        var isInMemoryRowModel = this.rowModel.getType() === 'clientSide';
        var usingTreeData = this.gridOptionsService.get('treeData');
        var allowValueAgg = 
        // if primary, then only allow aggValue if grouping and it's a value columns
        (isPrimary && doingGrouping && allowValue)
            // secondary columns can always have aggValue, as it means it's a pivot value column
            || !isPrimary;
        if (!isLegacyMenuEnabled && column.isSortable()) {
            var sort = column.getSort();
            if (sort !== 'asc') {
                result.push('sortAscending');
            }
            if (sort !== 'desc') {
                result.push('sortDescending');
            }
            if (sort) {
                result.push('sortUnSort');
            }
            result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        }
        if (this.menuService.isFilterMenuItemEnabled(column)) {
            result.push('columnFilter');
            result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        }
        if (allowPinning) {
            result.push('pinSubMenu');
        }
        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }
        if (allowPinning || allowValueAgg) {
            result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        }
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        var showRowGroup = column.getColDef().showRowGroup;
        if (showRowGroup) {
            result.push('rowUnGroup');
        }
        else if (allowRowGroup && column.isPrimary()) {
            if (column.isRowGroupActive()) {
                var groupLocked = this.columnModel.isColumnGroupingLocked(column);
                if (!groupLocked) {
                    result.push('rowUnGroup');
                }
            }
            else {
                result.push('rowGroup');
            }
        }
        result.push(ColumnMenuFactory_1.MENU_ITEM_SEPARATOR);
        if (!isLegacyMenuEnabled) {
            result.push('columnChooser');
        }
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
    var ColumnMenuFactory_1;
    ColumnMenuFactory.MENU_ITEM_SEPARATOR = 'separator';
    __decorate$1([
        core.Autowired('menuItemMapper')
    ], ColumnMenuFactory.prototype, "menuItemMapper", void 0);
    __decorate$1([
        core.Autowired('columnModel')
    ], ColumnMenuFactory.prototype, "columnModel", void 0);
    __decorate$1([
        core.Autowired('rowModel')
    ], ColumnMenuFactory.prototype, "rowModel", void 0);
    __decorate$1([
        core.Autowired('filterManager')
    ], ColumnMenuFactory.prototype, "filterManager", void 0);
    __decorate$1([
        core.Autowired('menuService')
    ], ColumnMenuFactory.prototype, "menuService", void 0);
    ColumnMenuFactory = ColumnMenuFactory_1 = __decorate$1([
        core.Bean('columnMenuFactory')
    ], ColumnMenuFactory);
    return ColumnMenuFactory;
}(core.BeanStub));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MenuUtils = /** @class */ (function (_super) {
    __extends(MenuUtils, _super);
    function MenuUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuUtils.prototype.restoreFocusOnClose = function (restoreFocusParams, eComp, e, restoreIfMouseEvent) {
        var eventSource = restoreFocusParams.eventSource;
        var isKeyboardEvent = e instanceof KeyboardEvent;
        if ((!restoreIfMouseEvent && !isKeyboardEvent) || !eventSource) {
            return;
        }
        var eDocument = this.gridOptionsService.getDocument();
        if (!eComp.contains(eDocument.activeElement) && eDocument.activeElement !== eDocument.body) {
            // something else has focus, so don't return focus to the header
            return;
        }
        this.focusHeaderCell(restoreFocusParams);
    };
    MenuUtils.prototype.closePopupAndRestoreFocusOnSelect = function (hidePopupFunc, restoreFocusParams, event) {
        var keyboardEvent;
        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }
        hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });
        // this method only gets called when the menu was closed by selecting an option
        // in this case we focus the cell that was previously focused, otherwise the header
        var focusedCell = this.focusService.getFocusedCell();
        var eDocument = this.gridOptionsService.getDocument();
        if (eDocument.activeElement === eDocument.body) {
            if (focusedCell) {
                var rowIndex = focusedCell.rowIndex, rowPinned = focusedCell.rowPinned, column = focusedCell.column;
                this.focusService.setFocusedCell({ rowIndex: rowIndex, column: column, rowPinned: rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
            }
            else {
                this.focusHeaderCell(restoreFocusParams);
            }
        }
    };
    MenuUtils.prototype.onContextMenu = function (mouseEvent, touchEvent, showMenuCallback) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsService.get('allowContextMenuWithControlKey')) {
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
        if (this.gridOptionsService.get('suppressContextMenu')) {
            return;
        }
        var eventOrTouch = mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : touchEvent.touches[0];
        if (showMenuCallback(eventOrTouch)) {
            var event_1 = mouseEvent !== null && mouseEvent !== void 0 ? mouseEvent : touchEvent;
            event_1.preventDefault();
        }
    };
    MenuUtils.prototype.focusHeaderCell = function (restoreFocusParams) {
        var column = restoreFocusParams.column, columnIndex = restoreFocusParams.columnIndex, headerPosition = restoreFocusParams.headerPosition, eventSource = restoreFocusParams.eventSource;
        var isColumnStillVisible = this.columnModel.getAllDisplayedColumns().some(function (col) { return col === column; });
        if (isColumnStillVisible && eventSource && core._.isVisible(eventSource)) {
            var focusableEl = this.focusService.findTabbableParent(eventSource);
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
            var allColumns = this.columnModel.getAllDisplayedColumns();
            var columnToFocus = allColumns[columnIndex] || core._.last(allColumns);
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
    MenuUtils.prototype.blockMiddleClickScrollsIfNeeded = function (mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        var gridOptionsService = this.gridOptionsService;
        var which = mouseEvent.which;
        if (gridOptionsService.get('suppressMiddleClickScrolls') && which === 2) {
            mouseEvent.preventDefault();
        }
    };
    __decorate([
        core.Autowired('focusService')
    ], MenuUtils.prototype, "focusService", void 0);
    __decorate([
        core.Autowired('headerNavigationService')
    ], MenuUtils.prototype, "headerNavigationService", void 0);
    __decorate([
        core.Autowired('columnModel')
    ], MenuUtils.prototype, "columnModel", void 0);
    MenuUtils = __decorate([
        core.Bean('menuUtils')
    ], MenuUtils);
    return MenuUtils;
}(core.BeanStub));

var MenuModule = {
    version: VERSION,
    moduleName: core.ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper, ChartMenuItemMapper, ColumnChooserFactory, ColumnMenuFactory, MenuUtils],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.MenuModule = MenuModule;
