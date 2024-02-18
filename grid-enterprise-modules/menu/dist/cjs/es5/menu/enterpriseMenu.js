"use strict";
var __extends = (this && this.__extends) || (function () {
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseMenuFactory = void 0;
var core_1 = require("@ag-grid-community/core");
var EnterpriseMenuFactory = /** @class */ (function (_super) {
    __extends(EnterpriseMenuFactory, _super);
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
        var addPopupRes = this.popupService.addPopup({
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
        menu.addEventListener(core_1.BeanStub.EVENT_DESTROYED, function () {
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
            type: core_1.Events.EVENT_COLUMN_MENU_VISIBLE_CHANGED,
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
    __decorate([
        (0, core_1.Autowired)('popupService')
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate([
        (0, core_1.Autowired)('focusService')
    ], EnterpriseMenuFactory.prototype, "focusService", void 0);
    __decorate([
        (0, core_1.Autowired)('ctrlsService')
    ], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
    __decorate([
        (0, core_1.Autowired)('columnModel')
    ], EnterpriseMenuFactory.prototype, "columnModel", void 0);
    __decorate([
        (0, core_1.Autowired)('filterManager')
    ], EnterpriseMenuFactory.prototype, "filterManager", void 0);
    __decorate([
        (0, core_1.Autowired)('menuUtils')
    ], EnterpriseMenuFactory.prototype, "menuUtils", void 0);
    __decorate([
        (0, core_1.Autowired)('menuService')
    ], EnterpriseMenuFactory.prototype, "menuService", void 0);
    EnterpriseMenuFactory = __decorate([
        (0, core_1.Bean)('enterpriseMenuFactory')
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
}(core_1.BeanStub));
exports.EnterpriseMenuFactory = EnterpriseMenuFactory;
var TabbedColumnMenu = /** @class */ (function (_super) {
    __extends(TabbedColumnMenu, _super);
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
            return core_1.ModuleRegistry.__isRegistered(core_1.ModuleNames.ColumnsToolPanelModule, this.context.getGridId());
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
        this.mainMenuList.addEventListener(core_1.AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: core_1._.createIconNoSpan('menu', this.gridOptionsService, this.column),
            titleLabel: TabbedColumnMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: core_1.AgPromise.resolve(this.mainMenuList.getGui()),
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
            title: core_1._.createIconNoSpan('filter', this.gridOptionsService, this.column),
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
            title: core_1._.createIconNoSpan('columns', this.gridOptionsService, this.column),
            titleLabel: TabbedColumnMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: core_1.AgPromise.resolve(eWrapperDiv),
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
    __decorate([
        (0, core_1.Autowired)('filterManager')
    ], TabbedColumnMenu.prototype, "filterManager", void 0);
    __decorate([
        (0, core_1.Autowired)('columnChooserFactory')
    ], TabbedColumnMenu.prototype, "columnChooserFactory", void 0);
    __decorate([
        (0, core_1.Autowired)('columnMenuFactory')
    ], TabbedColumnMenu.prototype, "columnMenuFactory", void 0);
    __decorate([
        (0, core_1.Autowired)('menuUtils')
    ], TabbedColumnMenu.prototype, "menuUtils", void 0);
    __decorate([
        core_1.PostConstruct
    ], TabbedColumnMenu.prototype, "init", null);
    return TabbedColumnMenu;
}(core_1.BeanStub));
var ColumnContextMenu = /** @class */ (function (_super) {
    __extends(ColumnContextMenu, _super);
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
        this.mainMenuList.addEventListener(core_1.AgMenuItemComponent.EVENT_CLOSE_MENU, this.onHidePopup.bind(this));
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
    __decorate([
        (0, core_1.Autowired)('columnMenuFactory')
    ], ColumnContextMenu.prototype, "columnMenuFactory", void 0);
    __decorate([
        (0, core_1.Autowired)('menuUtils')
    ], ColumnContextMenu.prototype, "menuUtils", void 0);
    __decorate([
        (0, core_1.Autowired)('focusService')
    ], ColumnContextMenu.prototype, "focusService", void 0);
    __decorate([
        (0, core_1.RefSelector)('eColumnMenu')
    ], ColumnContextMenu.prototype, "eColumnMenu", void 0);
    __decorate([
        core_1.PostConstruct
    ], ColumnContextMenu.prototype, "init", null);
    return ColumnContextMenu;
}(core_1.Component));
