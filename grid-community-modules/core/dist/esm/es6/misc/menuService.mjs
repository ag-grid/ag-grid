var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub.mjs";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context.mjs";
import { isIOSUserAgent } from "../utils/browser.mjs";
import { warnOnce } from "../utils/function.mjs";
let MenuService = class MenuService extends BeanStub {
    postConstruct() {
        var _a;
        this.activeMenuFactory = (_a = this.enterpriseMenuFactory) !== null && _a !== void 0 ? _a : this.filterMenuFactory;
    }
    showColumnMenu(params) {
        this.showColumnMenuCommon(this.activeMenuFactory, params, 'columnMenu');
    }
    showFilterMenu(params) {
        const menuFactory = this.enterpriseMenuFactory && this.isLegacyMenuEnabled()
            ? this.enterpriseMenuFactory
            : this.filterMenuFactory;
        this.showColumnMenuCommon(menuFactory, params, params.containerType, true);
    }
    showHeaderContextMenu(column, mouseEvent, touchEvent) {
        this.activeMenuFactory.showMenuAfterContextMenuEvent(column, mouseEvent, touchEvent);
    }
    showContextMenu(params) {
        var _a, _b, _c;
        const { column, anchorToElement, rowNode, value } = params;
        (_a = this.contextMenuFactory) === null || _a === void 0 ? void 0 : _a.onContextMenu((_b = params.mouseEvent) !== null && _b !== void 0 ? _b : null, (_c = params.touchEvent) !== null && _c !== void 0 ? _c : null, rowNode !== null && rowNode !== void 0 ? rowNode : null, column !== null && column !== void 0 ? column : null, value, anchorToElement);
    }
    showColumnChooser(params) {
        var _a;
        (_a = this.columnChooserFactory) === null || _a === void 0 ? void 0 : _a.showColumnChooser(params);
    }
    hidePopupMenu() {
        var _a;
        // hide the context menu if in enterprise
        (_a = this.contextMenuFactory) === null || _a === void 0 ? void 0 : _a.hideActiveMenu();
        // and hide the column menu always
        this.activeMenuFactory.hideActiveMenu();
    }
    hideColumnChooser() {
        var _a;
        (_a = this.columnChooserFactory) === null || _a === void 0 ? void 0 : _a.hideActiveColumnChooser();
    }
    isColumnMenuInHeaderEnabled(column) {
        const { suppressMenu, suppressHeaderMenuButton } = column.getColDef();
        const isSuppressMenuButton = suppressHeaderMenuButton !== null && suppressHeaderMenuButton !== void 0 ? suppressHeaderMenuButton : suppressMenu;
        return !isSuppressMenuButton && this.activeMenuFactory.isMenuEnabled(column) && (this.isLegacyMenuEnabled() || !!this.enterpriseMenuFactory);
    }
    isFilterMenuInHeaderEnabled(column) {
        return !column.getColDef().suppressHeaderFilterButton && this.filterManager.isFilterAllowed(column);
    }
    isHeaderContextMenuEnabled(column) {
        return !(column === null || column === void 0 ? void 0 : column.getColDef().suppressHeaderContextMenu) && this.getColumnMenuType() === 'new';
    }
    isHeaderMenuButtonAlwaysShowEnabled() {
        return this.isSuppressMenuHide();
    }
    isHeaderMenuButtonEnabled() {
        // we don't show the menu if on an iPad/iPhone, as the user cannot have a pointer device/
        // However if suppressMenuHide is set to true the menu will be displayed alwasys, so it's ok
        // to show it on iPad in this case (as hover isn't needed). If suppressMenuHide
        // is false (default) user will need to use longpress to display the menu.
        const menuHides = !this.isSuppressMenuHide();
        const onIpadAndMenuHides = isIOSUserAgent() && menuHides;
        return !onIpadAndMenuHides;
    }
    isHeaderFilterButtonEnabled(column) {
        return this.isFilterMenuInHeaderEnabled(column) && !this.isLegacyMenuEnabled() && !this.isFloatingFilterButtonDisplayed(column);
    }
    isFilterMenuItemEnabled(column) {
        return this.filterManager.isFilterAllowed(column) && !this.isLegacyMenuEnabled() &&
            !this.isFilterMenuInHeaderEnabled(column) && !this.isFloatingFilterButtonDisplayed(column);
    }
    isColumnMenuAnchoringEnabled() {
        return !this.isLegacyMenuEnabled();
    }
    areAdditionalColumnMenuItemsEnabled() {
        return this.getColumnMenuType() === 'new';
    }
    isLegacyMenuEnabled() {
        return this.getColumnMenuType() === 'legacy';
    }
    isFloatingFilterButtonEnabled(column) {
        var _a;
        const colDef = column.getColDef();
        const legacySuppressFilterButton = (_a = colDef.floatingFilterComponentParams) === null || _a === void 0 ? void 0 : _a.suppressFilterButton;
        if (legacySuppressFilterButton != null) {
            warnOnce(`As of v31.1, 'colDef.floatingFilterComponentParams.suppressFilterButton' is deprecated. Use 'colDef.suppressFloatingFilterButton' instead.`);
        }
        return colDef.suppressFloatingFilterButton == null ? !legacySuppressFilterButton : !colDef.suppressFloatingFilterButton;
    }
    getColumnMenuType() {
        var _a;
        return (_a = this.gridOptionsService.get('columnMenu')) !== null && _a !== void 0 ? _a : 'legacy';
    }
    isFloatingFilterButtonDisplayed(column) {
        return !!column.getColDef().floatingFilter && this.isFloatingFilterButtonEnabled(column);
    }
    isSuppressMenuHide() {
        const suppressMenuHide = this.gridOptionsService.get('suppressMenuHide');
        if (this.isLegacyMenuEnabled()) {
            return suppressMenuHide;
        }
        else {
            // default to true for new
            return this.gridOptionsService.exists('suppressMenuHide') ? suppressMenuHide : true;
        }
    }
    showColumnMenuCommon(menuFactory, params, containerType, filtersOnly) {
        const { column, positionBy } = params;
        if (positionBy === 'button') {
            const { buttonElement } = params;
            menuFactory.showMenuAfterButtonClick(column, buttonElement, containerType, filtersOnly);
        }
        else if (positionBy === 'mouse') {
            const { mouseEvent } = params;
            menuFactory.showMenuAfterMouseEvent(column, mouseEvent, containerType, filtersOnly);
        }
        else if (column) {
            // auto
            this.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(column, 'auto');
            // make sure we've finished scrolling into view before displaying the menu
            this.animationFrameService.requestAnimationFrame(() => {
                const headerCellCtrl = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned()).getHeaderCtrlForColumn(column);
                menuFactory.showMenuAfterButtonClick(column, headerCellCtrl.getAnchorElementForMenu(filtersOnly), containerType, true);
            });
        }
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
export { MenuService };
