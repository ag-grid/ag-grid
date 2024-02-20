"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgMenuList = void 0;
const context_1 = require("../context/context");
const agMenuItemComponent_1 = require("./agMenuItemComponent");
const tabGuardComp_1 = require("./tabGuardComp");
const keyCode_1 = require("../constants/keyCode");
const dom_1 = require("../utils/dom");
const array_1 = require("../utils/array");
const promise_1 = require("../utils/promise");
const event_1 = require("../utils/event");
class AgMenuList extends tabGuardComp_1.TabGuardComp {
    constructor(level = 0, params) {
        super(/* html */ `<div class="ag-menu-list" role="tree"></div>`);
        this.level = level;
        this.menuItems = [];
        this.params = params !== null && params !== void 0 ? params : {
            column: null,
            node: null,
            value: null
        };
    }
    postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e),
            onFocusIn: e => this.handleFocusIn(e),
            onFocusOut: e => this.handleFocusOut(e),
        });
    }
    onTabKeyDown(e) {
        const parent = this.getParentComponent();
        const parentGui = parent && parent.getGui();
        const isManaged = parentGui && parentGui.classList.contains('ag-focus-managed');
        if (!isManaged) {
            e.preventDefault();
        }
        if (e.shiftKey) {
            this.closeIfIsChild(e);
        }
    }
    handleKeyDown(e) {
        switch (e.key) {
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.RIGHT:
            case keyCode_1.KeyCode.DOWN:
            case keyCode_1.KeyCode.LEFT:
                e.preventDefault();
                this.handleNavKey(e.key);
                break;
            case keyCode_1.KeyCode.ESCAPE:
                if (this.closeIfIsChild()) {
                    (0, event_1.stopPropagationForAgGrid)(e);
                }
                break;
        }
    }
    handleFocusIn(e) {
        var _a, _b;
        // if focus is coming from outside the menu list, then re-activate an item
        const oldFocusedElement = e.relatedTarget;
        if (!this.tabGuardCtrl.isTabGuard(oldFocusedElement) && (this.getGui().contains(oldFocusedElement) || ((_b = (_a = this.activeMenuItem) === null || _a === void 0 ? void 0 : _a.getSubMenuGui()) === null || _b === void 0 ? void 0 : _b.contains(oldFocusedElement)))) {
            return;
        }
        if (this.activeMenuItem) {
            this.activeMenuItem.activate();
        }
        else {
            this.activateFirstItem();
        }
    }
    handleFocusOut(e) {
        var _a;
        // if focus is going outside the menu list, deactivate the current item
        const newFocusedElement = e.relatedTarget;
        if (!this.activeMenuItem || this.getGui().contains(newFocusedElement) || ((_a = this.activeMenuItem.getSubMenuGui()) === null || _a === void 0 ? void 0 : _a.contains(newFocusedElement))) {
            return;
        }
        if (!this.activeMenuItem.isSubMenuOpening()) {
            this.activeMenuItem.deactivate();
        }
    }
    clearActiveItem() {
        if (this.activeMenuItem) {
            this.activeMenuItem.deactivate();
            this.activeMenuItem = null;
        }
    }
    addMenuItems(menuItems) {
        if (menuItems == null) {
            return;
        }
        promise_1.AgPromise.all(menuItems.map(menuItemOrString => {
            if (menuItemOrString === 'separator') {
                return promise_1.AgPromise.resolve({ eGui: this.createSeparator() });
            }
            else if (typeof menuItemOrString === 'string') {
                console.warn(`AG Grid: unrecognised menu item ${menuItemOrString}`);
                return promise_1.AgPromise.resolve({ eGui: null });
            }
            else {
                return this.addItem(menuItemOrString);
            }
        })).then(elements => {
            elements.forEach(element => {
                if (element === null || element === void 0 ? void 0 : element.eGui) {
                    this.appendChild(element.eGui);
                    if (element.comp) {
                        this.menuItems.push(element.comp);
                    }
                }
            });
        });
    }
    addItem(menuItemDef) {
        const menuItem = this.createManagedBean(new agMenuItemComponent_1.AgMenuItemComponent());
        return menuItem.init({
            menuItemDef,
            isAnotherSubMenuOpen: () => this.menuItems.some(m => m.isSubMenuOpen()),
            level: this.level,
            contextParams: this.params
        }).then(() => {
            menuItem.setParentComponent(this);
            this.addManagedListener(menuItem, agMenuItemComponent_1.AgMenuItemComponent.EVENT_CLOSE_MENU, (event) => {
                this.dispatchEvent(event);
            });
            this.addManagedListener(menuItem, agMenuItemComponent_1.AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event) => {
                if (this.activeMenuItem && this.activeMenuItem !== event.menuItem) {
                    this.activeMenuItem.deactivate();
                }
                this.activeMenuItem = event.menuItem;
            });
            return {
                comp: menuItem,
                eGui: menuItem.getGui()
            };
        });
    }
    activateFirstItem() {
        const item = this.menuItems.filter(currentItem => !currentItem.isDisabled())[0];
        if (!item) {
            return;
        }
        item.activate();
    }
    createSeparator() {
        const separatorHtml = /* html */ `
            <div class="ag-menu-separator" aria-hidden="true">
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
            </div>`;
        return (0, dom_1.loadTemplate)(separatorHtml);
    }
    handleNavKey(key) {
        switch (key) {
            case keyCode_1.KeyCode.UP:
            case keyCode_1.KeyCode.DOWN:
                const nextItem = this.findNextItem(key === keyCode_1.KeyCode.UP);
                if (nextItem && nextItem !== this.activeMenuItem) {
                    nextItem.activate();
                }
                return;
        }
        const left = this.gridOptionsService.get('enableRtl') ? keyCode_1.KeyCode.RIGHT : keyCode_1.KeyCode.LEFT;
        if (key === left) {
            this.closeIfIsChild();
        }
        else {
            this.openChild();
        }
    }
    closeIfIsChild(e) {
        const parentItem = this.getParentComponent();
        if (parentItem && parentItem instanceof agMenuItemComponent_1.AgMenuItemComponent) {
            if (e) {
                e.preventDefault();
            }
            parentItem.closeSubMenu();
            parentItem.getGui().focus();
            return true;
        }
        return false;
    }
    openChild() {
        if (this.activeMenuItem) {
            this.activeMenuItem.openSubMenu(true);
        }
    }
    findNextItem(up) {
        const items = this.menuItems.filter(item => !item.isDisabled());
        if (!items.length) {
            return;
        }
        if (!this.activeMenuItem) {
            return up ? (0, array_1.last)(items) : items[0];
        }
        if (up) {
            items.reverse();
        }
        let nextItem;
        let foundCurrent = false;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!foundCurrent) {
                if (item === this.activeMenuItem) {
                    foundCurrent = true;
                }
                continue;
            }
            nextItem = item;
            break;
        }
        if (foundCurrent && !nextItem) {
            // start again from the beginning (/end)
            return items[0];
        }
        return nextItem || this.activeMenuItem;
    }
    destroy() {
        this.clearActiveItem();
        super.destroy();
    }
}
__decorate([
    (0, context_1.Autowired)('focusService')
], AgMenuList.prototype, "focusService", void 0);
__decorate([
    context_1.PostConstruct
], AgMenuList.prototype, "postConstruct", null);
exports.AgMenuList = AgMenuList;
