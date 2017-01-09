// ag-grid-enterprise v7.1.0
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ag_grid_1 = require("ag-grid");
var clipboardService_1 = require("../clipboardService");
var menuItemComponent_1 = require("./menuItemComponent");
var menuList_1 = require("./menuList");
var menuItemMapper_1 = require("./menuItemMapper");
var ContextMenuFactory = (function () {
    function ContextMenuFactory() {
    }
    ContextMenuFactory.prototype.init = function () {
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions;
        if (ag_grid_1.Utils.exists(node)) {
            // if user clicks a cell
            defaultMenuOptions = ['copy', 'copyWithHeaders', 'paste', 'separator', 'toolPanel'];
        }
        else {
            // if user clicks outside of a cell (eg below the rows, or not rows present)
            defaultMenuOptions = ['toolPanel'];
        }
        if (this.gridOptionsWrapper.getContextMenuItemsFunc()) {
            var userFunc = this.gridOptionsWrapper.getContextMenuItemsFunc();
            var params = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            var menuItemsFromUser = userFunc(params);
            return menuItemsFromUser;
        }
        else {
            return defaultMenuOptions;
        }
    };
    ContextMenuFactory.prototype.showMenu = function (node, column, value, mouseEvent) {
        var menuItems = this.getMenuItems(node, column, value);
        if (ag_grid_1.Utils.missingOrEmpty(menuItems)) {
            return;
        }
        var menu = new ContextMenu(menuItems);
        this.context.wireBean(menu);
        var eMenuGui = menu.getGui();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenuGui, true, function () { return menu.destroy(); });
        this.popupService.positionPopupUnderMouseEvent({
            mouseEvent: mouseEvent,
            ePopup: eMenuGui
        });
        menu.afterGuiAttached(hidePopup);
    };
    __decorate([
        ag_grid_1.Autowired('context'), 
        __metadata('design:type', (typeof (_a = typeof ag_grid_1.Context !== 'undefined' && ag_grid_1.Context) === 'function' && _a) || Object)
    ], ContextMenuFactory.prototype, "context", void 0);
    __decorate([
        ag_grid_1.Autowired('popupService'), 
        __metadata('design:type', (typeof (_b = typeof ag_grid_1.PopupService !== 'undefined' && ag_grid_1.PopupService) === 'function' && _b) || Object)
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', (typeof (_c = typeof ag_grid_1.GridOptionsWrapper !== 'undefined' && ag_grid_1.GridOptionsWrapper) === 'function' && _c) || Object)
    ], ContextMenuFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ContextMenuFactory.prototype, "init", null);
    ContextMenuFactory = __decorate([
        ag_grid_1.Bean('contextMenuFactory'), 
        __metadata('design:paramtypes', [])
    ], ContextMenuFactory);
    return ContextMenuFactory;
    var _a, _b, _c;
}());
exports.ContextMenuFactory = ContextMenuFactory;
var ContextMenu = (function (_super) {
    __extends(ContextMenu, _super);
    function ContextMenu(menuItems) {
        _super.call(this, '<div class="ag-menu"></div>');
        this.menuItems = menuItems;
    }
    ContextMenu.prototype.addMenuItems = function () {
        var menuList = new menuList_1.MenuList();
        this.context.wireBean(menuList);
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        menuList.addEventListener(menuItemComponent_1.MenuItemComponent.EVENT_ITEM_SELECTED, this.destroy.bind(this));
    };
    ContextMenu.prototype.afterGuiAttached = function (hidePopup) {
        this.addDestroyFunc(hidePopup);
        // if the body scrolls, we want to hide the menu, as the menu will not appear in the right location anymore
        this.addDestroyableEventListener(this.eventService, 'bodyScroll', this.destroy.bind(this));
    };
    __decorate([
        ag_grid_1.Autowired('context'), 
        __metadata('design:type', (typeof (_a = typeof ag_grid_1.Context !== 'undefined' && ag_grid_1.Context) === 'function' && _a) || Object)
    ], ContextMenu.prototype, "context", void 0);
    __decorate([
        ag_grid_1.Autowired('clipboardService'), 
        __metadata('design:type', clipboardService_1.ClipboardService)
    ], ContextMenu.prototype, "clipboardService", void 0);
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', (typeof (_b = typeof ag_grid_1.GridOptionsWrapper !== 'undefined' && ag_grid_1.GridOptionsWrapper) === 'function' && _b) || Object)
    ], ContextMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_1.Autowired('gridApi'), 
        __metadata('design:type', (typeof (_c = typeof ag_grid_1.GridApi !== 'undefined' && ag_grid_1.GridApi) === 'function' && _c) || Object)
    ], ContextMenu.prototype, "gridApi", void 0);
    __decorate([
        ag_grid_1.Autowired('eventService'), 
        __metadata('design:type', (typeof (_d = typeof ag_grid_1.EventService !== 'undefined' && ag_grid_1.EventService) === 'function' && _d) || Object)
    ], ContextMenu.prototype, "eventService", void 0);
    __decorate([
        ag_grid_1.Autowired('menuItemMapper'), 
        __metadata('design:type', menuItemMapper_1.MenuItemMapper)
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        ag_grid_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
    var _a, _b, _c, _d;
}(ag_grid_1.Component));
