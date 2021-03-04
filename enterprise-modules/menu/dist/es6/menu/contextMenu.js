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
import { _, Autowired, Bean, BeanStub, Component, ModuleNames, ModuleRegistry, Optional, PostConstruct } from "@ag-grid-community/core";
import { MenuItemComponent } from "./menuItemComponent";
import { MenuList } from "./menuList";
var CSS_MENU = 'ag-menu';
var CSS_CONTEXT_MENU_OPEN = ' ag-context-menu-open';
var ContextMenuFactory = /** @class */ (function (_super) {
    __extends(ContextMenuFactory, _super);
    function ContextMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextMenuFactory.prototype.registerGridComp = function (gridPanel) {
        this.gridPanel = gridPanel;
    };
    ContextMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions = [];
        if (_.exists(node) && ModuleRegistry.isRegistered(ModuleNames.ClipboardModule)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsWrapper.isEnableCharts() &&
            ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule) &&
            ModuleRegistry.isRegistered(ModuleNames.GridChartsModule)) {
            if (this.columnController.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeController && !this.rangeController.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (_.exists(node)) {
            // if user clicks a cell
            var csvModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.CsvExportModule);
            var excelModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule);
            var suppressExcel = this.gridOptionsWrapper.isSuppressExcelExport() || excelModuleMissing;
            var suppressCsv = this.gridOptionsWrapper.isSuppressCsvExport() || csvModuleMissing;
            var onIPad = _.isIOSUserAgent();
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
    ContextMenuFactory.prototype.showMenu = function (node, column, value, mouseEvent, anchorToElement) {
        var _this = this;
        var menuItems = this.getMenuItems(node, column, value);
        var eGridPanelGui = this.gridPanel.getGui();
        if (menuItems === undefined || _.missingOrEmpty(menuItems)) {
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
            nudgeX: 1,
            nudgeY: 1
        };
        var positionCallback = this.popupService.positionPopupUnderMouseEvent.bind(this.popupService, positionParams);
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: function () {
                _.removeCssClass(eGridPanelGui, CSS_CONTEXT_MENU_OPEN);
                _this.destroyBean(menu);
            },
            click: mouseEvent,
            positionCallback: positionCallback,
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement: anchorToElement
        });
        if (addPopupRes) {
            _.addCssClass(eGridPanelGui, CSS_CONTEXT_MENU_OPEN);
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
        menu.addEventListener(BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(MenuItemComponent.EVENT_MENU_ITEM_SELECTED, addPopupRes.hideFunc);
        }
        return true;
    };
    __decorate([
        Autowired('popupService')
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate([
        Optional('rangeController')
    ], ContextMenuFactory.prototype, "rangeController", void 0);
    __decorate([
        Autowired('columnController')
    ], ContextMenuFactory.prototype, "columnController", void 0);
    ContextMenuFactory = __decorate([
        Bean('contextMenuFactory')
    ], ContextMenuFactory);
    return ContextMenuFactory;
}(BeanStub));
export { ContextMenuFactory };
var ContextMenu = /** @class */ (function (_super) {
    __extends(ContextMenu, _super);
    function ContextMenu(menuItems) {
        var _this = _super.call(this, /* html */ "<div class=\"" + CSS_MENU + "\" role=\"presentation\"></div>") || this;
        _this.menuList = null;
        _this.focusedCell = null;
        _this.menuItems = menuItems;
        return _this;
    }
    ContextMenu.prototype.addMenuItems = function () {
        var _this = this;
        var menuList = this.createBean(new MenuList());
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(MenuItemComponent.EVENT_MENU_ITEM_SELECTED, function (e) { return _this.dispatchEvent(e); });
    };
    ContextMenu.prototype.afterGuiAttached = function (params) {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }
        this.focusedCell = this.focusController.getFocusedCell();
        if (this.menuList) {
            this.focusController.focusInto(this.menuList.getGui());
        }
    };
    ContextMenu.prototype.restoreFocusedCell = function () {
        var currentFocusedCell = this.focusController.getFocusedCell();
        if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
            var _a = this.focusedCell, rowIndex = _a.rowIndex, rowPinned = _a.rowPinned, column = _a.column;
            var doc = this.gridOptionsWrapper.getDocument();
            if (doc.activeElement === doc.body) {
                this.focusController.setFocusedCell(rowIndex, column, rowPinned, true);
            }
        }
    };
    ContextMenu.prototype.destroy = function () {
        this.restoreFocusedCell();
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Autowired('menuItemMapper')
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        Autowired('focusController')
    ], ContextMenu.prototype, "focusController", void 0);
    __decorate([
        Autowired('cellPositionUtils')
    ], ContextMenu.prototype, "cellPositionUtils", void 0);
    __decorate([
        PostConstruct
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
}(Component));
