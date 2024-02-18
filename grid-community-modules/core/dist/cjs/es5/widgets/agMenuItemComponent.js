"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgMenuItemComponent = void 0;
var agMenuList_1 = require("./agMenuList");
var agMenuPanel_1 = require("./agMenuPanel");
var keyCode_1 = require("../constants/keyCode");
var context_1 = require("../context/context");
var dom_1 = require("../utils/dom");
var aria_1 = require("../utils/aria");
var beanStub_1 = require("../context/beanStub");
var tooltipFeature_1 = require("./tooltipFeature");
var AgMenuItemComponent = /** @class */ (function (_super) {
    __extends(AgMenuItemComponent, _super);
    function AgMenuItemComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isActive = false;
        _this.subMenuIsOpen = false;
        _this.subMenuIsOpening = false;
        _this.suppressRootStyles = true;
        _this.suppressAria = true;
        _this.suppressFocus = true;
        return _this;
    }
    AgMenuItemComponent.prototype.init = function (params) {
        var _this = this;
        var _a, _b;
        var menuItemDef = params.menuItemDef, isAnotherSubMenuOpen = params.isAnotherSubMenuOpen, level = params.level, childComponent = params.childComponent, contextParams = params.contextParams;
        this.params = params.menuItemDef;
        this.level = level;
        this.isAnotherSubMenuOpen = isAnotherSubMenuOpen;
        this.childComponent = childComponent;
        this.contextParams = contextParams;
        this.cssClassPrefix = (_b = (_a = this.params.menuItemParams) === null || _a === void 0 ? void 0 : _a.cssClassPrefix) !== null && _b !== void 0 ? _b : 'ag-menu-option';
        var compDetails = this.userComponentFactory.getMenuItemCompDetails(this.params, __assign(__assign({}, menuItemDef), { level: level, isAnotherSubMenuOpen: isAnotherSubMenuOpen, openSubMenu: function (activateFirstItem) { return _this.openSubMenu(activateFirstItem); }, closeSubMenu: function () { return _this.closeSubMenu(); }, closeMenu: function (event) { return _this.closeMenu(event); }, updateTooltip: function (tooltip) { return _this.updateTooltip(tooltip); }, onItemActivated: function () { return _this.onItemActivated(); } }));
        return compDetails.newAgStackInstance().then(function (comp) {
            var _a;
            _this.menuItemComp = comp;
            var configureDefaults = (_a = comp.configureDefaults) === null || _a === void 0 ? void 0 : _a.call(comp);
            if (configureDefaults) {
                _this.configureDefaults(configureDefaults === true ? undefined : configureDefaults);
            }
        });
    };
    AgMenuItemComponent.prototype.addListeners = function (eGui, params) {
        var _this = this;
        if (!(params === null || params === void 0 ? void 0 : params.suppressClick)) {
            this.addManagedListener(eGui, 'click', function (e) { return _this.onItemSelected(e); });
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressKeyboardSelect)) {
            this.addManagedListener(eGui, 'keydown', function (e) {
                if (e.key === keyCode_1.KeyCode.ENTER || e.key === keyCode_1.KeyCode.SPACE) {
                    e.preventDefault();
                    _this.onItemSelected(e);
                }
            });
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressMouseDown)) {
            this.addManagedListener(eGui, 'mousedown', function (e) {
                // Prevent event bubbling to other event handlers such as PopupService triggering
                // premature closing of any open sub-menu popup.
                e.stopPropagation();
                e.preventDefault();
            });
        }
        if (!(params === null || params === void 0 ? void 0 : params.suppressMouseOver)) {
            this.addManagedListener(eGui, 'mouseenter', function () { return _this.onMouseEnter(); });
            this.addManagedListener(eGui, 'mouseleave', function () { return _this.onMouseLeave(); });
        }
    };
    AgMenuItemComponent.prototype.isDisabled = function () {
        return !!this.params.disabled;
    };
    AgMenuItemComponent.prototype.openSubMenu = function (activateFirstItem) {
        var _this = this;
        var _a, _b;
        if (activateFirstItem === void 0) { activateFirstItem = false; }
        this.closeSubMenu();
        if (!this.params.subMenu) {
            return;
        }
        this.subMenuIsOpening = true;
        var ePopup = (0, dom_1.loadTemplate)(/* html */ "<div class=\"ag-menu\" role=\"presentation\"></div>");
        this.eSubMenuGui = ePopup;
        var destroySubMenu;
        var afterGuiAttached = function () {
            _this.subMenuIsOpening = false;
        };
        if (this.childComponent) {
            var menuPanel = this.createBean(new agMenuPanel_1.AgMenuPanel(this.childComponent));
            menuPanel.setParentComponent(this);
            var subMenuGui_1 = menuPanel.getGui();
            var mouseEvent_1 = 'mouseenter';
            var mouseEnterListener_1 = function () { return _this.cancelDeactivate(); };
            subMenuGui_1.addEventListener(mouseEvent_1, mouseEnterListener_1);
            destroySubMenu = function () { return subMenuGui_1.removeEventListener(mouseEvent_1, mouseEnterListener_1); };
            ePopup.appendChild(subMenuGui_1);
            if (this.childComponent.afterGuiAttached) {
                afterGuiAttached = function () {
                    _this.childComponent.afterGuiAttached();
                    _this.subMenuIsOpening = false;
                };
            }
        }
        else if (this.params.subMenu) {
            var childMenu_1 = this.createBean(new agMenuList_1.AgMenuList(this.level + 1, this.contextParams));
            childMenu_1.setParentComponent(this);
            childMenu_1.addMenuItems(this.params.subMenu);
            ePopup.appendChild(childMenu_1.getGui());
            // bubble menu item selected events
            this.addManagedListener(childMenu_1, AgMenuItemComponent.EVENT_CLOSE_MENU, function (e) { return _this.dispatchEvent(e); });
            childMenu_1.addGuiEventListener('mouseenter', function () { return _this.cancelDeactivate(); });
            destroySubMenu = function () { return _this.destroyBean(childMenu_1); };
            if (activateFirstItem) {
                afterGuiAttached = function () {
                    childMenu_1.activateFirstItem();
                    _this.subMenuIsOpening = false;
                };
            }
        }
        var positionCallback = this.popupService.positionPopupForMenu.bind(this.popupService, { eventSource: this.eGui, ePopup: ePopup });
        var translate = this.localeService.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: this.eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu'),
            afterGuiAttached: afterGuiAttached
        });
        this.subMenuIsOpen = true;
        this.setAriaExpanded(true);
        this.hideSubMenu = function () {
            var _a, _b;
            if (addPopupRes) {
                addPopupRes.hideFunc();
            }
            _this.subMenuIsOpen = false;
            _this.setAriaExpanded(false);
            destroySubMenu();
            (_b = (_a = _this.menuItemComp).setExpanded) === null || _b === void 0 ? void 0 : _b.call(_a, false);
            _this.eSubMenuGui = undefined;
        };
        (_b = (_a = this.menuItemComp).setExpanded) === null || _b === void 0 ? void 0 : _b.call(_a, true);
    };
    AgMenuItemComponent.prototype.setAriaExpanded = function (expanded) {
        if (!this.suppressAria) {
            (0, aria_1.setAriaExpanded)(this.eGui, expanded);
        }
    };
    AgMenuItemComponent.prototype.closeSubMenu = function () {
        if (!this.hideSubMenu) {
            return;
        }
        this.hideSubMenu();
        this.hideSubMenu = null;
        this.setAriaExpanded(false);
    };
    AgMenuItemComponent.prototype.isSubMenuOpen = function () {
        return this.subMenuIsOpen;
    };
    AgMenuItemComponent.prototype.isSubMenuOpening = function () {
        return this.subMenuIsOpening;
    };
    AgMenuItemComponent.prototype.activate = function (openSubMenu) {
        var _this = this;
        var _a, _b;
        this.cancelActivate();
        if (this.params.disabled) {
            return;
        }
        this.isActive = true;
        if (!this.suppressRootStyles) {
            this.eGui.classList.add("".concat(this.cssClassPrefix, "-active"));
        }
        (_b = (_a = this.menuItemComp).setActive) === null || _b === void 0 ? void 0 : _b.call(_a, true);
        if (!this.suppressFocus) {
            this.eGui.focus();
        }
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
        var _a, _b;
        this.cancelDeactivate();
        if (!this.suppressRootStyles) {
            this.eGui.classList.remove("".concat(this.cssClassPrefix, "-active"));
        }
        (_b = (_a = this.menuItemComp).setActive) === null || _b === void 0 ? void 0 : _b.call(_a, false);
        this.isActive = false;
        if (this.subMenuIsOpen) {
            this.hideSubMenu();
        }
    };
    AgMenuItemComponent.prototype.getGui = function () {
        return this.menuItemComp.getGui();
    };
    AgMenuItemComponent.prototype.getParentComponent = function () {
        return this.parentComponent;
    };
    AgMenuItemComponent.prototype.setParentComponent = function (component) {
        this.parentComponent = component;
    };
    AgMenuItemComponent.prototype.getSubMenuGui = function () {
        return this.eSubMenuGui;
    };
    AgMenuItemComponent.prototype.onItemSelected = function (event) {
        var _this = this;
        var _a, _b;
        (_b = (_a = this.menuItemComp).select) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (this.params.action) {
            this.getFrameworkOverrides().wrapOutgoing(function () { return _this.params.action(_this.gridOptionsService.addGridCommonParams(__assign({}, _this.contextParams))); });
        }
        else {
            this.openSubMenu(event && event.type === 'keydown');
        }
        if ((this.params.subMenu && !this.params.action) || this.params.suppressCloseOnSelect) {
            return;
        }
        this.closeMenu(event);
    };
    AgMenuItemComponent.prototype.closeMenu = function (event) {
        var e = {
            type: AgMenuItemComponent.EVENT_CLOSE_MENU,
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
        if (this.isAnotherSubMenuOpen()) {
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
    AgMenuItemComponent.prototype.configureDefaults = function (params) {
        var _this = this;
        var _a, _b, _c;
        this.tooltip = this.params.tooltip;
        if (!this.menuItemComp) {
            // need to wait for init to complete
            setTimeout(function () { return _this.configureDefaults(params); });
            return;
        }
        var eGui = this.menuItemComp.getGui();
        // in some frameworks, `getGui` might be a framework element
        var rootElement = (_b = (_a = this.menuItemComp).getRootElement) === null || _b === void 0 ? void 0 : _b.call(_a);
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
            (_c = this.params.cssClasses) === null || _c === void 0 ? void 0 : _c.forEach(function (it) { return eGui.classList.add(it); });
            if (this.params.disabled) {
                eGui.classList.add("".concat(this.cssClassPrefix, "-disabled"));
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
    };
    AgMenuItemComponent.prototype.updateTooltip = function (tooltip) {
        this.tooltip = tooltip;
        if (!this.tooltipFeature && this.menuItemComp) {
            this.setTooltip();
        }
    };
    AgMenuItemComponent.prototype.setTooltip = function () {
        var _this = this;
        if (!this.tooltip) {
            return;
        }
        this.tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature({
            getGui: function () { return _this.getGui(); },
            getTooltipValue: function () { return _this.tooltip; },
            getLocation: function () { return 'menu'; }
        }, this.beans));
        this.tooltipFeature.setComp(this.getGui());
    };
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
    return AgMenuItemComponent;
}(beanStub_1.BeanStub));
exports.AgMenuItemComponent = AgMenuItemComponent;
