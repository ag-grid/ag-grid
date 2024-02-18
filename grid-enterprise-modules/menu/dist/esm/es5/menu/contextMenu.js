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
var __assign = (this && this.__assign) || function () {
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgMenuItemComponent, AgMenuList, Autowired, Bean, BeanStub, Component, ModuleNames, ModuleRegistry, Optional, PostConstruct } from "@ag-grid-community/core";
var CSS_MENU = 'ag-menu';
var CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';
var ContextMenuFactory = /** @class */ (function (_super) {
    __extends(ContextMenuFactory, _super);
    function ContextMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions = [];
        if (_.exists(node) && ModuleRegistry.__isRegistered(ModuleNames.ClipboardModule, this.context.getGridId())) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gridOptionsService.get('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsService.get('enableCharts') && ModuleRegistry.__isRegistered(ModuleNames.GridChartsModule, this.context.getGridId())) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (_.exists(node)) {
            // if user clicks a cell
            var csvModuleMissing = !ModuleRegistry.__isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
            var excelModuleMissing = !ModuleRegistry.__isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
            var suppressExcel = this.gridOptionsService.get('suppressExcelExport') || excelModuleMissing;
            var suppressCsv = this.gridOptionsService.get('suppressCsvExport') || csvModuleMissing;
            var onIPad = _.isIOSUserAgent();
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
        if (menuItems === undefined || _.missingOrEmpty(menuItems)) {
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
                _this.popupService.positionPopupUnderMouseEvent(__assign(__assign({}, positionParams), { nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1 }));
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
        menu.addEventListener(BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, addPopupRes.hideFunc);
        }
        return true;
    };
    __decorate([
        Autowired('popupService')
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate([
        Optional('rangeService')
    ], ContextMenuFactory.prototype, "rangeService", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], ContextMenuFactory.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('columnModel')
    ], ContextMenuFactory.prototype, "columnModel", void 0);
    __decorate([
        Autowired('menuUtils')
    ], ContextMenuFactory.prototype, "menuUtils", void 0);
    ContextMenuFactory = __decorate([
        Bean('contextMenuFactory')
    ], ContextMenuFactory);
    return ContextMenuFactory;
}(BeanStub));
export { ContextMenuFactory };
var ContextMenu = /** @class */ (function (_super) {
    __extends(ContextMenu, _super);
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
        var menuList = this.createManagedBean(new AgMenuList(0, {
            column: this.column,
            node: this.node,
            value: this.value
        }));
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null, function () { return _this.getGui(); });
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(AgMenuItemComponent.EVENT_CLOSE_MENU, function (e) { return _this.dispatchEvent(e); });
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
    __decorate([
        Autowired('menuItemMapper')
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate([
        Autowired('focusService')
    ], ContextMenu.prototype, "focusService", void 0);
    __decorate([
        Autowired('cellPositionUtils')
    ], ContextMenu.prototype, "cellPositionUtils", void 0);
    __decorate([
        PostConstruct
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
}(Component));
