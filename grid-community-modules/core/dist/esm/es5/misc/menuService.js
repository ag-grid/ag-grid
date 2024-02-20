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
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { isIOSUserAgent } from "../utils/browser";
import { warnOnce } from "../utils/function";
var MenuService = /** @class */ (function (_super) {
    __extends(MenuService, _super);
    function MenuService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuService.prototype.postConstruct = function () {
        var _a;
        this.activeMenuFactory = (_a = this.enterpriseMenuFactory) !== null && _a !== void 0 ? _a : this.filterMenuFactory;
    };
    MenuService.prototype.showColumnMenu = function (params) {
        this.showColumnMenuCommon(this.activeMenuFactory, params, 'columnMenu');
    };
    MenuService.prototype.showFilterMenu = function (params) {
        var menuFactory = this.enterpriseMenuFactory && this.isLegacyMenuEnabled()
            ? this.enterpriseMenuFactory
            : this.filterMenuFactory;
        this.showColumnMenuCommon(menuFactory, params, params.containerType, true);
    };
    MenuService.prototype.showHeaderContextMenu = function (column, mouseEvent, touchEvent) {
        this.activeMenuFactory.showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent);
    };
    MenuService.prototype.showContextMenu = function (params) {
        var _a, _b, _c;
        var column = params.column, anchorToElement = params.anchorToElement, rowNode = params.rowNode, value = params.value;
        (_a = this.contextMenuFactory) === null || _a === void 0 ? void 0 : _a.onContextMenu((_b = params.mouseEvent) !== null && _b !== void 0 ? _b : null, (_c = params.touchEvent) !== null && _c !== void 0 ? _c : null, rowNode !== null && rowNode !== void 0 ? rowNode : null, column !== null && column !== void 0 ? column : null, value, anchorToElement);
    };
    MenuService.prototype.showColumnChooser = function (params) {
        var _a;
        (_a = this.columnChooserFactory) === null || _a === void 0 ? void 0 : _a.showColumnChooser(params);
    };
    MenuService.prototype.hidePopupMenu = function () {
        var _a;
        // hide the context menu if in enterprise
        (_a = this.contextMenuFactory) === null || _a === void 0 ? void 0 : _a.hideActiveMenu();
        // and hide the column menu always
        this.activeMenuFactory.hideActiveMenu();
    };
    MenuService.prototype.hideColumnChooser = function () {
        var _a;
        (_a = this.columnChooserFactory) === null || _a === void 0 ? void 0 : _a.hideActiveColumnChooser();
    };
    MenuService.prototype.isColumnMenuInHeaderEnabled = function (column) {
        var _a = column.getColDef(), suppressMenu = _a.suppressMenu, suppressHeaderMenuButton = _a.suppressHeaderMenuButton;
        var isSuppressMenuButton = suppressHeaderMenuButton !== null && suppressHeaderMenuButton !== void 0 ? suppressHeaderMenuButton : suppressMenu;
        return !isSuppressMenuButton && this.activeMenuFactory.isMenuEnabled(column) && (this.isLegacyMenuEnabled() || !!this.enterpriseMenuFactory);
    };
    MenuService.prototype.isFilterMenuInHeaderEnabled = function (column) {
        return !column.getColDef().suppressHeaderFilterButton && this.filterManager.isFilterAllowed(column);
    };
    MenuService.prototype.isHeaderContextMenuEnabled = function (column) {
        return !(column === null || column === void 0 ? void 0 : column.getColDef().suppressHeaderContextMenu) && this.getColumnMenuType() === 'new';
    };
    MenuService.prototype.isHeaderMenuButtonAlwaysShowEnabled = function () {
        return this.isSuppressMenuHide();
    };
    MenuService.prototype.isHeaderMenuButtonEnabled = function () {
        // we don't show the menu if on an iPad/iPhone, as the user cannot have a pointer device/
        // However if suppressMenuHide is set to true the menu will be displayed alwasys, so it's ok
        // to show it on iPad in this case (as hover isn't needed). If suppressMenuHide
        // is false (default) user will need to use longpress to display the menu.
        var menuHides = !this.isSuppressMenuHide();
        var onIpadAndMenuHides = isIOSUserAgent() && menuHides;
        return !onIpadAndMenuHides;
    };
    MenuService.prototype.isHeaderFilterButtonEnabled = function (column) {
        return this.isFilterMenuInHeaderEnabled(column) && !this.isLegacyMenuEnabled() && !this.isFloatingFilterButtonDisplayed(column);
    };
    MenuService.prototype.isFilterMenuItemEnabled = function (column) {
        return this.filterManager.isFilterAllowed(column) && !this.isLegacyMenuEnabled() &&
            !this.isFilterMenuInHeaderEnabled(column) && !this.isFloatingFilterButtonDisplayed(column);
    };
    MenuService.prototype.isColumnMenuAnchoringEnabled = function () {
        return !this.isLegacyMenuEnabled();
    };
    MenuService.prototype.areAdditionalColumnMenuItemsEnabled = function () {
        return this.getColumnMenuType() === 'new';
    };
    MenuService.prototype.isLegacyMenuEnabled = function () {
        return this.getColumnMenuType() === 'legacy';
    };
    MenuService.prototype.isFloatingFilterButtonEnabled = function (column) {
        var _a;
        var colDef = column.getColDef();
        var legacySuppressFilterButton = (_a = colDef.floatingFilterComponentParams) === null || _a === void 0 ? void 0 : _a.suppressFilterButton;
        if (legacySuppressFilterButton != null) {
            warnOnce("As of v31.1, 'colDef.floatingFilterComponentParams.suppressFilterButton' is deprecated. Use 'colDef.suppressFloatingFilterButton' instead.");
        }
        return colDef.suppressFloatingFilterButton == null ? !legacySuppressFilterButton : !colDef.suppressFloatingFilterButton;
    };
    MenuService.prototype.getColumnMenuType = function () {
        var _a;
        return (_a = this.gridOptionsService.get('columnMenu')) !== null && _a !== void 0 ? _a : 'legacy';
    };
    MenuService.prototype.isFloatingFilterButtonDisplayed = function (column) {
        return !!column.getColDef().floatingFilter && this.isFloatingFilterButtonEnabled(column);
    };
    MenuService.prototype.isSuppressMenuHide = function () {
        var suppressMenuHide = this.gridOptionsService.get('suppressMenuHide');
        if (this.isLegacyMenuEnabled()) {
            return suppressMenuHide;
        }
        else {
            // default to true for new
            return this.gridOptionsService.exists('suppressMenuHide') ? suppressMenuHide : true;
        }
    };
    MenuService.prototype.showColumnMenuCommon = function (menuFactory, params, containerType, filtersOnly) {
        var _this = this;
        var column = params.column, positionBy = params.positionBy;
        if (positionBy === 'button') {
            var buttonElement = params.buttonElement;
            menuFactory.showMenuAfterButtonClick(column, buttonElement, containerType, filtersOnly);
        }
        else if (positionBy === 'mouse') {
            var mouseEvent = params.mouseEvent;
            menuFactory.showMenuAfterMouseEvent(column, mouseEvent, containerType, filtersOnly);
        }
        else if (column) {
            // auto
            this.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(column, 'auto');
            // make sure we've finished scrolling into view before displaying the menu
            this.animationFrameService.requestAnimationFrame(function () {
                var headerCellCtrl = _this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned()).getHeaderCtrlForColumn(column);
                menuFactory.showMenuAfterButtonClick(column, headerCellCtrl.getAnchorElementForMenu(filtersOnly), containerType, true);
            });
        }
    };
    __decorate([
        Optional('enterpriseMenuFactory')
    ], MenuService.prototype, "enterpriseMenuFactory", void 0);
    __decorate([
        Autowired('filterMenuFactory')
    ], MenuService.prototype, "filterMenuFactory", void 0);
    __decorate([
        Optional('contextMenuFactory')
    ], MenuService.prototype, "contextMenuFactory", void 0);
    __decorate([
        Autowired('ctrlsService')
    ], MenuService.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('animationFrameService')
    ], MenuService.prototype, "animationFrameService", void 0);
    __decorate([
        Optional('columnChooserFactory')
    ], MenuService.prototype, "columnChooserFactory", void 0);
    __decorate([
        Autowired('filterManager')
    ], MenuService.prototype, "filterManager", void 0);
    __decorate([
        PostConstruct
    ], MenuService.prototype, "postConstruct", null);
    MenuService = __decorate([
        Bean('menuService')
    ], MenuService);
    return MenuService;
}(BeanStub));
export { MenuService };
