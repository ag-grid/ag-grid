/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context/context");
const agMenuItemComponent_1 = require("./agMenuItemComponent");
const tabGuardComp_1 = require("./tabGuardComp");
const keyCode_1 = require("../constants/keyCode");
const dom_1 = require("../utils/dom");
const array_1 = require("../utils/array");
const aria_1 = require("../utils/aria");
class AgMenuList extends tabGuardComp_1.TabGuardComp {
    constructor(level = 1) {
        super(/* html */ `<div class="ag-menu-list" role="tree"></div>`);
        this.level = level;
        this.menuItems = [];
    }
    postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e)
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
                const topMenu = this.findTopMenu();
                if (topMenu) {
                    this.focusService.focusInto(topMenu.getGui());
                }
                break;
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
        menuItems.forEach(menuItemOrString => {
            if (menuItemOrString === 'separator') {
                this.addSeparator();
            }
            else if (typeof menuItemOrString === 'string') {
                console.warn(`AG Grid: unrecognised menu item ${menuItemOrString}`);
            }
            else {
                this.addItem(menuItemOrString);
            }
        });
    }
    addItem(menuItemDef) {
        const menuItem = this.createManagedBean(new agMenuItemComponent_1.AgMenuItemComponent(Object.assign(Object.assign({}, menuItemDef), { isAnotherSubMenuOpen: () => this.menuItems.some(m => m.isSubMenuOpen()) })));
        menuItem.setParentComponent(this);
        aria_1.setAriaLevel(menuItem.getGui(), this.level);
        this.menuItems.push(menuItem);
        this.appendChild(menuItem.getGui());
        this.addManagedListener(menuItem, agMenuItemComponent_1.AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, (event) => {
            this.dispatchEvent(event);
        });
        this.addManagedListener(menuItem, agMenuItemComponent_1.AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event) => {
            if (this.activeMenuItem && this.activeMenuItem !== event.menuItem) {
                this.activeMenuItem.deactivate();
            }
            this.activeMenuItem = event.menuItem;
        });
    }
    activateFirstItem() {
        const item = this.menuItems.filter(currentItem => !currentItem.isDisabled())[0];
        if (!item) {
            return;
        }
        item.activate();
    }
    addSeparator() {
        const separatorHtml = /* html */ `
            <div class="ag-menu-separator" aria-hidden="true">
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
            </div>`;
        this.appendChild(dom_1.loadTemplate(separatorHtml));
    }
    findTopMenu() {
        let parent = this.getParentComponent();
        if (!parent && this instanceof AgMenuList) {
            return this;
        }
        while (true) {
            const nextParent = parent && parent.getParentComponent && parent.getParentComponent();
            if (!nextParent || (!(nextParent instanceof AgMenuList || nextParent instanceof agMenuItemComponent_1.AgMenuItemComponent))) {
                break;
            }
            parent = nextParent;
        }
        return parent instanceof AgMenuList ? parent : undefined;
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
        const left = this.gridOptionsWrapper.isEnableRtl() ? keyCode_1.KeyCode.RIGHT : keyCode_1.KeyCode.LEFT;
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
        }
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
            return up ? array_1.last(items) : items[0];
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
        return nextItem || this.activeMenuItem;
    }
    destroy() {
        this.clearActiveItem();
        super.destroy();
    }
}
__decorate([
    context_1.Autowired('focusService')
], AgMenuList.prototype, "focusService", void 0);
__decorate([
    context_1.PostConstruct
], AgMenuList.prototype, "postConstruct", null);
exports.AgMenuList = AgMenuList;
