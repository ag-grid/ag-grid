"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var core_1 = require("@ag-grid-community/core");
var menuList_1 = require("./menuList");
var menuPanel_1 = require("./menuPanel");
var MenuItemComponent = /** @class */ (function (_super) {
    __extends(MenuItemComponent, _super);
    function MenuItemComponent(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.isActive = false;
        _this.subMenuIsOpen = false;
        _this.setTemplate(/* html */ "<div class=\"" + _this.getClassName() + "\" tabindex=\"-1\" role=\"treeitem\"></div>");
        return _this;
    }
    MenuItemComponent.prototype.init = function () {
        var _this = this;
        this.addIcon();
        this.addName();
        this.addShortcut();
        this.addSubMenu();
        this.addTooltip();
        var eGui = this.getGui();
        if (this.params.disabled) {
            this.addCssClass(this.getClassName('disabled'));
            core_1._.setAriaDisabled(eGui, true);
        }
        else {
            this.addGuiEventListener('click', function (e) { return _this.onItemSelected(e); });
            this.addGuiEventListener('keydown', function (e) {
                if (e.keyCode === core_1.KeyCode.ENTER || e.keyCode === core_1.KeyCode.SPACE) {
                    _this.onItemSelected(e);
                }
            });
            this.addGuiEventListener('mouseenter', function () { return _this.onMouseEnter(); });
            this.addGuiEventListener('mouseleave', function () { return _this.onMouseLeave(); });
        }
        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(function (it) { return core_1._.addCssClass(eGui, it); });
        }
    };
    MenuItemComponent.prototype.isDisabled = function () {
        return !!this.params.disabled;
    };
    MenuItemComponent.prototype.openSubMenu = function (activateFirstItem) {
        var _this = this;
        if (activateFirstItem === void 0) { activateFirstItem = false; }
        this.closeSubMenu();
        if (!this.params.subMenu) {
            return;
        }
        var ePopup = core_1._.loadTemplate(/* html */ "<div class=\"ag-menu\" role=\"presentation\"></div>");
        var destroySubMenu;
        if (this.params.subMenu instanceof Array) {
            var currentLevel = core_1._.getAriaLevel(this.getGui());
            var nextLevel = isNaN(currentLevel) ? 1 : (currentLevel + 1);
            var childMenu_1 = this.createBean(new menuList_1.MenuList(nextLevel));
            childMenu_1.setParentComponent(this);
            childMenu_1.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu_1.getGui());
            // bubble menu item selected events
            this.addManagedListener(childMenu_1, MenuItemComponent.EVENT_MENU_ITEM_SELECTED, function (e) { return _this.dispatchEvent(e); });
            childMenu_1.addGuiEventListener('mouseenter', function () { return _this.cancelDeactivate(); });
            destroySubMenu = function () { return _this.destroyBean(childMenu_1); };
            if (activateFirstItem) {
                setTimeout(function () { return childMenu_1.activateFirstItem(); }, 0);
            }
        }
        else {
            var subMenu_1 = this.params.subMenu;
            var menuPanel = this.createBean(new menuPanel_1.MenuPanel(subMenu_1));
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
        var positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService, { eventSource: eGui, ePopup: ePopup });
        var closePopup = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: eGui
        });
        this.subMenuIsOpen = true;
        core_1._.setAriaExpanded(eGui, true);
        this.hideSubMenu = function () {
            closePopup();
            _this.subMenuIsOpen = false;
            core_1._.setAriaExpanded(eGui, false);
            destroySubMenu();
        };
    };
    MenuItemComponent.prototype.closeSubMenu = function () {
        if (!this.hideSubMenu) {
            return;
        }
        this.hideSubMenu();
        this.hideSubMenu = null;
        core_1._.setAriaExpanded(this.getGui(), false);
    };
    MenuItemComponent.prototype.isSubMenuOpen = function () {
        return this.subMenuIsOpen;
    };
    MenuItemComponent.prototype.activate = function (openSubMenu) {
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
    MenuItemComponent.prototype.deactivate = function () {
        this.cancelDeactivate();
        this.removeCssClass(this.getClassName('active'));
        this.isActive = false;
        if (this.subMenuIsOpen) {
            this.hideSubMenu();
        }
    };
    MenuItemComponent.prototype.addIcon = function () {
        if (!this.params.checked && !this.params.icon && this.params.isCompact) {
            return;
        }
        var icon = core_1._.loadTemplate(/* html */ "<span ref=\"eIcon\" class=\"" + this.getClassName('part') + " " + this.getClassName('icon') + "\" role=\"presentation\"></span>");
        if (this.params.checked) {
            icon.appendChild(core_1._.createIconNoSpan('check', this.gridOptionsWrapper));
        }
        else if (this.params.icon) {
            if (core_1._.isNodeOrElement(this.params.icon)) {
                icon.appendChild(this.params.icon);
            }
            else if (typeof this.params.icon === 'string') {
                icon.innerHTML = this.params.icon;
            }
            else {
                console.warn('ag-Grid: menu item icon must be DOM node or string');
            }
        }
        this.getGui().appendChild(icon);
    };
    MenuItemComponent.prototype.addName = function () {
        if (!this.params.name && this.params.isCompact) {
            return;
        }
        var name = core_1._.loadTemplate(/* html */ "<span ref=\"eName\" class=\"" + this.getClassName('part') + " " + this.getClassName('text') + "\">" + (this.params.name || '') + "</span>");
        this.getGui().appendChild(name);
    };
    MenuItemComponent.prototype.addTooltip = function () {
        if (!this.params.tooltip) {
            return;
        }
        this.tooltip = this.params.tooltip;
        if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
            this.getGui().setAttribute('title', this.tooltip);
        }
        else {
            this.createManagedBean(new core_1.TooltipFeature(this));
        }
    };
    MenuItemComponent.prototype.getTooltipParams = function () {
        return {
            location: 'menu',
            value: this.tooltip
        };
    };
    MenuItemComponent.prototype.addShortcut = function () {
        if (!this.params.shortcut && this.params.isCompact) {
            return;
        }
        var shortcut = core_1._.loadTemplate(/* html */ "<span ref=\"eShortcut\" class=\"" + this.getClassName('part') + " " + this.getClassName('shortcut') + "\">" + (this.params.shortcut || '') + "</span>");
        this.getGui().appendChild(shortcut);
    };
    MenuItemComponent.prototype.addSubMenu = function () {
        if (!this.params.subMenu && this.params.isCompact) {
            return;
        }
        var pointer = core_1._.loadTemplate(/* html */ "<span ref=\"ePopupPointer\" class=\"" + this.getClassName('part') + " " + this.getClassName('popup-pointer') + "\"></span>");
        var eGui = this.getGui();
        if (this.params.subMenu) {
            var iconName = this.gridOptionsWrapper.isEnableRtl() ? 'smallLeft' : 'smallRight';
            core_1._.setAriaExpanded(eGui, false);
            pointer.appendChild(core_1._.createIconNoSpan(iconName, this.gridOptionsWrapper));
        }
        eGui.appendChild(pointer);
    };
    MenuItemComponent.prototype.onItemSelected = function (event) {
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
            type: MenuItemComponent.EVENT_MENU_ITEM_SELECTED,
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
    MenuItemComponent.prototype.onItemActivated = function () {
        var event = {
            type: MenuItemComponent.EVENT_MENU_ITEM_ACTIVATED,
            menuItem: this,
        };
        this.dispatchEvent(event);
    };
    MenuItemComponent.prototype.cancelActivate = function () {
        if (this.activateTimeoutId) {
            window.clearTimeout(this.activateTimeoutId);
            this.activateTimeoutId = 0;
        }
    };
    MenuItemComponent.prototype.cancelDeactivate = function () {
        if (this.deactivateTimeoutId) {
            window.clearTimeout(this.deactivateTimeoutId);
            this.deactivateTimeoutId = 0;
        }
    };
    MenuItemComponent.prototype.onMouseEnter = function () {
        var _this = this;
        this.cancelDeactivate();
        if (this.params.isAnotherSubMenuOpen()) {
            // wait to see if the user enters the open sub-menu
            this.activateTimeoutId = window.setTimeout(function () { return _this.activate(true); }, MenuItemComponent.ACTIVATION_DELAY);
        }
        else {
            // activate immediately
            this.activate(true);
        }
    };
    MenuItemComponent.prototype.onMouseLeave = function () {
        var _this = this;
        this.cancelActivate();
        if (this.isSubMenuOpen()) {
            // wait to see if the user enters the sub-menu
            this.deactivateTimeoutId = window.setTimeout(function () { return _this.deactivate(); }, MenuItemComponent.ACTIVATION_DELAY);
        }
        else {
            // de-activate immediately
            this.deactivate();
        }
    };
    MenuItemComponent.prototype.getClassName = function (suffix) {
        var prefix = this.params.isCompact ? 'ag-compact-menu-option' : 'ag-menu-option';
        return suffix ? prefix + "-" + suffix : prefix;
    };
    MenuItemComponent.EVENT_MENU_ITEM_SELECTED = 'menuItemSelected';
    MenuItemComponent.EVENT_MENU_ITEM_ACTIVATED = 'menuItemActivated';
    MenuItemComponent.ACTIVATION_DELAY = 80;
    __decorate([
        core_1.Autowired('gridOptionsWrapper')
    ], MenuItemComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core_1.Autowired('popupService')
    ], MenuItemComponent.prototype, "popupService", void 0);
    __decorate([
        core_1.PostConstruct
    ], MenuItemComponent.prototype, "init", null);
    return MenuItemComponent;
}(core_1.Component));
exports.MenuItemComponent = MenuItemComponent;
//# sourceMappingURL=menuItemComponent.js.map