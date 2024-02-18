"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgMenuItemComponent = void 0;
const agMenuList_1 = require("./agMenuList");
const agMenuPanel_1 = require("./agMenuPanel");
const keyCode_1 = require("../constants/keyCode");
const context_1 = require("../context/context");
const dom_1 = require("../utils/dom");
const aria_1 = require("../utils/aria");
const beanStub_1 = require("../context/beanStub");
const tooltipFeature_1 = require("./tooltipFeature");
class AgMenuItemComponent extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.isActive = false;
        this.subMenuIsOpen = false;
        this.subMenuIsOpening = false;
        this.suppressRootStyles = true;
        this.suppressAria = true;
        this.suppressFocus = true;
    }
    init(params) {
        var _a, _b;
        const { menuItemDef, isAnotherSubMenuOpen, level, childComponent, contextParams } = params;
        this.params = params.menuItemDef;
        this.level = level;
        this.isAnotherSubMenuOpen = isAnotherSubMenuOpen;
        this.childComponent = childComponent;
        this.contextParams = contextParams;
        this.cssClassPrefix = (_b = (_a = this.params.menuItemParams) === null || _a === void 0 ? void 0 : _a.cssClassPrefix) !== null && _b !== void 0 ? _b : 'ag-menu-option';
        const compDetails = this.userComponentFactory.getMenuItemCompDetails(this.params, Object.assign(Object.assign({}, menuItemDef), { level,
            isAnotherSubMenuOpen, openSubMenu: activateFirstItem => this.openSubMenu(activateFirstItem), closeSubMenu: () => this.closeSubMenu(), closeMenu: event => this.closeMenu(event), updateTooltip: tooltip => this.updateTooltip(tooltip), onItemActivated: () => this.onItemActivated() }));
        return compDetails.newAgStackInstance().then((comp) => {
            var _a;
            this.menuItemComp = comp;
            const configureDefaults = (_a = comp.configureDefaults) === null || _a === void 0 ? void 0 : _a.call(comp);
            if (configureDefaults) {
                this.configureDefaults(configureDefaults === true ? undefined : configureDefaults);
            }
        });
    }
    addListeners(eGui, params) {
        if (!(params === null || params === void 0 ? void 0 : params.suppressClick)) {
            this.addManagedListener(eGui, 'click', e => this.onItemSelected(e));
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressKeyboardSelect)) {
            this.addManagedListener(eGui, 'keydown', (e) => {
                if (e.key === keyCode_1.KeyCode.ENTER || e.key === keyCode_1.KeyCode.SPACE) {
                    e.preventDefault();
                    this.onItemSelected(e);
                }
            });
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressMouseDown)) {
            this.addManagedListener(eGui, 'mousedown', e => {
                // Prevent event bubbling to other event handlers such as PopupService triggering
                // premature closing of any open sub-menu popup.
                e.stopPropagation();
                e.preventDefault();
            });
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressMouseOver)) {
            this.addManagedListener(eGui, 'mouseenter', () => this.onMouseEnter());
            this.addManagedListener(eGui, 'mouseleave', () => this.onMouseLeave());
        }
    }
    isDisabled() {
        return !!this.params.disabled;
    }
    openSubMenu(activateFirstItem = false) {
        var _a, _b;
        this.closeSubMenu();
        if (!this.params.subMenu) {
            return;
        }
        this.subMenuIsOpening = true;
        const ePopup = (0, dom_1.loadTemplate)(/* html */ `<div class="ag-menu" role="presentation"></div>`);
        this.eSubMenuGui = ePopup;
        let destroySubMenu;
        let afterGuiAttached = () => {
            this.subMenuIsOpening = false;
        };
        if (this.childComponent) {
            const menuPanel = this.createBean(new agMenuPanel_1.AgMenuPanel(this.childComponent));
            menuPanel.setParentComponent(this);
            const subMenuGui = menuPanel.getGui();
            const mouseEvent = 'mouseenter';
            const mouseEnterListener = () => this.cancelDeactivate();
            subMenuGui.addEventListener(mouseEvent, mouseEnterListener);
            destroySubMenu = () => subMenuGui.removeEventListener(mouseEvent, mouseEnterListener);
            ePopup.appendChild(subMenuGui);
            if (this.childComponent.afterGuiAttached) {
                afterGuiAttached = () => {
                    this.childComponent.afterGuiAttached();
                    this.subMenuIsOpening = false;
                };
            }
        }
        else if (this.params.subMenu) {
            const childMenu = this.createBean(new agMenuList_1.AgMenuList(this.level + 1, this.contextParams));
            childMenu.setParentComponent(this);
            childMenu.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu.getGui());
            // bubble menu item selected events
            this.addManagedListener(childMenu, AgMenuItemComponent.EVENT_CLOSE_MENU, e => this.dispatchEvent(e));
            childMenu.addGuiEventListener('mouseenter', () => this.cancelDeactivate());
            destroySubMenu = () => this.destroyBean(childMenu);
            if (activateFirstItem) {
                afterGuiAttached = () => {
                    childMenu.activateFirstItem();
                    this.subMenuIsOpening = false;
                };
            }
        }
        const positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService, { eventSource: this.eGui, ePopup });
        const translate = this.localeService.getLocaleTextFunc();
        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: this.eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu'),
            afterGuiAttached
        });
        this.subMenuIsOpen = true;
        this.setAriaExpanded(true);
        this.hideSubMenu = () => {
            var _a, _b;
            if (addPopupRes) {
                addPopupRes.hideFunc();
            }
            this.subMenuIsOpen = false;
            this.setAriaExpanded(false);
            destroySubMenu();
            (_b = (_a = this.menuItemComp).setExpanded) === null || _b === void 0 ? void 0 : _b.call(_a, false);
            this.eSubMenuGui = undefined;
        };
        (_b = (_a = this.menuItemComp).setExpanded) === null || _b === void 0 ? void 0 : _b.call(_a, true);
    }
    setAriaExpanded(expanded) {
        if (!this.suppressAria) {
            (0, aria_1.setAriaExpanded)(this.eGui, expanded);
        }
    }
    closeSubMenu() {
        if (!this.hideSubMenu) {
            return;
        }
        this.hideSubMenu();
        this.hideSubMenu = null;
        this.setAriaExpanded(false);
    }
    isSubMenuOpen() {
        return this.subMenuIsOpen;
    }
    isSubMenuOpening() {
        return this.subMenuIsOpening;
    }
    activate(openSubMenu) {
        var _a, _b;
        this.cancelActivate();
        if (this.params.disabled) {
            return;
        }
        this.isActive = true;
        if (!this.suppressRootStyles) {
            this.eGui.classList.add(`${this.cssClassPrefix}-active`);
        }
        (_b = (_a = this.menuItemComp).setActive) === null || _b === void 0 ? void 0 : _b.call(_a, true);
        if (!this.suppressFocus) {
            this.eGui.focus();
        }
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
        var _a, _b;
        this.cancelDeactivate();
        if (!this.suppressRootStyles) {
            this.eGui.classList.remove(`${this.cssClassPrefix}-active`);
        }
        (_b = (_a = this.menuItemComp).setActive) === null || _b === void 0 ? void 0 : _b.call(_a, false);
        this.isActive = false;
        if (this.subMenuIsOpen) {
            this.hideSubMenu();
        }
    }
    getGui() {
        return this.menuItemComp.getGui();
    }
    getParentComponent() {
        return this.parentComponent;
    }
    setParentComponent(component) {
        this.parentComponent = component;
    }
    getSubMenuGui() {
        return this.eSubMenuGui;
    }
    onItemSelected(event) {
        var _a, _b;
        (_b = (_a = this.menuItemComp).select) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (this.params.action) {
            this.getFrameworkOverrides().wrapOutgoing(() => this.params.action(this.gridOptionsService.addGridCommonParams(Object.assign({}, this.contextParams))));
        }
        else {
            this.openSubMenu(event && event.type === 'keydown');
        }
        if ((this.params.subMenu && !this.params.action) || this.params.suppressCloseOnSelect) {
            return;
        }
        this.closeMenu(event);
    }
    closeMenu(event) {
        const e = {
            type: AgMenuItemComponent.EVENT_CLOSE_MENU,
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
        if (this.isAnotherSubMenuOpen()) {
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
    configureDefaults(params) {
        var _a, _b, _c;
        this.tooltip = this.params.tooltip;
        if (!this.menuItemComp) {
            // need to wait for init to complete
            setTimeout(() => this.configureDefaults(params));
            return;
        }
        let eGui = this.menuItemComp.getGui();
        // in some frameworks, `getGui` might be a framework element
        const rootElement = (_b = (_a = this.menuItemComp).getRootElement) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (rootElement) {
            if (!(params === null || params === void 0 ? void 0 : params.suppressRootStyles)) {
                eGui.classList.add('ag-menu-option-custom');
            }
            eGui = rootElement;
        }
        this.eGui = eGui;
        this.suppressRootStyles = !!(params === null || params === void 0 ? void 0 : params.suppressRootStyles);
        if (!this.suppressRootStyles) {
            eGui.classList.add(this.cssClassPrefix);
            (_c = this.params.cssClasses) === null || _c === void 0 ? void 0 : _c.forEach(it => eGui.classList.add(it));
            if (this.params.disabled) {
                eGui.classList.add(`${this.cssClassPrefix}-disabled`);
            }
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressTooltip)) {
            this.setTooltip();
        }
        this.suppressAria = !!(params === null || params === void 0 ? void 0 : params.suppressAria);
        if (!this.suppressAria) {
            (0, aria_1.setAriaRole)(eGui, 'treeitem');
            (0, aria_1.setAriaLevel)(eGui, this.level + 1);
            if (this.params.disabled) {
                (0, aria_1.setAriaDisabled)(eGui, true);
            }
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressTabIndex)) {
            eGui.setAttribute('tabindex', '-1');
        }
        if (!this.params.disabled) {
            this.addListeners(eGui, params);
        }
        this.suppressFocus = !!(params === null || params === void 0 ? void 0 : params.suppressFocus);
    }
    updateTooltip(tooltip) {
        this.tooltip = tooltip;
        if (!this.tooltipFeature && this.menuItemComp) {
            this.setTooltip();
        }
    }
    setTooltip() {
        if (!this.tooltip) {
            return;
        }
        this.tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature({
            getGui: () => this.getGui(),
            getTooltipValue: () => this.tooltip,
            getLocation: () => 'menu'
        }, this.beans));
        this.tooltipFeature.setComp(this.getGui());
    }
}
AgMenuItemComponent.EVENT_CLOSE_MENU = 'closeMenu';
AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
AgMenuItemComponent.ACTIVATION_DELAY = 80;
__decorate([
    (0, context_1.Autowired)('popupService')
], AgMenuItemComponent.prototype, "popupService", void 0);
__decorate([
    (0, context_1.Autowired)('userComponentFactory')
], AgMenuItemComponent.prototype, "userComponentFactory", void 0);
__decorate([
    (0, context_1.Autowired)('beans')
], AgMenuItemComponent.prototype, "beans", void 0);
exports.AgMenuItemComponent = AgMenuItemComponent;
