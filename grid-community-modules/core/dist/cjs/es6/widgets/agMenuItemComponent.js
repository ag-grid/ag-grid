/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.AgMenuItemComponent = void 0;
const context_1 = require("../context/context");
const agMenuList_1 = require("./agMenuList");
const agMenuPanel_1 = require("./agMenuPanel");
const component_1 = require("./component");
const keyCode_1 = require("../constants/keyCode");
const context_2 = require("../context/context");
const icon_1 = require("../utils/icon");
const dom_1 = require("../utils/dom");
const customTooltipFeature_1 = require("./customTooltipFeature");
const aria_1 = require("../utils/aria");
class AgMenuItemComponent extends component_1.Component {
    constructor(params) {
        super();
        this.params = params;
        this.isActive = false;
        this.subMenuIsOpen = false;
        this.setTemplate(/* html */ `<div class="${this.getClassName()}" tabindex="-1" role="treeitem"></div>`);
    }
    init() {
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
        this.addTooltip();
        const eGui = this.getGui();
        if (this.params.disabled) {
            this.addCssClass(this.getClassName('disabled'));
            aria_1.setAriaDisabled(eGui, true);
        }
        else {
            this.addGuiEventListener('click', e => this.onItemSelected(e));
            this.addGuiEventListener('keydown', (e) => {
                if (e.key === keyCode_1.KeyCode.ENTER || e.key === keyCode_1.KeyCode.SPACE) {
                    e.preventDefault();
                    this.onItemSelected(e);
                }
            });
            this.addGuiEventListener('mousedown', e => {
                // Prevent event bubbling to other event handlers such as PopupService triggering
                // premature closing of any open sub-menu popup.
                e.stopPropagation();
                e.preventDefault();
            });
            this.addGuiEventListener('mouseenter', () => this.onMouseEnter());
            this.addGuiEventListener('mouseleave', () => this.onMouseLeave());
        }
        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(it => this.addCssClass(it));
        }
    }
    isDisabled() {
        return !!this.params.disabled;
    }
    openSubMenu(activateFirstItem = false) {
        this.closeSubMenu();
        if (!this.params.subMenu) {
            return;
        }
        const ePopup = dom_1.loadTemplate(/* html */ `<div class="ag-menu" role="presentation"></div>`);
        let destroySubMenu;
        if (this.params.subMenu instanceof Array) {
            const currentLevel = aria_1.getAriaLevel(this.getGui());
            const nextLevel = isNaN(currentLevel) ? 1 : (currentLevel + 1);
            const childMenu = this.createBean(new agMenuList_1.AgMenuList(nextLevel));
            childMenu.setParentComponent(this);
            childMenu.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu.getGui());
            // bubble menu item selected events
            this.addManagedListener(childMenu, AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, e => this.dispatchEvent(e));
            childMenu.addGuiEventListener('mouseenter', () => this.cancelDeactivate());
            destroySubMenu = () => this.destroyBean(childMenu);
            if (activateFirstItem) {
                setTimeout(() => childMenu.activateFirstItem(), 0);
            }
        }
        else {
            const { subMenu } = this.params;
            const menuPanel = this.createBean(new agMenuPanel_1.AgMenuPanel(subMenu));
            menuPanel.setParentComponent(this);
            const subMenuGui = menuPanel.getGui();
            const mouseEvent = 'mouseenter';
            const mouseEnterListener = () => this.cancelDeactivate();
            subMenuGui.addEventListener(mouseEvent, mouseEnterListener);
            destroySubMenu = () => subMenuGui.removeEventListener(mouseEvent, mouseEnterListener);
            ePopup.appendChild(subMenuGui);
            if (subMenu.afterGuiAttached) {
                setTimeout(() => subMenu.afterGuiAttached(), 0);
            }
        }
        const eGui = this.getGui();
        const positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService, { eventSource: eGui, ePopup, shouldSetMaxHeight: this.params.shouldSetMaxHeight });
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu')
        });
        this.subMenuIsOpen = true;
        aria_1.setAriaExpanded(eGui, true);
        this.hideSubMenu = () => {
            if (addPopupRes) {
                addPopupRes.hideFunc();
            }
            this.subMenuIsOpen = false;
            aria_1.setAriaExpanded(eGui, false);
            destroySubMenu();
        };
    }
    closeSubMenu() {
        if (!this.hideSubMenu) {
            return;
        }
        this.hideSubMenu();
        this.hideSubMenu = null;
        aria_1.setAriaExpanded(this.getGui(), false);
    }
    isSubMenuOpen() {
        return this.subMenuIsOpen;
    }
    activate(openSubMenu) {
        this.cancelActivate();
        if (this.params.disabled) {
            return;
        }
        this.isActive = true;
        this.addCssClass(this.getClassName('active'));
        this.getGui().focus();
        if (openSubMenu && this.params.subMenu) {
            window.setTimeout(() => {
                if (this.isAlive() && this.isActive) {
                    this.openSubMenu();
                }
            }, 300);
        }
        this.onItemActivated();
    }
    deactivate() {
        this.cancelDeactivate();
        this.removeCssClass(this.getClassName('active'));
        this.isActive = false;
        if (this.subMenuIsOpen) {
            this.hideSubMenu();
        }
    }
    addIcon() {
        if (!this.params.checked && !this.params.icon && this.params.isCompact) {
            return;
        }
        const icon = dom_1.loadTemplate(/* html */ `<span ref="eIcon" class="${this.getClassName('part')} ${this.getClassName('icon')}" role="presentation"></span>`);
        if (this.params.checked) {
            icon.appendChild(icon_1.createIconNoSpan('check', this.gridOptionsService));
        }
        else if (this.params.icon) {
            if (dom_1.isNodeOrElement(this.params.icon)) {
                icon.appendChild(this.params.icon);
            }
            else if (typeof this.params.icon === 'string') {
                icon.innerHTML = this.params.icon;
            }
            else {
                console.warn('AG Grid: menu item icon must be DOM node or string');
            }
        }
        this.getGui().appendChild(icon);
    }
    addName() {
        if (!this.params.name && this.params.isCompact) {
            return;
        }
        const name = dom_1.loadTemplate(/* html */ `<span ref="eName" class="${this.getClassName('part')} ${this.getClassName('text')}">${this.params.name || ''}</span>`);
        this.getGui().appendChild(name);
    }
    addTooltip() {
        if (!this.params.tooltip) {
            return;
        }
        this.tooltip = this.params.tooltip;
        if (this.gridOptionsService.is('enableBrowserTooltips')) {
            this.getGui().setAttribute('title', this.tooltip);
        }
        else {
            this.createManagedBean(new customTooltipFeature_1.CustomTooltipFeature(this));
        }
    }
    getTooltipParams() {
        return {
            location: 'menu',
            value: this.tooltip
        };
    }
    addShortcut() {
        if (!this.params.shortcut && this.params.isCompact) {
            return;
        }
        const shortcut = dom_1.loadTemplate(/* html */ `<span ref="eShortcut" class="${this.getClassName('part')} ${this.getClassName('shortcut')}">${this.params.shortcut || ''}</span>`);
        this.getGui().appendChild(shortcut);
    }
    addSubMenu() {
        if (!this.params.subMenu && this.params.isCompact) {
            return;
        }
        const pointer = dom_1.loadTemplate(/* html */ `<span ref="ePopupPointer" class="${this.getClassName('part')} ${this.getClassName('popup-pointer')}"></span>`);
        const eGui = this.getGui();
        if (this.params.subMenu) {
            const iconName = this.gridOptionsService.is('enableRtl') ? 'smallLeft' : 'smallRight';
            aria_1.setAriaExpanded(eGui, false);
            pointer.appendChild(icon_1.createIconNoSpan(iconName, this.gridOptionsService));
        }
        eGui.appendChild(pointer);
    }
    onItemSelected(event) {
        if (this.params.action) {
            this.params.action();
        }
        else {
            this.openSubMenu(event && event.type === 'keydown');
        }
        if (this.params.subMenu && !this.params.action) {
            return;
        }
        const e = {
            type: AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED,
            action: this.params.action,
            checked: this.params.checked,
            cssClasses: this.params.cssClasses,
            disabled: this.params.disabled,
            icon: this.params.icon,
            name: this.params.name,
            shortcut: this.params.shortcut,
            subMenu: this.params.subMenu,
            tooltip: this.params.tooltip,
            event
        };
        this.dispatchEvent(e);
    }
    onItemActivated() {
        const event = {
            type: AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED,
            menuItem: this,
        };
        this.dispatchEvent(event);
    }
    cancelActivate() {
        if (this.activateTimeoutId) {
            window.clearTimeout(this.activateTimeoutId);
            this.activateTimeoutId = 0;
        }
    }
    cancelDeactivate() {
        if (this.deactivateTimeoutId) {
            window.clearTimeout(this.deactivateTimeoutId);
            this.deactivateTimeoutId = 0;
        }
    }
    onMouseEnter() {
        this.cancelDeactivate();
        if (this.params.isAnotherSubMenuOpen()) {
            // wait to see if the user enters the open sub-menu
            this.activateTimeoutId = window.setTimeout(() => this.activate(true), AgMenuItemComponent.ACTIVATION_DELAY);
        }
        else {
            // activate immediately
            this.activate(true);
        }
    }
    onMouseLeave() {
        this.cancelActivate();
        if (this.isSubMenuOpen()) {
            // wait to see if the user enters the sub-menu
            this.deactivateTimeoutId = window.setTimeout(() => this.deactivate(), AgMenuItemComponent.ACTIVATION_DELAY);
        }
        else {
            // de-activate immediately
            this.deactivate();
        }
    }
    getClassName(suffix) {
        const prefix = this.params.isCompact ? 'ag-compact-menu-option' : 'ag-menu-option';
        return suffix ? `${prefix}-${suffix}` : prefix;
    }
}
AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED = 'menuItemSelected';
AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
AgMenuItemComponent.ACTIVATION_DELAY = 80;
__decorate([
    context_1.Autowired('popupService')
], AgMenuItemComponent.prototype, "popupService", void 0);
__decorate([
    context_2.PostConstruct
], AgMenuItemComponent.prototype, "init", null);
exports.AgMenuItemComponent = AgMenuItemComponent;
