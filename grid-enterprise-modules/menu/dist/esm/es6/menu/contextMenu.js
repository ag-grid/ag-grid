var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgMenuItemComponent, AgMenuList, Autowired, Bean, BeanStub, Component, ModuleNames, ModuleRegistry, Optional, PostConstruct } from "@ag-grid-community/core";
const CSS_MENU = 'ag-menu';
const CSS_CONTEXT_MENU_OPEN = 'ag-context-menu-open';
let ContextMenuFactory = class ContextMenuFactory extends BeanStub {
    hideActiveMenu() {
        this.destroyBean(this.activeMenu);
    }
    getMenuItems(node, column, value) {
        const defaultMenuOptions = [];
        if (_.exists(node) && ModuleRegistry.isRegistered(ModuleNames.ClipboardModule)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                if (!this.gridOptionsService.is('suppressCutToClipboard')) {
                    defaultMenuOptions.push('cut');
                }
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'copyWithGroupHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsService.is('enableCharts') && ModuleRegistry.isRegistered(ModuleNames.GridChartsModule)) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (_.exists(node)) {
            // if user clicks a cell
            const csvModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.CsvExportModule);
            const excelModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule);
            const suppressExcel = this.gridOptionsService.is('suppressExcelExport') || excelModuleMissing;
            const suppressCsv = this.gridOptionsService.is('suppressCsvExport') || csvModuleMissing;
            const onIPad = _.isIOSUserAgent();
            const anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }
        const userFunc = this.gridOptionsService.getCallback('getContextMenuItems');
        if (userFunc) {
            const params = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions.length ? defaultMenuOptions : undefined,
            };
            return userFunc(params);
        }
        return defaultMenuOptions;
    }
    onContextMenu(mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
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
        const eventOrTouch = mouseEvent ? mouseEvent : touchEvent.touches[0];
        if (this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement)) {
            const event = mouseEvent ? mouseEvent : touchEvent;
            event.preventDefault();
        }
    }
    blockMiddleClickScrollsIfNeeded(mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        const { gridOptionsService } = this;
        const { which } = mouseEvent;
        if (gridOptionsService.is('suppressMiddleClickScrolls') && which === 2) {
            mouseEvent.preventDefault();
        }
    }
    showMenu(node, column, value, mouseEvent, anchorToElement) {
        const menuItems = this.getMenuItems(node, column, value);
        const eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
        if (menuItems === undefined || _.missingOrEmpty(menuItems)) {
            return false;
        }
        const menu = new ContextMenu(menuItems);
        this.createBean(menu);
        const eMenuGui = menu.getGui();
        const positionParams = {
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1
        };
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: () => {
                eGridBodyGui.classList.remove(CSS_CONTEXT_MENU_OPEN);
                this.destroyBean(menu);
            },
            click: mouseEvent,
            positionCallback: () => {
                const isRtl = this.gridOptionsService.is('enableRtl');
                this.popupService.positionPopupUnderMouseEvent(Object.assign(Object.assign({}, positionParams), { nudgeX: isRtl ? (eMenuGui.offsetWidth + 1) * -1 : 1 }));
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
        menu.addEventListener(BeanStub.EVENT_DESTROYED, () => {
            if (this.activeMenu === menu) {
                this.activeMenu = null;
            }
        });
        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, addPopupRes.hideFunc);
        }
        return true;
    }
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
export { ContextMenuFactory };
class ContextMenu extends Component {
    constructor(menuItems) {
        super(/* html */ `<div class="${CSS_MENU}" role="presentation"></div>`);
        this.menuList = null;
        this.focusedCell = null;
        this.menuItems = menuItems;
    }
    addMenuItems() {
        const menuList = this.createManagedBean(new AgMenuList());
        const menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, (e) => this.dispatchEvent(e));
    }
    afterGuiAttached(params) {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }
        this.focusedCell = this.focusService.getFocusedCell();
        if (this.menuList) {
            this.focusService.focusInto(this.menuList.getGui());
        }
    }
    restoreFocusedCell() {
        const currentFocusedCell = this.focusService.getFocusedCell();
        if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
            const { rowIndex, rowPinned, column } = this.focusedCell;
            const doc = this.gridOptionsService.getDocument();
            if (doc.activeElement === doc.body) {
                this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true });
            }
        }
    }
    destroy() {
        this.restoreFocusedCell();
        super.destroy();
    }
}
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
