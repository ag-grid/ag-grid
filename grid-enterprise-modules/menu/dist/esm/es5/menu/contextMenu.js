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
        if (_.exists(node) && ModuleRegistry.isRegistered(ModuleNames.ClipboardModule, this.context.getGridId())) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gridOptionsService.is('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsService.is('enableCharts') && ModuleRegistry.isRegistered(ModuleNames.GridChartsModule, this.context.getGridId())) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (_.exists(node)) {
            // if user clicks a cell
            var csvModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.CsvExportModule, this.context.getGridId());
            var excelModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule, this.context.getGridId());
            var suppressExcel = this.gridOptionsService.is('suppressExcelExport') || excelModuleMissing;
            var suppressCsv = this.gridOptionsService.is('suppressCsvExport') || csvModuleMissing;
            var onIPad = _.isIOSUserAgent();
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
            menu.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, addPopupRes.hideFunc);
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
        var menuList = this.createManagedBean(new AgMenuList());
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, function (e) { return _this.dispatchEvent(e); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dE1lbnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWVudS9jb250ZXh0TWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBRUQsbUJBQW1CLEVBQ25CLFVBQVUsRUFDVixTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFLUixTQUFTLEVBT1QsV0FBVyxFQUNYLGNBQWMsRUFDZCxRQUFRLEVBRVIsYUFBYSxFQUloQixNQUFNLHlCQUF5QixDQUFDO0FBR2pDLElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQztBQUMzQixJQUFNLHFCQUFxQixHQUFHLHNCQUFzQixDQUFDO0FBR3JEO0lBQXdDLHNDQUFRO0lBQWhEOztJQThLQSxDQUFDO0lBcktVLDJDQUFjLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVPLHlDQUFZLEdBQXBCLFVBQXFCLElBQW9CLEVBQUUsTUFBcUIsRUFBRSxLQUFVO1FBQ3hFLElBQU0sa0JBQWtCLEdBQWEsRUFBRSxDQUFDO1FBRXhDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFO1lBQ3RHLElBQUksTUFBTSxFQUFFO2dCQUNSLHNFQUFzRTtnQkFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsRUFBRTtvQkFDdkQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNsQztnQkFDRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLHNCQUFz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