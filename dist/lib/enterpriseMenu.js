// ag-grid-enterprise v4.0.7
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var main_4 = require("ag-grid/main");
var main_5 = require("ag-grid/main");
var main_6 = require("ag-grid/main");
var main_7 = require("ag-grid/main");
var main_8 = require("ag-grid/main");
var main_9 = require("ag-grid/main");
var main_10 = require("ag-grid/main");
var main_11 = require("ag-grid/main");
var main_12 = require("ag-grid/main");
var main_13 = require("ag-grid/main");
var columnSelectPanel_1 = require("./columnSelect/columnSelectPanel");
var main_14 = require("ag-grid/main");
var main_15 = require("ag-grid/main");
var main_16 = require("ag-grid/main");
var svgFactory = main_2.SvgFactory.getInstance();
var EnterpriseMenuFactory = (function () {
    function EnterpriseMenuFactory() {
    }
    EnterpriseMenuFactory.prototype.showMenu = function (column, eventSource) {
        var _this = this;
        var menu = new EnterpriseMenu(column, this.lastSelectedTab);
        this.context.wireBean(menu);
        var eMenuGui = menu.getGui();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenuGui, true, function () { return menu.destroy(); });
        this.popupService.positionPopupUnderComponent({ eventSource: eventSource,
            ePopup: eMenuGui,
            nudgeX: -9,
            nudgeY: -26,
            minWidth: menu.getMinWidth(),
            keepWithinBounds: true
        });
        menu.afterGuiAttached({
            hidePopup: hidePopup,
            eventSource: eventSource
        });
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, function (event) {
            _this.lastSelectedTab = event.key;
        });
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        var showColumnPanel = !this.gridOptionsWrapper.isSuppressMenuColumnPanel();
        var showMainPanel = !this.gridOptionsWrapper.isSuppressMenuMainPanel();
        var showFilterPanel = !this.gridOptionsWrapper.isSuppressMenuFilterPanel();
        return showColumnPanel || showMainPanel || showFilterPanel;
    };
    __decorate([
        main_4.Autowired('context'), 
        __metadata('design:type', main_5.Context)
    ], EnterpriseMenuFactory.prototype, "context", void 0);
    __decorate([
        main_4.Autowired('popupService'), 
        __metadata('design:type', main_6.PopupService)
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate([
        main_4.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_7.GridOptionsWrapper)
    ], EnterpriseMenuFactory.prototype, "gridOptionsWrapper", void 0);
    EnterpriseMenuFactory = __decorate([
        main_3.Bean('menuFactory'), 
        __metadata('design:paramtypes', [])
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
})();
exports.EnterpriseMenuFactory = EnterpriseMenuFactory;
var EnterpriseMenu = (function () {
    function EnterpriseMenu(column, initialSelection) {
        this.eventService = new main_14.EventService();
        this.column = column;
        this.initialSelection = initialSelection;
    }
    EnterpriseMenu.prototype.addEventListener = function (event, listener) {
        this.eventService.addEventListener(event, listener);
    };
    EnterpriseMenu.prototype.getMinWidth = function () {
        return this.tabbedLayout.getMinWidth();
    };
    EnterpriseMenu.prototype.init = function () {
        var tabItems = [];
        if (!this.gridOptionsWrapper.isSuppressMenuMainPanel()) {
            this.createMainPanel();
            tabItems.push(this.tabItemGeneral);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuFilterPanel()) {
            this.createFilterPanel();
            tabItems.push(this.tabItemFilter);
        }
        if (!this.gridOptionsWrapper.isSuppressMenuColumnPanel()) {
            this.createColumnsPanel();
            tabItems.push(this.tabItemColumns);
        }
        this.tabbedLayout = new main_12.TabbedLayout({
            items: tabItems,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
    };
    EnterpriseMenu.prototype.showTabBasedOnPreviousSelection = function () {
        // show the tab the user was on last time they had a menu open
        if (this.tabItemColumns && this.initialSelection === EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter && this.initialSelection === EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && this.initialSelection === EnterpriseMenu.TAB_GENERAL) {
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
            this.eventService.dispatchEvent(EnterpriseMenu.EVENT_TAB_SELECTED, { key: key });
        }
    };
    EnterpriseMenu.prototype.destroy = function () {
        if (this.columnSelectPanel) {
            this.columnSelectPanel.destroy();
        }
        if (this.mainMenuList) {
            this.mainMenuList.destroy();
        }
    };
    EnterpriseMenu.prototype.createPinnedSubMenu = function () {
        var _this = this;
        var cMenuList = new main_13.MenuList();
        this.context.wireBean(cMenuList);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        cMenuList.addItem({
            name: localeTextFunc('pinLeft', 'Pin Left'),
            action: function () { return _this.columnController.setColumnPinned(_this.column, main_8.Column.PINNED_LEFT); },
            checked: this.column.isPinnedLeft()
        });
        cMenuList.addItem({
            name: localeTextFunc('pinRight', 'Pin Right'),
            action: function () { return _this.columnController.setColumnPinned(_this.column, main_8.Column.PINNED_RIGHT); },
            checked: this.column.isPinnedRight()
        });
        cMenuList.addItem({
            name: localeTextFunc('noPin', 'No Pin'),
            action: function () { return _this.columnController.setColumnPinned(_this.column, null); },
            checked: !this.column.isPinned()
        });
        return cMenuList;
    };
    EnterpriseMenu.prototype.createAggregationSubMenu = function () {
        var _this = this;
        var cMenuList = new main_13.MenuList();
        this.context.wireBean(cMenuList);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnIsAlreadyAggValue = this.columnController.getValueColumns().indexOf(this.column) >= 0;
        cMenuList.addItem({
            name: localeTextFunc('sum', 'Sum'),
            action: function () {
                _this.columnController.setColumnAggFunction(_this.column, main_8.Column.AGG_SUM);
                _this.columnController.addValueColumn(_this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === main_8.Column.AGG_SUM
        });
        cMenuList.addItem({
            name: localeTextFunc('min', 'Min'),
            action: function () {
                _this.columnController.setColumnAggFunction(_this.column, main_8.Column.AGG_MIN);
                _this.columnController.addValueColumn(_this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === main_8.Column.AGG_MIN
        });
        cMenuList.addItem({
            name: localeTextFunc('max', 'Max'),
            action: function () {
                _this.columnController.setColumnAggFunction(_this.column, main_8.Column.AGG_MAX);
                _this.columnController.addValueColumn(_this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === main_8.Column.AGG_MAX
        });
        cMenuList.addItem({
            name: localeTextFunc('first', 'First'),
            action: function () {
                _this.columnController.setColumnAggFunction(_this.column, main_8.Column.AGG_FIRST);
                _this.columnController.addValueColumn(_this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === main_8.Column.AGG_FIRST
        });
        cMenuList.addItem({
            name: localeTextFunc('last', 'Last'),
            action: function () {
                _this.columnController.setColumnAggFunction(_this.column, main_8.Column.AGG_LAST);
                _this.columnController.addValueColumn(_this.column);
            },
            checked: columnIsAlreadyAggValue && this.column.getAggFunc() === main_8.Column.AGG_LAST
        });
        cMenuList.addItem({
            name: localeTextFunc('none', 'None'),
            action: function () {
                _this.column.setAggFunc(null);
                _this.columnController.removeValueColumn(_this.column);
            },
            checked: !columnIsAlreadyAggValue
        });
        return cMenuList;
    };
    EnterpriseMenu.prototype.createBuiltInMenuOptions = function () {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var builtInMenuOptions = {
            pinSubMenu: {
                name: localeTextFunc('pinColumn', 'Pin Column'),
                icon: svgFactory.createPinIcon(),
                childMenu: this.createPinnedSubMenu()
            },
            valueAggSubMenu: {
                name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                icon: svgFactory.createAggregationIcon(),
                childMenu: this.createAggregationSubMenu()
            },
            autoSizeThis: {
                name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                action: function () { return _this.columnController.autoSizeColumn(_this.column); }
            },
            autoSizeAll: {
                name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                action: function () { return _this.columnController.autoSizeAllColumns(); }
            },
            rowGroup: {
                name: localeTextFunc('groupBy', 'Group by') + ' ' + this.column.getColDef().headerName,
                action: function () { return _this.columnController.addRowGroupColumn(_this.column); },
                icon: svgFactory.createGroupIcon12()
            },
            rowUnGroup: {
                name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + this.column.getColDef().headerName,
                action: function () { return _this.columnController.removeRowGroupColumn(_this.column); },
                icon: svgFactory.createGroupIcon12()
            },
            resetColumns: {
                name: localeTextFunc('resetColumns', 'Reset Columns'),
                action: function () { return _this.columnController.resetColumnState(); }
            },
            expandAll: {
                name: localeTextFunc('expandAll', 'Expand All'),
                action: function () { return _this.gridApi.expandAll(); }
            },
            contractAll: {
                name: localeTextFunc('collapseAll', 'Collapse All'),
                action: function () { return _this.gridApi.collapseAll(); }
            },
            toolPanel: {
                name: localeTextFunc('toolPanel', 'Tool Panel'),
                checked: this.gridApi.isToolPanelShowing(),
                action: function () { return _this.gridApi.showToolPanel(!_this.gridApi.isToolPanelShowing()); }
            }
        };
        return builtInMenuOptions;
    };
    EnterpriseMenu.prototype.getMenuItems = function () {
        var defaultMenuOptions = this.getDefaultMenuOptions();
        var userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();
        if (userFunc) {
            var userOptions = userFunc({
                column: this.column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                defaultItems: defaultMenuOptions
            });
            return userOptions;
        }
        else {
            return defaultMenuOptions;
        }
    };
    EnterpriseMenu.prototype.getDefaultMenuOptions = function () {
        var result = [];
        var doingGrouping = this.columnController.getRowGroupColumns().length > 0;
        var groupedByThisColumn = this.columnController.getRowGroupColumns().indexOf(this.column) >= 0;
        result.push('separator');
        result.push('pinSubMenu');
        if (doingGrouping && !this.column.getColDef().suppressAggregation) {
            result.push('valueAggSubMenu');
        }
        result.push('separator');
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push('separator');
        if (!this.column.getColDef().suppressRowGroup) {
            if (groupedByThisColumn) {
                result.push('rowUnGroup');
            }
            else {
                result.push('rowGroup');
            }
        }
        result.push('separator');
        result.push('resetColumns');
        result.push('toolPanel');
        // only add grouping expand/collapse if grouping
        if (doingGrouping) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    EnterpriseMenu.prototype.createMainPanel = function () {
        this.mainMenuList = new main_13.MenuList();
        this.context.wireBean(this.mainMenuList);
        var menuItems = this.getMenuItems();
        var builtInOptions = this.createBuiltInMenuOptions();
        this.mainMenuList.addMenuItems(menuItems, builtInOptions);
        this.mainMenuList.addEventListener(main_16.CMenuItem.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: svgFactory.createMenuSvg(),
            body: this.mainMenuList.getGui()
        };
    };
    EnterpriseMenu.prototype.onHidePopup = function () {
        this.hidePopupFunc();
    };
    EnterpriseMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column);
        var afterFilterAttachedCallback;
        if (filterWrapper.filter.afterGuiAttached) {
            afterFilterAttachedCallback = filterWrapper.filter.afterGuiAttached.bind(filterWrapper.filter);
        }
        this.tabItemFilter = {
            title: svgFactory.createFilterSvg12(),
            body: filterWrapper.gui,
            afterAttachedCallback: afterFilterAttachedCallback
        };
    };
    EnterpriseMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        main_1.Utils.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');
        this.columnSelectPanel = new columnSelectPanel_1.ColumnSelectPanel(false);
        this.context.wireBean(this.columnSelectPanel);
        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());
        this.tabItemColumns = {
            title: svgFactory.createColumnsSvg12(),
            body: eWrapperDiv
        };
    };
    EnterpriseMenu.prototype.afterGuiAttached = function (params) {
        this.tabbedLayout.setAfterAttachedParams({ hidePopup: params.hidePopup });
        this.showTabBasedOnPreviousSelection();
        this.hidePopupFunc = params.hidePopup;
    };
    EnterpriseMenu.prototype.getGui = function () {
        return this.tabbedLayout.getGui();
    };
    EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
    EnterpriseMenu.TAB_FILTER = 'filter';
    EnterpriseMenu.TAB_GENERAL = 'general';
    EnterpriseMenu.TAB_COLUMNS = 'columns';
    __decorate([
        main_4.Autowired('columnController'), 
        __metadata('design:type', main_9.ColumnController)
    ], EnterpriseMenu.prototype, "columnController", void 0);
    __decorate([
        main_4.Autowired('filterManager'), 
        __metadata('design:type', main_10.FilterManager)
    ], EnterpriseMenu.prototype, "filterManager", void 0);
    __decorate([
        main_4.Autowired('context'), 
        __metadata('design:type', main_5.Context)
    ], EnterpriseMenu.prototype, "context", void 0);
    __decorate([
        main_4.Autowired('gridApi'), 
        __metadata('design:type', main_11.GridApi)
    ], EnterpriseMenu.prototype, "gridApi", void 0);
    __decorate([
        main_4.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_7.GridOptionsWrapper)
    ], EnterpriseMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_15.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], EnterpriseMenu.prototype, "init", null);
    return EnterpriseMenu;
})();
exports.EnterpriseMenu = EnterpriseMenu;
