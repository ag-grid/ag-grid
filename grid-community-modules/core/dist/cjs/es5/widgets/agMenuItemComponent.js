/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgMenuItemComponent = void 0;
var context_1 = require("../context/context");
var agMenuList_1 = require("./agMenuList");
var agMenuPanel_1 = require("./agMenuPanel");
var component_1 = require("./component");
var keyCode_1 = require("../constants/keyCode");
var context_2 = require("../context/context");
var icon_1 = require("../utils/icon");
var dom_1 = require("../utils/dom");
var customTooltipFeature_1 = require("./customTooltipFeature");
var aria_1 = require("../utils/aria");
var AgMenuItemComponent = /** @class */ (function (_super) {
    __extends(AgMenuItemComponent, _super);
    function AgMenuItemComponent(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.isActive = false;
        _this.subMenuIsOpen = false;
        _this.setTemplate(/* html */ "<div class=\"" + _this.getClassName() + "\" tabindex=\"-1\" role=\"treeitem\"></div>");
        return _this;
    }
    AgMenuItemComponent.prototype.init = function () {
        var _this = this;
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
        this.addTooltip();
        var eGui = this.getGui();
        if (this.params.disabled) {
            this.addCssClass(this.getClassName('disabled'));
            aria_1.setAriaDisabled(eGui, true);
        }
        else {
            this.addGuiEventListener('click', function (e) { return _this.onItemSelected(e); });
            this.addGuiEventListener('keydown', function (e) {
                if (e.key === keyCode_1.KeyCode.ENTER || e.key === keyCode_1.KeyCode.SPACE) {
                    e.preventDefault();
                    _this.onItemSelected(e);
                }
            });
            this.addGuiEventListener('mousedown', function (e) {
                // Prevent event bubbling to other event handlers such as PopupService triggering
                // premature closing of any open sub-menu popup.
                e.stopPropagation();
                e.preventDefault();
            });
            this.addGuiEventListener('mouseenter', function () { return _this.onMouseEnter(); });
            this.addGuiEventListener('mouseleave', function () { return _this.onMouseLeave(); });
        }
        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(function (it) { return _this.addCssClass(it); });
        }
    };
    AgMenuItemComponent.prototype.isDisabled = function () {
        return !!this.params.disabled;
    };
    AgMenuItemComponent.prototype.openSubMenu = function (activateFirstItem) {
        var _this = this;
        if (activateFirstItem === void 0) { activateFirstItem = false; }
        this.closeSubMenu();
        if (!this.params.subMenu) {
            return;
        }
        var ePopup = dom_1.loadTemplate(/* html */ "<div class=\"ag-menu\" role=\"presentation\"></div>");
        var destroySubMenu;
        if (this.params.subMenu instanceof Array) {
            var currentLevel = aria_1.getAriaLevel(this.getGui());
            var nextLevel = isNaN(currentLevel) ? 1 : (currentLevel + 1);
            var childMenu_1 = this.createBean(new agMenuList_1.AgMenuList(nextLevel));
            childMenu_1.setParentComponent(this);
            childMenu_1.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu_1.getGui());
            // bubble menu item selected events
            this.addManagedListener(childMenu_1, AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, function (e) { return _this.dispatchEvent(e); });
            childMenu_1.addGuiEventListener('mouseenter', function () { return _this.cancelDeactivate(); });
            destroySubMenu = function () { return _this.destroyBean(childMenu_1); };
            if (activateFirstItem) {
                setTimeout(function () { return childMenu_1.activateFirstItem(); }, 0);
            }
        }
        else {
            var subMenu_1 = this.params.subMenu;
            var menuPanel = this.createBean(new agMenuPanel_1.AgMenuPanel(subMenu_1));
            menuPanel.setParentComponent(this);
            var subMenuGui_1 = menuPanel.getGui();
            var mouseEvent_1 = 'mouseenter';
            var mouseEnterListener_1 = function () { return _this.cancelDeactivate(); };
            subMenuGui_1.addEventListener(mouseEvent_1, mouseEnterListener_1);
            destroySubMenu = function () { return subMenuGui_1.removeEventListener(mouseEvent_1, mouseEnterListener_1); };
            ePopup.appendChild(subMenuGui_1);
            if (subMenu_1.afterGuiAttached) {
                setTimeout(function () { return subMenu_1.afterGuiAttached(); }, 0);
            }
        }
        var eGui = this.getGui();
        var positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService, { eventSource: eGui, ePopup: ePopup, shouldSetMaxHeight: this.params.shouldSetMaxHeight });
        var translate = this.localeService.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu')
        });
        this.subMenuIsOpen = true;
        aria_1.setAriaExpanded(eGui, true);
        this.hideSubMenu = function () {
            if (addPopupRes) {
                addPopupRes.hideFunc();
            }
            _this.subMenuIsOpen = false;
            aria_1.setAriaExpanded(eGui, false);
            destroySubMenu();
        };
    };
    AgMenuItemComponent.prototype.closeSubMenu = function () {
        if (!this.hideSubMenu) {
            return;
        }
        this.hideSubMenu();
        this.hideSubMenu = null;
        aria_1.setAriaExpanded(this.getGui(), false);
    };
    AgMenuItemComponent.prototype.isSubMenuOpen = function () {
        return this.subMenuIsOpen;
    };
    AgMenuItemComponent.prototype.activate = function (openSubMenu) {
        var _this = this;
        this.cancelActivate();
        if (this.params.disabled) {
            return;
        }
        this.isActive = true;
        this.addCssClass(this.getClassName('active'));
        this.getGui().focus();
        if (openSubMenu && this.params.subMenu) {
            window.setTimeout(function () {
                if (_this.isAlive() && _this.isActive) {
                    _this.openSubMenu();
                }
            }, 300);
        }
        this.onItemActivated();
    };
    AgMenuItemComponent.prototype.deactivate = function () {
        this.cancelDeactivate();
        this.removeCssClass(this.getClassName('active'));
        this.isActive = false;
        if (this.subMenuIsOpen) {
            this.hideSubMenu();
        }
    };
    AgMenuItemComponent.prototype.addIcon = function () {
        if (!this.params.checked && !this.params.icon && this.params.isCompact) {
            return;
        }
        var icon = dom_1.loadTemplate(/* html */ "<span ref=\"eIcon\" class=\"" + this.getClassName('part') + " " + this.getClassName('icon') + "\" role=\"presentation\"></span>");
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
    };
    AgMenuItemComponent.prototype.addName = function () {
        if (!this.params.name && this.params.isCompact) {
            return;
        }
        var name = dom_1.loadTemplate(/* html */ "<span ref=\"eName\" class=\"" + this.getClassName('part') + " " + this.getClassName('text') + "\">" + (this.params.name || '') + "</span>");
        this.getGui().appendChild(name);
    };
    AgMenuItemComponent.prototype.addTooltip = function () {
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
    };
    AgMenuItemComponent.prototype.getTooltipParams = function () {
        return {
            location: 'menu',
            value: this.tooltip
        };
    };
    AgMenuItemComponent.prototype.addShortcut = function () {
        if (!this.params.shortcut && this.params.isCompact) {
            return;
        }
        var shortcut = dom_1.loadTemplate(/* html */ "<span ref=\"eShortcut\" class=\"" + this.getClassName('part') + " " + this.getClassName('shortcut') + "\">" + (this.params.shortcut || '') + "</span>");
        this.getGui().appendChild(shortcut);
    };
    AgMenuItemComponent.prototype.addSubMenu = function () {
        if (!this.params.subMenu && this.params.isCompact) {
            return;
        }
        var pointer = dom_1.loadTemplate(/* html */ "<span ref=\"ePopupPointer\" class=\"" + this.getClassName('part') + " " + this.getClassName('popup-pointer') + "\"></span>");
        var eGui = this.getGui();
        if (this.params.subMenu) {
            var iconName = this.gridOptionsService.is('enableRtl') ? 'smallLeft' : 'smallRight';
            aria_1.setAriaExpanded(eGui, false);
            pointer.appendChild(icon_1.createIconNoSpan(iconName, this.gridOptionsService));
        }
        eGui.appendChild(pointer);
    };
    AgMenuItemComponent.prototype.onItemSelected = function (event) {
        if (this.params.action) {
            this.params.action();
        }
        else {
            this.openSubMenu(event && event.type === 'keydown');
        }
        if (this.params.subMenu && !this.params.action) {
            return;
        }
        var e = {
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
            event: event
        };
        this.dispatchEvent(e);
    };
    AgMenuItemComponent.prototype.onItemActivated = function () {
        var event = {
            type: AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED,
            menuItem: this,
        };
        this.dispatchEvent(event);
    };
    AgMenuItemComponent.prototype.cancelActivate = function () {
        if (this.activateTimeoutId) {
            window.clearTimeout(this.activateTimeoutId);
            this.activateTimeoutId = 0;
        }
    };
    AgMenuItemComponent.prototype.cancelDeactivate = function () {
        if (this.deactivateTimeoutId) {
            window.clearTimeout(this.deactivateTimeoutId);
            this.deactivateTimeoutId = 0;
        }
    };
    AgMenuItemComponent.prototype.onMouseEnter = function () {
        var _this = this;
        this.cancelDeactivate();
        if (this.params.isAnotherSubMenuOpen()) {
            // wait to see if the user enters the open sub-menu
            this.activateTimeoutId = window.setTimeout(function () { return _this.activate(true); }, AgMenuItemComponent.ACTIVATION_DELAY);
        }
        else {
            // activate immediately
            this.activate(true);
        }
    };
    AgMenuItemComponent.prototype.onMouseLeave = function () {
        var _this = this;
        this.cancelActivate();
        if (this.isSubMenuOpen()) {
            // wait to see if the user enters the sub-menu
            this.deactivateTimeoutId = window.setTimeout(function () { return _this.deactivate(); }, AgMenuItemComponent.ACTIVATION_DELAY);
        }
        else {
            // de-activate immediately
            this.deactivate();
        }
    };
    AgMenuItemComponent.prototype.getClassName = function (suffix) {
        var prefix = this.params.isCompact ? 'ag-compact-menu-option' : 'ag-menu-option';
        return suffix ? prefix + "-" + suffix : prefix;
    };
    AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED = 'menuItemSelected';
    AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
    AgMenuItemComponent.ACTIVATION_DELAY = 80;
    __decorate([
        context_1.Autowired('popupService')
    ], AgMenuItemComponent.prototype, "popupService", void 0);
    __decorate([
        context_2.PostConstruct
    ], AgMenuItemComponent.prototype, "init", null);
    return AgMenuItemComponent;
}(component_1.Component));
exports.AgMenuItemComponent = AgMenuItemComponent;
