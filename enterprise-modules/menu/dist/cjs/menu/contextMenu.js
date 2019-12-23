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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var menuItemComponent_1 = require("./menuItemComponent");
var menuList_1 = require("./menuList");
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
        if (core_1._.exists(node) && core_1.ModuleRegistry.isRegistered(core_1.ModuleNames.ClipboardModule)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'paste', 'separator');
            }
        }
        else {
            // if user clicks outside of a cell (eg below the rows, or not rows present)
            // nothing to show, perhaps tool panels???
        }
        if (this.gridOptionsWrapper.isEnableCharts() &&
            core_1.ModuleRegistry.isRegistered(core_1.ModuleNames.RangeSelectionModule) &&
            core_1.ModuleRegistry.isRegistered(core_1.ModuleNames.GridChartsModule)) {
            if (this.columnController.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeController && !this.rangeController.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (core_1._.exists(node)) {
            // if user clicks a cell
            var csvModuleMissing = !core_1.ModuleRegistry.isRegistered(core_1.ModuleNames.CsvExportModule);
            var excelModuleMissing = !core_1.ModuleRegistry.isRegistered(core_1.ModuleNames.ExcelExportModule);
            var suppressExcel = this.gridOptionsWrapper.isSuppressExcelExport() || excelModuleMissing;
            var suppressCsv = this.gridOptionsWrapper.isSuppressCsvExport() || csvModuleMissing;
            var onIPad = core_1._.isIOSUserAgent();
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
        if (menuItems === undefined || core_1._.missingOrEmpty(menuItems)) {
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
        menu.addEventListener(core_1.BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    __decorate([
        core_1.Autowired('context')
    ], ContextMenuFactory.prototype, "context", void 0);
    __decorate([
        core_1.Autowired('popupService')
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], ContextMenuFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('rowModel')
    ], ContextMenuFactory.prototype, "rowModel", void 0);
    __decorate([
        core_1.Optional('rangeController')
    ], ContextMenuFactory.prototype, "rangeController", void 0);
    __decorate([
        core_1.Autowired('columnController')
    ], ContextMenuFactory.prototype, "columnController", void 0);
    __decorate([
        core_1.PostConstruct
    ], ContextMenuFactory.prototype, "init", null);
    ContextMenuFactory = __decorate([
        core_1.Bean('contextMenuFactory')
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
        core_1.Autowired('eventService')
    ], ContextMenu.prototype, "eventService", void 0);
    __decorate([
        core_1.Autowired('menuItemMapper')
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        core_1.PostConstruct
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
}(core_1.Component));
//# sourceMappingURL=contextMenu.js.map