// ag-grid-enterprise v4.1.4
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
var main_1 = require("ag-grid/main");
var clipboardService_1 = require("./clipboardService");
var svgFactory = main_1.SvgFactory.getInstance();
var ContextMenuFactory = (function () {
    function ContextMenuFactory() {
    }
    ContextMenuFactory.prototype.init = function () {
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions = ['copy', 'paste', 'separator', 'toolPanel'];
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
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], ContextMenuFactory.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('popupService'), 
        __metadata('design:type', main_1.PopupService)
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], ContextMenuFactory.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ContextMenuFactory.prototype, "init", null);
    ContextMenuFactory = __decorate([
        main_1.Bean('contextMenuFactory'), 
        __metadata('design:paramtypes', [])
    ], ContextMenuFactory);
    return ContextMenuFactory;
})();
exports.ContextMenuFactory = ContextMenuFactory;
var ContextMenu = (function (_super) {
    __extends(ContextMenu, _super);
    function ContextMenu(menuItems) {
        _super.call(this, '<div class="ag-menu"></div>');
        this.menuItems = menuItems;
    }
    ContextMenu.prototype.createDefaultMenuItems = function () {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var result = {
            copy: {
                name: localeTextFunc('copy', 'Copy'),
                shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                icon: svgFactory.createCopyIcon(),
                action: function () { return _this.clipboardService.copyToClipboard(); }
            },
            paste: {
                name: localeTextFunc('paste', 'Paste'),
                shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                disabled: true,
                icon: svgFactory.createPasteIcon(),
                action: function () { return _this.clipboardService.pasteFromClipboard(); }
            },
            toolPanel: {
                name: localeTextFunc('toolPanel', 'Tool Panel'),
                checked: this.gridApi.isToolPanelShowing(),
                action: function () { return _this.gridApi.showToolPanel(!_this.gridApi.isToolPanelShowing()); }
            }
        };
        return result;
    };
    ContextMenu.prototype.addMenuItems = function () {
        this.menuList = new main_1.MenuList();
        this.context.wireBean(this.menuList);
        var defaultMenuItems = this.createDefaultMenuItems();
        this.menuList.addMenuItems(this.menuItems, defaultMenuItems);
        this.getGui().appendChild(this.menuList.getGui());
        this.menuList.addEventListener(main_1.MenuItemComponent.EVENT_ITEM_SELECTED, this.onHidePopup.bind(this));
    };
    ContextMenu.prototype.onHidePopup = function () {
        this.hidePopupFunc();
    };
    ContextMenu.prototype.afterGuiAttached = function (hidePopup) {
        this.hidePopupFunc = hidePopup;
    };
    __decorate([
        main_1.Autowired('context'), 
        __metadata('design:type', main_1.Context)
    ], ContextMenu.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('clipboardService'), 
        __metadata('design:type', clipboardService_1.ClipboardService)
    ], ContextMenu.prototype, "clipboardService", void 0);
    __decorate([
        main_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', main_1.GridOptionsWrapper)
    ], ContextMenu.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        main_1.Autowired('gridApi'), 
        __metadata('design:type', main_1.GridApi)
    ], ContextMenu.prototype, "gridApi", void 0);
    __decorate([
        main_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
})(main_1.Component);
