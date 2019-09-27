// ag-grid-enterprise v21.2.2
"use strict";
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var menuItemComponent_1 = require("./menuItemComponent");
var menuList_1 = require("./menuList");
var menuItemMapper_1 = require("./menuItemMapper");
var rangeController_1 = require("../rangeController");
var ContextMenuFactory = /** @class */ (function () {
    function ContextMenuFactory() {
    }
    ContextMenuFactory.prototype.init = function () {
    };
    ContextMenuFactory.prototype.hideActiveMenu = function () {
        if (!this.activeMenu) {
            return;
        }
        this.activeMenu.destroy();
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions = [];
        if (ag_grid_community_1._.exists(node)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'paste', 'separator');
            }
        }
        else {
            // if user clicks outside of a cell (eg below the rows, or not rows present)
            // nothing to show, perhaps tool panels???
        }
        if (this.gridOptionsWrapper.isEnableCharts() && this.context.isModuleRegistered("chartsModule" /* ChartsModule */)) {
            if (this.columnController.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            // else {
            //     defaultMenuOptions.push('pivotChartAndPivotMode');
            // }
            if (!this.rangeController.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (ag_grid_community_1._.exists(node)) {
            // if user clicks a cell
            var suppressExcel = this.gridOptionsWrapper.isSuppressExcelExport();
            var suppressCsv = this.gridOptionsWrapper.isSuppressCsvExport();
            var onIPad = ag_grid_community_1._.isUserAgentIPad();
            var anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }
        if (this.gridOptionsWrapper.getContextMenuItemsFunc()) {
            var userFunc = this.gridOptionsWrapper.getContextMenuItemsFunc();
            var params = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions.length ? defaultMenuOptions : undefined,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            return userFunc ? userFunc(params) : undefined;
        }
        return defaultMenuOptions;
    };
    ContextMenuFactory.prototype.showMenu = function (node, column, value, mouseEvent) {
        var _this = this;
        var menuItems = this.getMenuItems(node, column, value);
        if (menuItems === undefined || ag_grid_community_1._.missingOrEmpty(menuItems)) {
            return;
        }
        var menu = new ContextMenu(menuItems);
        this.context.wireBean(menu);
        var eMenuGui = menu.getGui();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenuGui, true, function () { return menu.destroy(); }, mouseEvent);
        this.popupService.positionPopupUnderMouseEvent({
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui
        });
        menu.afterGuiAttached({
            hidePopup: hidePopup
        });
        this.activeMenu = menu;
        menu.addEventListener(ag_grid_community_1.BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    __decorate([
        ag_grid_community_1.Autowired('context'),
        __metadata("design:type", ag_grid_community_1.Context)
    ], ContextMenuFactory.prototype, "context", void 0);
    __decorate([
        ag_grid_community_1.Autowired('popupService'),
        __metadata("design:type", ag_grid_community_1.PopupService)
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_community_1.GridOptionsWrapper)
    ], ContextMenuFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ContextMenuFactory.prototype, "rowModel", void 0);
    __decorate([
        ag_grid_community_1.Autowired('rangeController'),
        __metadata("design:type", rangeController_1.RangeController)
    ], ContextMenuFactory.prototype, "rangeController", void 0);
    __decorate([
        ag_grid_community_1.Autowired('columnController'),
        __metadata("design:type", ag_grid_community_1.ColumnController)
    ], ContextMenuFactory.prototype, "columnController", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ContextMenuFactory.prototype, "init", null);
    ContextMenuFactory = __decorate([
        ag_grid_community_1.Bean('contextMenuFactory')
    ], ContextMenuFactory);
    return ContextMenuFactory;
}());
exports.ContextMenuFactory = ContextMenuFactory;
var ContextMenu = /** @class */ (function (_super) {
    __extends(ContextMenu, _super);
    function ContextMenu(menuItems) {
        var _this = _super.call(this, '<div class="ag-menu"></div>') || this;
        _this.menuItems = menuItems;
        return _this;
    }
    ContextMenu.prototype.addMenuItems = function () {
        var menuList = new menuList_1.MenuList();
        this.getContext().wireBean(menuList);
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        menuList.addEventListener(menuItemComponent_1.MenuItemComponent.EVENT_ITEM_SELECTED, this.destroy.bind(this));
    };
    ContextMenu.prototype.afterGuiAttached = function (params) {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }
        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        this.addDestroyableEventListener(this.eventService, 'bodyScroll', this.destroy.bind(this));
    };
    __decorate([
        ag_grid_community_1.Autowired('eventService'),
        __metadata("design:type", ag_grid_community_1.EventService)
    ], ContextMenu.prototype, "eventService", void 0);
    __decorate([
        ag_grid_community_1.Autowired('menuItemMapper'),
        __metadata("design:type", menuItemMapper_1.MenuItemMapper)
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        ag_grid_community_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
}(ag_grid_community_1.Component));
