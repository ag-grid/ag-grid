/**
 * @ag-grid-enterprise/menu - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components * @version v26.1.0
 * @link http://www.ag-grid.com/
' * @license Commercial
 */

import { KeyCode, PostConstruct, TabGuardComp, _, CustomTooltipFeature, Autowired, Component, Column, BeanStub, Bean, TabbedLayout, ModuleRegistry, ModuleNames, Constants, AgPromise, Optional, ChartType } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { PrimaryColsPanel } from '@ag-grid-enterprise/column-tool-panel';

var __extends = (undefined && undefined.__extends) || (function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MenuPanel = /** @class */ (function (_super) {
    __extends(MenuPanel, _super);
    function MenuPanel(wrappedComponent) {
        var _this = _super.call(this) || this;
        _this.wrappedComponent = wrappedComponent;
        _this.setTemplateFromElement(wrappedComponent.getGui());
        return _this;
    }
    MenuPanel.prototype.postConstruct = function () {
        var _this = this;
        this.initialiseTabGuard({
            onTabKeyDown: function (e) { return _this.onTabKeyDown(e); },
            handleKeyDown: function (e) { return _this.handleKeyDown(e); }
        });
    };
    MenuPanel.prototype.handleKeyDown = function (e) {
        if (e.keyCode === KeyCode.ESCAPE) {
            this.closePanel();
        }
    };
    MenuPanel.prototype.onTabKeyDown = function (e) {
        if (e.defaultPrevented) {
            return;
        }
        this.closePanel();
        e.preventDefault();
    };
    MenuPanel.prototype.closePanel = function () {
        var menuItem = this.parentComponent;
        menuItem.closeSubMenu();
        setTimeout(function () { return menuItem.getGui().focus(); }, 0);
    };
    __decorate([
        PostConstruct
    ], MenuPanel.prototype, "postConstruct", null);
    return MenuPanel;
}(TabGuardComp));

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MenuItemComponent = /** @class */ (function (_super) {
    __extends$1(MenuItemComponent, _super);
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
            _.setAriaDisabled(eGui, true);
        }
        else {
            this.addGuiEventListener('click', function (e) { return _this.onItemSelected(e); });
            this.addGuiEventListener('keydown', function (e) {
                if (e.keyCode === KeyCode.ENTER || e.keyCode === KeyCode.SPACE) {
                    e.preventDefault();
                    _this.onItemSelected(e);
                }
            });
            this.addGuiEventListener('mouseenter', function () { return _this.onMouseEnter(); });
            this.addGuiEventListener('mouseleave', function () { return _this.onMouseLeave(); });
        }
        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(function (it) { return _.addCssClass(eGui, it); });
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
        var ePopup = _.loadTemplate(/* html */ "<div class=\"ag-menu\" role=\"presentation\"></div>");
        var destroySubMenu;
        if (this.params.subMenu instanceof Array) {
            var currentLevel = _.getAriaLevel(this.getGui());
            var nextLevel = isNaN(currentLevel) ? 1 : (currentLevel + 1);
            var childMenu_1 = this.createBean(new MenuList(nextLevel));
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
            var menuPanel = this.createBean(new MenuPanel(subMenu_1));
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
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: ePopup,
            positionCallback: positionCallback,
            anchorToElement: eGui,
            ariaLabel: translate('ariaLabelSubMenu', 'SubMenu')
        });
        this.subMenuIsOpen = true;
        _.setAriaExpanded(eGui, true);
        this.hideSubMenu = function () {
            if (addPopupRes) {
                addPopupRes.hideFunc();
            }
            _this.subMenuIsOpen = false;
            _.setAriaExpanded(eGui, false);
            destroySubMenu();
        };
    };
    MenuItemComponent.prototype.closeSubMenu = function () {
        if (!this.hideSubMenu) {
            return;
        }
        this.hideSubMenu();
        this.hideSubMenu = null;
        _.setAriaExpanded(this.getGui(), false);
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
        var icon = _.loadTemplate(/* html */ "<span ref=\"eIcon\" class=\"" + this.getClassName('part') + " " + this.getClassName('icon') + "\" role=\"presentation\"></span>");
        if (this.params.checked) {
            icon.appendChild(_.createIconNoSpan('check', this.gridOptionsWrapper));
        }
        else if (this.params.icon) {
            if (_.isNodeOrElement(this.params.icon)) {
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
    MenuItemComponent.prototype.addName = function () {
        if (!this.params.name && this.params.isCompact) {
            return;
        }
        var name = _.loadTemplate(/* html */ "<span ref=\"eName\" class=\"" + this.getClassName('part') + " " + this.getClassName('text') + "\">" + (this.params.name || '') + "</span>");
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
            this.createManagedBean(new CustomTooltipFeature(this));
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
        var shortcut = _.loadTemplate(/* html */ "<span ref=\"eShortcut\" class=\"" + this.getClassName('part') + " " + this.getClassName('shortcut') + "\">" + (this.params.shortcut || '') + "</span>");
        this.getGui().appendChild(shortcut);
    };
    MenuItemComponent.prototype.addSubMenu = function () {
        if (!this.params.subMenu && this.params.isCompact) {
            return;
        }
        var pointer = _.loadTemplate(/* html */ "<span ref=\"ePopupPointer\" class=\"" + this.getClassName('part') + " " + this.getClassName('popup-pointer') + "\"></span>");
        var eGui = this.getGui();
        if (this.params.subMenu) {
            var iconName = this.gridOptionsWrapper.isEnableRtl() ? 'smallLeft' : 'smallRight';
            _.setAriaExpanded(eGui, false);
            pointer.appendChild(_.createIconNoSpan(iconName, this.gridOptionsWrapper));
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
    __decorate$1([
        Autowired('popupService')
    ], MenuItemComponent.prototype, "popupService", void 0);
    __decorate$1([
        PostConstruct
    ], MenuItemComponent.prototype, "init", null);
    return MenuItemComponent;
}(Component));

var __extends$2 = (undefined && undefined.__extends) || (function () {
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
var __assign = (undefined && undefined.__assign) || function () {
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
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MenuList = /** @class */ (function (_super) {
    __extends$2(MenuList, _super);
    function MenuList(level) {
        if (level === void 0) { level = 1; }
        var _this = _super.call(this, /* html */ "<div class=\"ag-menu-list\" role=\"tree\"></div>") || this;
        _this.level = level;
        _this.menuItems = [];
        return _this;
    }
    MenuList.prototype.postConstruct = function () {
        var _this = this;
        this.initialiseTabGuard({
            onTabKeyDown: function (e) { return _this.onTabKeyDown(e); },
            handleKeyDown: function (e) { return _this.handleKeyDown(e); }
        });
    };
    MenuList.prototype.onTabKeyDown = function (e) {
        var parent = this.getParentComponent();
        var parentGui = parent && parent.getGui();
        var isManaged = parentGui && _.containsClass(parentGui, 'ag-focus-managed');
        if (!isManaged) {
            e.preventDefault();
        }
        if (e.shiftKey) {
            this.closeIfIsChild(e);
        }
    };
    MenuList.prototype.handleKeyDown = function (e) {
        switch (e.keyCode) {
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
            case KeyCode.LEFT:
                e.preventDefault();
                this.handleNavKey(e.keyCode);
                break;
            case KeyCode.ESCAPE:
                var topMenu = this.findTopMenu();
                if (topMenu) {
                    this.focusService.focusInto(topMenu.getGui());
                }
                break;
        }
    };
    MenuList.prototype.clearActiveItem = function () {
        if (this.activeMenuItem) {
            this.activeMenuItem.deactivate();
            this.activeMenuItem = null;
        }
    };
    MenuList.prototype.addMenuItems = function (menuItems) {
        var _this = this;
        if (menuItems == null) {
            return;
        }
        menuItems.forEach(function (menuItemOrString) {
            if (menuItemOrString === 'separator') {
                _this.addSeparator();
            }
            else if (typeof menuItemOrString === 'string') {
                console.warn("AG Grid: unrecognised menu item " + menuItemOrString);
            }
            else {
                _this.addItem(menuItemOrString);
            }
        });
    };
    MenuList.prototype.addItem = function (menuItemDef) {
        var _this = this;
        var menuItem = this.createManagedBean(new MenuItemComponent(__assign(__assign({}, menuItemDef), { isAnotherSubMenuOpen: function () { return _.some(_this.menuItems, function (m) { return m.isSubMenuOpen(); }); } })));
        menuItem.setParentComponent(this);
        _.setAriaLevel(menuItem.getGui(), this.level);
        this.menuItems.push(menuItem);
        this.appendChild(menuItem.getGui());
        this.addManagedListener(menuItem, MenuItemComponent.EVENT_MENU_ITEM_SELECTED, function (event) {
            _this.dispatchEvent(event);
        });
        this.addManagedListener(menuItem, MenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, function (event) {
            if (_this.activeMenuItem && _this.activeMenuItem !== event.menuItem) {
                _this.activeMenuItem.deactivate();
            }
            _this.activeMenuItem = event.menuItem;
        });
    };
    MenuList.prototype.activateFirstItem = function () {
        var item = this.menuItems.filter(function (currentItem) { return !currentItem.isDisabled(); })[0];
        if (!item) {
            return;
        }
        item.activate();
    };
    MenuList.prototype.addSeparator = function () {
        var separatorHtml = /* html */ "\n            <div class=\"ag-menu-separator\" aria-hidden=\"true\">\n                <div class=\"ag-menu-separator-part\"></div>\n                <div class=\"ag-menu-separator-part\"></div>\n                <div class=\"ag-menu-separator-part\"></div>\n                <div class=\"ag-menu-separator-part\"></div>\n            </div>";
        this.appendChild(_.loadTemplate(separatorHtml));
    };
    MenuList.prototype.findTopMenu = function () {
        var parent = this.getParentComponent();
        if (!parent && this instanceof MenuList) {
            return this;
        }
        while (true) {
            var nextParent = parent && parent.getParentComponent && parent.getParentComponent();
            if (!nextParent || (!(nextParent instanceof MenuList || nextParent instanceof MenuItemComponent))) {
                break;
            }
            parent = nextParent;
        }
        return parent instanceof MenuList ? parent : undefined;
    };
    MenuList.prototype.handleNavKey = function (key) {
        switch (key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                var nextItem = this.findNextItem(key === KeyCode.UP);
                if (nextItem && nextItem !== this.activeMenuItem) {
                    nextItem.activate();
                }
                return;
        }
        var left = this.gridOptionsWrapper.isEnableRtl() ? KeyCode.RIGHT : KeyCode.LEFT;
        if (key === left) {
            this.closeIfIsChild();
        }
        else {
            this.openChild();
        }
    };
    MenuList.prototype.closeIfIsChild = function (e) {
        var parentItem = this.getParentComponent();
        if (parentItem && parentItem instanceof MenuItemComponent) {
            if (e) {
                e.preventDefault();
            }
            parentItem.closeSubMenu();
            parentItem.getGui().focus();
        }
    };
    MenuList.prototype.openChild = function () {
        if (this.activeMenuItem) {
            this.activeMenuItem.openSubMenu(true);
        }
    };
    MenuList.prototype.findNextItem = function (up) {
        var items = this.menuItems.filter(function (item) { return !item.isDisabled(); });
        if (!items.length) {
            return;
        }
        if (!this.activeMenuItem) {
            return up ? _.last(items) : items[0];
        }
        if (up) {
            items.reverse();
        }
        var nextItem;
        var foundCurrent = false;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
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
    };
    MenuList.prototype.destroy = function () {
        this.clearActiveItem();
        _super.prototype.destroy.call(this);
    };
    __decorate$2([
        Autowired('focusService')
    ], MenuList.prototype, "focusService", void 0);
    __decorate$2([
        PostConstruct
    ], MenuList.prototype, "postConstruct", null);
    return MenuList;
}(TabGuardComp));

var __extends$3 = (undefined && undefined.__extends) || (function () {
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
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EnterpriseMenuFactory = /** @class */ (function (_super) {
    __extends$3(EnterpriseMenuFactory, _super);
    function EnterpriseMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnterpriseMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterMouseEvent = function (column, mouseEvent, defaultTab) {
        var _this = this;
        this.showMenu(column, function (menu) {
            var ePopup = menu.getGui();
            _this.popupService.positionPopupUnderMouseEvent({
                type: 'columnMenu',
                column: column,
                mouseEvent: mouseEvent,
                ePopup: ePopup
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, 'columnMenu', defaultTab, undefined, mouseEvent.target);
    };
    EnterpriseMenuFactory.prototype.showMenuAfterButtonClick = function (column, eventSource, containerType, defaultTab, restrictToTabs) {
        var _this = this;
        var multiplier = -1;
        var alignSide = 'left';
        if (this.gridOptionsWrapper.isEnableRtl()) {
            multiplier = 1;
            alignSide = 'right';
        }
        this.showMenu(column, function (menu) {
            var ePopup = menu.getGui();
            _this.popupService.positionPopupUnderComponent({
                type: containerType,
                column: column,
                eventSource: eventSource,
                ePopup: ePopup,
                alignSide: alignSide,
                nudgeX: 9 * multiplier,
                nudgeY: -23,
                keepWithinBounds: true
            });
            if (defaultTab) {
                menu.showTab(defaultTab);
            }
        }, containerType, defaultTab, restrictToTabs, eventSource);
    };
    EnterpriseMenuFactory.prototype.showMenu = function (column, positionCallback, containerType, defaultTab, restrictToTabs, eventSource) {
        var _this = this;
        var menu = this.createBean(new EnterpriseMenu(column, this.lastSelectedTab, restrictToTabs));
        var eMenuGui = menu.getGui();
        var anchorToElement = eventSource || this.ctrlsService.getGridBodyCtrl().getGui();
        var closedFuncs = [];
        closedFuncs.push(function (e) {
            _this.destroyBean(menu);
            column.setMenuVisible(false, 'contextMenu');
            var isKeyboardEvent = e instanceof KeyboardEvent;
            if (isKeyboardEvent && eventSource && _.isVisible(eventSource)) {
                var focusableEl = _this.focusService.findTabbableParent(eventSource);
                if (focusableEl) {
                    focusableEl.focus();
                }
            }
        });
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: function (e) {
                closedFuncs.forEach(function (f) { return f(e); });
            },
            afterGuiAttached: function (params) { return menu.afterGuiAttached(_.assign({}, { container: containerType }, params)); },
            positionCallback: function () { return positionCallback(menu); },
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelColumnMenu', 'Column Menu')
        });
        if (addPopupRes) {
            // if user starts showing / hiding columns, or otherwise move the underlying column
            // for this menu, we want to stop tracking the menu with the column position. otherwise
            // the menu would move as the user is using the columns tab inside the menu.
            var stopAnchoringPromise = addPopupRes.stopAnchoringPromise;
            if (stopAnchoringPromise) {
                stopAnchoringPromise.then(function (stopAnchoringFunc) {
                    column.addEventListener(Column.EVENT_LEFT_CHANGED, stopAnchoringFunc);
                    column.addEventListener(Column.EVENT_VISIBLE_CHANGED, stopAnchoringFunc);
                    closedFuncs.push(function () {
                        column.removeEventListener(Column.EVENT_LEFT_CHANGED, stopAnchoringFunc);
                        column.removeEventListener(Column.EVENT_VISIBLE_CHANGED, stopAnchoringFunc);
                    });
                });
            }
        }
        if (!defaultTab) {
            menu.showTabBasedOnPreviousSelection();
            // reposition the menu because the method above could load
            // an element that is bigger than enterpriseMenu header.
            positionCallback(menu);
        }
        menu.addEventListener(EnterpriseMenu.EVENT_TAB_SELECTED, function (event) {
            _this.lastSelectedTab = event.key;
        });
        column.setMenuVisible(true, 'contextMenu');
        this.activeMenu = menu;
        menu.addEventListener(BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
    };
    EnterpriseMenuFactory.prototype.isMenuEnabled = function (column) {
        return column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT).length > 0;
    };
    __decorate$3([
        Autowired('popupService')
    ], EnterpriseMenuFactory.prototype, "popupService", void 0);
    __decorate$3([
        Autowired('focusService')
    ], EnterpriseMenuFactory.prototype, "focusService", void 0);
    __decorate$3([
        Autowired('ctrlsService')
    ], EnterpriseMenuFactory.prototype, "ctrlsService", void 0);
    EnterpriseMenuFactory = __decorate$3([
        Bean('menuFactory')
    ], EnterpriseMenuFactory);
    return EnterpriseMenuFactory;
}(BeanStub));
var EnterpriseMenu = /** @class */ (function (_super) {
    __extends$3(EnterpriseMenu, _super);
    function EnterpriseMenu(column, initialSelection, restrictTo) {
        var _this = _super.call(this) || this;
        _this.tabFactories = {};
        _this.includeChecks = {};
        _this.column = column;
        _this.initialSelection = initialSelection;
        _this.tabFactories[EnterpriseMenu.TAB_GENERAL] = _this.createMainPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_FILTER] = _this.createFilterPanel.bind(_this);
        _this.tabFactories[EnterpriseMenu.TAB_COLUMNS] = _this.createColumnsPanel.bind(_this);
        _this.includeChecks[EnterpriseMenu.TAB_GENERAL] = function () { return true; };
        _this.includeChecks[EnterpriseMenu.TAB_FILTER] = function () { return column.isFilterAllowed(); };
        _this.includeChecks[EnterpriseMenu.TAB_COLUMNS] = function () { return true; };
        _this.restrictTo = restrictTo;
        return _this;
    }
    EnterpriseMenu.prototype.init = function () {
        var _this = this;
        var tabs = this.getTabsToCreate().map(function (name) { return _this.createTab(name); });
        this.tabbedLayout = new TabbedLayout({
            items: tabs,
            cssClass: 'ag-menu',
            onActiveItemClicked: this.onHidePopup.bind(this),
            onItemClicked: this.onTabItemClicked.bind(this)
        });
        this.createBean(this.tabbedLayout);
        if (this.mainMenuList) {
            this.mainMenuList.setParentComponent(this.tabbedLayout);
        }
    };
    EnterpriseMenu.prototype.getTabsToCreate = function () {
        var _this = this;
        if (this.restrictTo) {
            return this.restrictTo;
        }
        return this.column.getMenuTabs(EnterpriseMenu.TABS_DEFAULT)
            .filter(function (tabName) { return _this.isValidMenuTabItem(tabName); })
            .filter(function (tabName) { return _this.isNotSuppressed(tabName); })
            .filter(function (tabName) { return _this.isModuleLoaded(tabName); });
    };
    EnterpriseMenu.prototype.isModuleLoaded = function (menuTabName) {
        if (menuTabName === EnterpriseMenu.TAB_COLUMNS) {
            return ModuleRegistry.isRegistered(ModuleNames.ColumnToolPanelModule);
        }
        return true;
    };
    EnterpriseMenu.prototype.isValidMenuTabItem = function (menuTabName) {
        var isValid = true;
        var itemsToConsider = EnterpriseMenu.TABS_DEFAULT;
        if (this.restrictTo != null) {
            isValid = this.restrictTo.indexOf(menuTabName) > -1;
            itemsToConsider = this.restrictTo;
        }
        isValid = isValid && EnterpriseMenu.TABS_DEFAULT.indexOf(menuTabName) > -1;
        if (!isValid) {
            console.warn("Trying to render an invalid menu item '" + menuTabName + "'. Check that your 'menuTabs' contains one of [" + itemsToConsider + "]");
        }
        return isValid;
    };
    EnterpriseMenu.prototype.isNotSuppressed = function (menuTabName) {
        return this.includeChecks[menuTabName]();
    };
    EnterpriseMenu.prototype.createTab = function (name) {
        return this.tabFactories[name]();
    };
    EnterpriseMenu.prototype.showTabBasedOnPreviousSelection = function () {
        // show the tab the user was on last time they had a menu open
        this.showTab(this.initialSelection);
    };
    EnterpriseMenu.prototype.showTab = function (toShow) {
        if (this.tabItemColumns && toShow === EnterpriseMenu.TAB_COLUMNS) {
            this.tabbedLayout.showItem(this.tabItemColumns);
        }
        else if (this.tabItemFilter && toShow === EnterpriseMenu.TAB_FILTER) {
            this.tabbedLayout.showItem(this.tabItemFilter);
        }
        else if (this.tabItemGeneral && toShow === EnterpriseMenu.TAB_GENERAL) {
            this.tabbedLayout.showItem(this.tabItemGeneral);
        }
        else {
            this.tabbedLayout.showFirstItem();
        }
    };
    EnterpriseMenu.prototype.onTabItemClicked = function (event) {
        var key = null;
        switch (event.item) {
            case this.tabItemColumns:
                key = EnterpriseMenu.TAB_COLUMNS;
                break;
            case this.tabItemFilter:
                key = EnterpriseMenu.TAB_FILTER;
                break;
            case this.tabItemGeneral:
                key = EnterpriseMenu.TAB_GENERAL;
                break;
        }
        if (key) {
            this.activateTab(key);
        }
    };
    EnterpriseMenu.prototype.activateTab = function (tab) {
        var ev = {
            type: EnterpriseMenu.EVENT_TAB_SELECTED,
            key: tab
        };
        this.dispatchEvent(ev);
    };
    EnterpriseMenu.prototype.getMenuItems = function () {
        var defaultMenuOptions = this.getDefaultMenuOptions();
        var result;
        var userFunc = this.gridOptionsWrapper.getMainMenuItemsFunc();
        if (userFunc) {
            result = userFunc({
                column: this.column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                defaultItems: defaultMenuOptions
            });
        }
        else {
            result = defaultMenuOptions;
        }
        // GUI looks weird when two separators are side by side. this can happen accidentally
        // if we remove items from the menu then two separators can edit up adjacent.
        _.removeRepeatsFromArray(result, EnterpriseMenu.MENU_ITEM_SEPARATOR);
        return result;
    };
    EnterpriseMenu.prototype.getDefaultMenuOptions = function () {
        var result = [];
        var allowPinning = !this.column.getColDef().lockPinned;
        var rowGroupCount = this.columnModel.getRowGroupColumns().length;
        var doingGrouping = rowGroupCount > 0;
        var groupedByThisColumn = this.columnModel.getRowGroupColumns().indexOf(this.column) >= 0;
        var allowValue = this.column.isAllowValue();
        var allowRowGroup = this.column.isAllowRowGroup();
        var isPrimary = this.column.isPrimary();
        var pivotModeOn = this.columnModel.isPivotMode();
        var isInMemoryRowModel = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        var usingTreeData = this.gridOptionsWrapper.isTreeData();
        var allowValueAgg = 
        // if primary, then only allow aggValue if grouping and it's a value columns
        (isPrimary && doingGrouping && allowValue)
            // secondary columns can always have aggValue, as it means it's a pivot value column
            || !isPrimary;
        if (allowPinning) {
            result.push('pinSubMenu');
        }
        if (allowValueAgg) {
            result.push('valueAggSubMenu');
        }
        if (allowPinning || allowValueAgg) {
            result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        }
        result.push('autoSizeThis');
        result.push('autoSizeAll');
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        if (allowRowGroup && this.column.isPrimary()) {
            if (groupedByThisColumn) {
                result.push('rowUnGroup');
            }
            else {
                result.push('rowGroup');
            }
        }
        result.push(EnterpriseMenu.MENU_ITEM_SEPARATOR);
        result.push('resetColumns');
        // only add grouping expand/collapse if grouping in the InMemoryRowModel
        // if pivoting, we only have expandable groups if grouping by 2 or more columns
        // as the lowest level group is not expandable while pivoting.
        // if not pivoting, then any active row group can be expanded.
        var allowExpandAndContract = isInMemoryRowModel && (usingTreeData || rowGroupCount > (pivotModeOn ? 1 : 0));
        if (allowExpandAndContract) {
            result.push('expandAll');
            result.push('contractAll');
        }
        return result;
    };
    EnterpriseMenu.prototype.createMainPanel = function () {
        this.mainMenuList = this.createManagedBean(new MenuList());
        var menuItems = this.getMenuItems();
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(menuItems, this.column);
        this.mainMenuList.addMenuItems(menuItemsMapped);
        this.mainMenuList.addEventListener(MenuItemComponent.EVENT_MENU_ITEM_SELECTED, this.onHidePopup.bind(this));
        this.tabItemGeneral = {
            title: _.createIconNoSpan('menu', this.gridOptionsWrapper, this.column),
            titleLabel: EnterpriseMenu.TAB_GENERAL.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(this.mainMenuList.getGui()),
            name: EnterpriseMenu.TAB_GENERAL
        };
        return this.tabItemGeneral;
    };
    EnterpriseMenu.prototype.onHidePopup = function () {
        this.hidePopupFunc();
        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        var focusedCell = this.focusService.getFocusedCell();
        if (focusedCell) {
            var rowIndex = focusedCell.rowIndex, rowPinned = focusedCell.rowPinned, column = focusedCell.column;
            this.focusService.setFocusedCell(rowIndex, column, rowPinned, true);
        }
    };
    EnterpriseMenu.prototype.createFilterPanel = function () {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'COLUMN_MENU');
        var afterFilterAttachedCallback = function (params) {
            if (!filterWrapper.filterPromise) {
                return;
            }
            // slightly odd block this - this promise will always have been resolved by the time it gets here, so won't be
            // async (_unless_ in react or similar, but if so why not encountered before now?).
            // I'd suggest a future improvement would be to remove/replace this promise as this block just wont work if it is
            // async and is confusing if you don't have this context
            filterWrapper.filterPromise.then(function (filter) {
                if (filter && filter.afterGuiAttached) {
                    filter.afterGuiAttached(params);
                }
            });
        };
        this.tabItemFilter = {
            title: _.createIconNoSpan('filter', this.gridOptionsWrapper, this.column),
            titleLabel: EnterpriseMenu.TAB_FILTER.replace('MenuTab', ''),
            bodyPromise: filterWrapper.guiPromise,
            afterAttachedCallback: afterFilterAttachedCallback,
            name: EnterpriseMenu.TAB_FILTER
        };
        return this.tabItemFilter;
    };
    EnterpriseMenu.prototype.createColumnsPanel = function () {
        var eWrapperDiv = document.createElement('div');
        _.addCssClass(eWrapperDiv, 'ag-menu-column-select-wrapper');
        this.columnSelectPanel = this.createManagedBean(new PrimaryColsPanel());
        var columnsMenuParams = this.column.getColDef().columnsMenuParams;
        if (!columnsMenuParams) {
            columnsMenuParams = {};
        }
        this.columnSelectPanel.init(false, {
            suppressColumnMove: false,
            suppressValues: false,
            suppressPivots: false,
            suppressRowGroups: false,
            suppressPivotMode: false,
            contractColumnSelection: !!columnsMenuParams.contractColumnSelection,
            suppressColumnExpandAll: !!columnsMenuParams.suppressColumnExpandAll,
            suppressColumnFilter: !!columnsMenuParams.suppressColumnFilter,
            suppressColumnSelectAll: !!columnsMenuParams.suppressColumnSelectAll,
            suppressSyncLayoutWithGrid: !!columnsMenuParams.suppressSyncLayoutWithGrid,
            api: this.gridApi,
            columnApi: this.columnApi
        }, 'columnMenu');
        _.addCssClass(this.columnSelectPanel.getGui(), 'ag-menu-column-select');
        eWrapperDiv.appendChild(this.columnSelectPanel.getGui());
        this.tabItemColumns = {
            title: _.createIconNoSpan('columns', this.gridOptionsWrapper, this.column),
            titleLabel: EnterpriseMenu.TAB_COLUMNS.replace('MenuTab', ''),
            bodyPromise: AgPromise.resolve(eWrapperDiv),
            name: EnterpriseMenu.TAB_COLUMNS
        };
        return this.tabItemColumns;
    };
    EnterpriseMenu.prototype.afterGuiAttached = function (params) {
        var container = params.container, hidePopup = params.hidePopup;
        this.tabbedLayout.setAfterAttachedParams({ container: container, hidePopup: hidePopup });
        if (hidePopup) {
            this.hidePopupFunc = hidePopup;
            this.addDestroyFunc(hidePopup);
        }
    };
    EnterpriseMenu.prototype.getGui = function () {
        return this.tabbedLayout.getGui();
    };
    EnterpriseMenu.EVENT_TAB_SELECTED = 'tabSelected';
    EnterpriseMenu.TAB_FILTER = 'filterMenuTab';
    EnterpriseMenu.TAB_GENERAL = 'generalMenuTab';
    EnterpriseMenu.TAB_COLUMNS = 'columnsMenuTab';
    EnterpriseMenu.TABS_DEFAULT = [EnterpriseMenu.TAB_GENERAL, EnterpriseMenu.TAB_FILTER, EnterpriseMenu.TAB_COLUMNS];
    EnterpriseMenu.MENU_ITEM_SEPARATOR = 'separator';
    __decorate$3([
        Autowired('columnModel')
    ], EnterpriseMenu.prototype, "columnModel", void 0);
    __decorate$3([
        Autowired('filterManager')
    ], EnterpriseMenu.prototype, "filterManager", void 0);
    __decorate$3([
        Autowired('gridApi')
    ], EnterpriseMenu.prototype, "gridApi", void 0);
    __decorate$3([
        Autowired('columnApi')
    ], EnterpriseMenu.prototype, "columnApi", void 0);
    __decorate$3([
        Autowired('menuItemMapper')
    ], EnterpriseMenu.prototype, "menuItemMapper", void 0);
    __decorate$3([
        Autowired('rowModel')
    ], EnterpriseMenu.prototype, "rowModel", void 0);
    __decorate$3([
        Autowired('focusService')
    ], EnterpriseMenu.prototype, "focusService", void 0);
    __decorate$3([
        PostConstruct
    ], EnterpriseMenu.prototype, "init", null);
    return EnterpriseMenu;
}(BeanStub));

var __extends$4 = (undefined && undefined.__extends) || (function () {
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
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CSS_MENU = 'ag-menu';
var CSS_CONTEXT_MENU_OPEN = ' ag-context-menu-open';
var ContextMenuFactory = /** @class */ (function (_super) {
    __extends$4(ContextMenuFactory, _super);
    function ContextMenuFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextMenuFactory.prototype.hideActiveMenu = function () {
        this.destroyBean(this.activeMenu);
    };
    ContextMenuFactory.prototype.getMenuItems = function (node, column, value) {
        var defaultMenuOptions = [];
        if (_.exists(node) && ModuleRegistry.isRegistered(ModuleNames.ClipboardModule)) {
            if (column) {
                // only makes sense if column exists, could have originated from a row
                defaultMenuOptions.push('copy', 'copyWithHeaders', 'paste', 'separator');
            }
        }
        if (this.gridOptionsWrapper.isEnableCharts() &&
            ModuleRegistry.isRegistered(ModuleNames.RangeSelectionModule) &&
            ModuleRegistry.isRegistered(ModuleNames.GridChartsModule)) {
            if (this.columnModel.isPivotMode()) {
                defaultMenuOptions.push('pivotChart');
            }
            if (this.rangeService && !this.rangeService.isEmpty()) {
                defaultMenuOptions.push('chartRange');
            }
        }
        if (_.exists(node)) {
            // if user clicks a cell
            var csvModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.CsvExportModule);
            var excelModuleMissing = !ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule);
            var suppressExcel = this.gridOptionsWrapper.isSuppressExcelExport() || excelModuleMissing;
            var suppressCsv = this.gridOptionsWrapper.isSuppressCsvExport() || csvModuleMissing;
            var onIPad = _.isIOSUserAgent();
            var anyExport = !onIPad && (!suppressExcel || !suppressCsv);
            if (anyExport) {
                defaultMenuOptions.push('export');
            }
        }
        if (this.gridOptionsWrapper.getContextMenuItemsFunc()) {
            var userFunc = this.gridOptionsWrapper.getContextMenuItemsFunc();
            var params = {
                node: node,
                column: column,
                value: value,
                defaultItems: defaultMenuOptions.length ? defaultMenuOptions : undefined,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            };
            return userFunc ? userFunc(params) : undefined;
        }
        return defaultMenuOptions;
    };
    ContextMenuFactory.prototype.onContextMenu = function (mouseEvent, touchEvent, rowNode, column, value, anchorToElement) {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsWrapper.isAllowContextMenuWithControlKey()) {
            // then do the check
            if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) {
                return;
            }
        }
        // need to do this regardless of context menu showing or not, so doing
        // before the isSuppressContextMenu() check
        if (mouseEvent) {
            this.preventDefaultOnContextMenu(mouseEvent);
        }
        if (this.gridOptionsWrapper.isSuppressContextMenu()) {
            return;
        }
        var eventOrTouch = mouseEvent ? mouseEvent : touchEvent.touches[0];
        if (this.showMenu(rowNode, column, value, eventOrTouch, anchorToElement)) {
            var event_1 = mouseEvent ? mouseEvent : touchEvent;
            event_1.preventDefault();
        }
    };
    ContextMenuFactory.prototype.preventDefaultOnContextMenu = function (mouseEvent) {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var which = mouseEvent.which;
        if (gridOptionsWrapper.isPreventDefaultOnContextMenu() ||
            (gridOptionsWrapper.isSuppressMiddleClickScrolls() && which === 2)) {
            mouseEvent.preventDefault();
        }
    };
    ContextMenuFactory.prototype.showMenu = function (node, column, value, mouseEvent, anchorToElement) {
        var _this = this;
        var menuItems = this.getMenuItems(node, column, value);
        var eGridBodyGui = this.ctrlsService.getGridBodyCtrl().getGui();
        if (menuItems === undefined || _.missingOrEmpty(menuItems)) {
            return false;
        }
        var menu = new ContextMenu(menuItems);
        this.createBean(menu);
        var eMenuGui = menu.getGui();
        var positionParams = {
            column: column,
            rowNode: node,
            type: 'contextMenu',
            mouseEvent: mouseEvent,
            ePopup: eMenuGui,
            // move one pixel away so that accidentally double clicking
            // won't show the browser's contextmenu
            nudgeY: 1
        };
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: eMenuGui,
            closeOnEsc: true,
            closedCallback: function () {
                _.removeCssClass(eGridBodyGui, CSS_CONTEXT_MENU_OPEN);
                _this.destroyBean(menu);
            },
            click: mouseEvent,
            positionCallback: function () {
                _this.popupService.positionPopupUnderMouseEvent(_.assign({}, {
                    nudgeX: _this.gridOptionsWrapper.isEnableRtl() ? (eMenuGui.offsetWidth + 1) * -1 : 1
                }, positionParams));
            },
            // so when browser is scrolled down, or grid is scrolled, context menu stays with cell
            anchorToElement: anchorToElement,
            ariaLabel: translate('ariaLabelContextMenu', 'Context Menu')
        });
        if (addPopupRes) {
            _.addCssClass(eGridBodyGui, CSS_CONTEXT_MENU_OPEN);
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
        menu.addEventListener(BeanStub.EVENT_DESTROYED, function () {
            if (_this.activeMenu === menu) {
                _this.activeMenu = null;
            }
        });
        // hide the popup if something gets selected
        if (addPopupRes) {
            menu.addEventListener(MenuItemComponent.EVENT_MENU_ITEM_SELECTED, addPopupRes.hideFunc);
        }
        return true;
    };
    __decorate$4([
        Autowired('popupService')
    ], ContextMenuFactory.prototype, "popupService", void 0);
    __decorate$4([
        Optional('rangeService')
    ], ContextMenuFactory.prototype, "rangeService", void 0);
    __decorate$4([
        Autowired('ctrlsService')
    ], ContextMenuFactory.prototype, "ctrlsService", void 0);
    __decorate$4([
        Autowired('columnModel')
    ], ContextMenuFactory.prototype, "columnModel", void 0);
    ContextMenuFactory = __decorate$4([
        Bean('contextMenuFactory')
    ], ContextMenuFactory);
    return ContextMenuFactory;
}(BeanStub));
var ContextMenu = /** @class */ (function (_super) {
    __extends$4(ContextMenu, _super);
    function ContextMenu(menuItems) {
        var _this = _super.call(this, /* html */ "<div class=\"" + CSS_MENU + "\" role=\"presentation\"></div>") || this;
        _this.menuList = null;
        _this.focusedCell = null;
        _this.menuItems = menuItems;
        return _this;
    }
    ContextMenu.prototype.addMenuItems = function () {
        var _this = this;
        var menuList = this.createBean(new MenuList());
        var menuItemsMapped = this.menuItemMapper.mapWithStockItems(this.menuItems, null);
        menuList.addMenuItems(menuItemsMapped);
        this.appendChild(menuList);
        this.menuList = menuList;
        menuList.addEventListener(MenuItemComponent.EVENT_MENU_ITEM_SELECTED, function (e) { return _this.dispatchEvent(e); });
    };
    ContextMenu.prototype.afterGuiAttached = function (params) {
        if (params.hidePopup) {
            this.addDestroyFunc(params.hidePopup);
        }
        this.focusedCell = this.focusService.getFocusedCell();
        if (this.menuList) {
            this.focusService.focusInto(this.menuList.getGui());
        }
    };
    ContextMenu.prototype.restoreFocusedCell = function () {
        var currentFocusedCell = this.focusService.getFocusedCell();
        if (currentFocusedCell && this.focusedCell && this.cellPositionUtils.equals(currentFocusedCell, this.focusedCell)) {
            var _a = this.focusedCell, rowIndex = _a.rowIndex, rowPinned = _a.rowPinned, column = _a.column;
            var doc = this.gridOptionsWrapper.getDocument();
            if (doc.activeElement === doc.body) {
                this.focusService.setFocusedCell(rowIndex, column, rowPinned, true);
            }
        }
    };
    ContextMenu.prototype.destroy = function () {
        this.restoreFocusedCell();
        _super.prototype.destroy.call(this);
    };
    __decorate$4([
        Autowired('menuItemMapper')
    ], ContextMenu.prototype, "menuItemMapper", void 0);
    __decorate$4([
        Autowired('focusService')
    ], ContextMenu.prototype, "focusService", void 0);
    __decorate$4([
        Autowired('cellPositionUtils')
    ], ContextMenu.prototype, "cellPositionUtils", void 0);
    __decorate$4([
        PostConstruct
    ], ContextMenu.prototype, "addMenuItems", null);
    return ContextMenu;
}(Component));

var __extends$5 = (undefined && undefined.__extends) || (function () {
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
var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MenuItemMapper = /** @class */ (function (_super) {
    __extends$5(MenuItemMapper, _super);
    function MenuItemMapper() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuItemMapper.prototype.mapWithStockItems = function (originalList, column) {
        var _this = this;
        if (!originalList) {
            return [];
        }
        var resultList = [];
        originalList.forEach(function (menuItemOrString) {
            var result;
            if (typeof menuItemOrString === 'string') {
                result = _this.getStockMenuItem(menuItemOrString, column);
            }
            else {
                result = menuItemOrString;
            }
            // if no mapping, can happen when module is not loaded but user tries to use module anyway
            if (!result) {
                return;
            }
            var resultDef = result;
            var subMenu = resultDef.subMenu;
            if (subMenu && subMenu instanceof Array) {
                resultDef.subMenu = _this.mapWithStockItems(resultDef.subMenu, column);
            }
            if (result != null) {
                resultList.push(result);
            }
        });
        return resultList;
    };
    MenuItemMapper.prototype.getStockMenuItem = function (key, column) {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var skipHeaderOnAutoSize = this.gridOptionsWrapper.isSkipHeaderOnAutoSize();
        switch (key) {
            case 'pinSubMenu':
                return {
                    name: localeTextFunc('pinColumn', 'Pin Column'),
                    icon: _.createIconNoSpan('menuPin', this.gridOptionsWrapper, null),
                    subMenu: ['pinLeft', 'pinRight', 'clearPinned']
                };
            case 'pinLeft':
                return {
                    name: localeTextFunc('pinLeft', 'Pin Left'),
                    action: function () { return _this.columnModel.setColumnPinned(column, Constants.PINNED_LEFT, "contextMenu"); },
                    checked: !!column && column.isPinnedLeft()
                };
            case 'pinRight':
                return {
                    name: localeTextFunc('pinRight', 'Pin Right'),
                    action: function () { return _this.columnModel.setColumnPinned(column, Constants.PINNED_RIGHT, "contextMenu"); },
                    checked: !!column && column.isPinnedRight()
                };
            case 'clearPinned':
                return {
                    name: localeTextFunc('noPin', 'No Pin'),
                    action: function () { return _this.columnModel.setColumnPinned(column, null, "contextMenu"); },
                    checked: !!column && !column.isPinned()
                };
            case 'valueAggSubMenu':
                if (ModuleRegistry.assertRegistered(ModuleNames.RowGroupingModule, 'Aggregation from Menu')) {
                    return {
                        name: localeTextFunc('valueAggregation', 'Value Aggregation'),
                        icon: _.createIconNoSpan('menuValue', this.gridOptionsWrapper, null),
                        subMenu: this.createAggregationSubMenu(column)
                    };
                }
                else {
                    return null;
                }
            case 'autoSizeThis':
                return {
                    name: localeTextFunc('autosizeThiscolumn', 'Autosize This Column'),
                    action: function () { return _this.columnModel.autoSizeColumn(column, skipHeaderOnAutoSize, "contextMenu"); }
                };
            case 'autoSizeAll':
                return {
                    name: localeTextFunc('autosizeAllColumns', 'Autosize All Columns'),
                    action: function () { return _this.columnModel.autoSizeAllColumns(skipHeaderOnAutoSize, "contextMenu"); }
                };
            case 'rowGroup':
                return {
                    name: localeTextFunc('groupBy', 'Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: function () { return _this.columnModel.addRowGroupColumn(column, "contextMenu"); },
                    icon: _.createIconNoSpan('menuAddRowGroup', this.gridOptionsWrapper, null)
                };
            case 'rowUnGroup':
                return {
                    name: localeTextFunc('ungroupBy', 'Un-Group by') + ' ' + _.escapeString(this.columnModel.getDisplayNameForColumn(column, 'header')),
                    action: function () { return _this.columnModel.removeRowGroupColumn(column, "contextMenu"); },
                    icon: _.createIconNoSpan('menuRemoveRowGroup', this.gridOptionsWrapper, null)
                };
            case 'resetColumns':
                return {
                    name: localeTextFunc('resetColumns', 'Reset Columns'),
                    action: function () { return _this.columnModel.resetColumnState("contextMenu"); }
                };
            case 'expandAll':
                return {
                    name: localeTextFunc('expandAll', 'Expand All'),
                    action: function () { return _this.gridApi.expandAll(); }
                };
            case 'contractAll':
                return {
                    name: localeTextFunc('collapseAll', 'Collapse All'),
                    action: function () { return _this.gridApi.collapseAll(); }
                };
            case 'copy':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy from Menu')) {
                    return {
                        name: localeTextFunc('copy', 'Copy'),
                        shortcut: localeTextFunc('ctrlC', 'Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                        action: function () { return _this.clipboardService.copyToClipboard(false); }
                    };
                }
                else {
                    return null;
                }
            case 'copyWithHeaders':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Copy with Headers from Menu')) {
                    return {
                        name: localeTextFunc('copyWithHeaders', 'Copy with Headers'),
                        // shortcut: localeTextFunc('ctrlC','Ctrl+C'),
                        icon: _.createIconNoSpan('clipboardCopy', this.gridOptionsWrapper, null),
                        action: function () { return _this.clipboardService.copyToClipboard(true); }
                    };
                }
                else {
                    return null;
                }
            case 'paste':
                if (ModuleRegistry.assertRegistered(ModuleNames.ClipboardModule, 'Paste from Clipboard')) {
                    return {
                        name: localeTextFunc('paste', 'Paste'),
                        shortcut: localeTextFunc('ctrlV', 'Ctrl+V'),
                        disabled: true,
                        icon: _.createIconNoSpan('clipboardPaste', this.gridOptionsWrapper, null),
                        action: function () { return _this.clipboardService.pasteFromClipboard(); }
                    };
                }
                else {
                    return null;
                }
            case 'export':
                var exportSubMenuItems = [];
                var csvModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.CsvExportModule);
                var excelModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.ExcelExportModule);
                if (!this.gridOptionsWrapper.isSuppressCsvExport() && csvModuleLoaded) {
                    exportSubMenuItems.push('csvExport');
                }
                if (!this.gridOptionsWrapper.isSuppressExcelExport() && excelModuleLoaded) {
                    exportSubMenuItems.push('excelExport');
                }
                return {
                    name: localeTextFunc('export', 'Export'),
                    subMenu: exportSubMenuItems,
                    icon: _.createIconNoSpan('save', this.gridOptionsWrapper, null),
                };
            case 'csvExport':
                return {
                    name: localeTextFunc('csvExport', 'CSV Export'),
                    icon: _.createIconNoSpan('csvExport', this.gridOptionsWrapper, null),
                    action: function () { return _this.gridApi.exportDataAsCsv({}); }
                };
            case 'excelExport':
                return {
                    name: localeTextFunc('excelExport', 'Excel Export'),
                    icon: _.createIconNoSpan('excelExport', this.gridOptionsWrapper, null),
                    action: function () { return _this.gridApi.exportDataAsExcel(); }
                };
            case 'separator':
                return 'separator';
            default:
                var chartMenuItem = this.getChartItems(key);
                if (chartMenuItem) {
                    return chartMenuItem;
                }
                else {
                    console.warn("AG Grid: unknown menu item type " + key);
                    return null;
                }
        }
    };
    MenuItemMapper.prototype.getChartItems = function (key) {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var pivotChartMenuItem = function (localeKey, defaultText, chartType) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createPivotChart({ chartType: chartType }); }
            };
        };
        var rangeChartMenuItem = function (localeKey, defaultText, chartType) {
            return {
                name: localeTextFunc(localeKey, defaultText),
                action: function () { return _this.chartService.createChartFromCurrentRange(chartType); }
            };
        };
        switch (key) {
            // case 'pivotChartAndPivotMode':
            //     return {
            //         name: localeTextFunc('pivotChartAndPivotMode', 'Pivot Chart & Pivot Mode&lrm;'),
            //         action: () => this.chartService.pivotChart(ChartType.GroupedColumn),
            //         icon: _.createIconNoSpan('chart', this.gridOptionsWrapper, null)
            //     };
            case 'pivotChart':
                return {
                    name: localeTextFunc('pivotChart', 'Pivot Chart'),
                    subMenu: [
                        'pivotColumnChart',
                        'pivotBarChart',
                        'pivotPieChart',
                        'pivotLineChart',
                        'pivotXYChart',
                        'pivotAreaChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsWrapper, null),
                };
            case 'chartRange':
                return {
                    name: localeTextFunc('chartRange', 'Chart Range'),
                    subMenu: [
                        'rangeColumnChart',
                        'rangeBarChart',
                        'rangePieChart',
                        'rangeLineChart',
                        'rangeXYChart',
                        'rangeAreaChart',
                        'rangeHistogramChart'
                    ],
                    icon: _.createIconNoSpan('chart', this.gridOptionsWrapper, null),
                };
            case 'pivotColumnChart':
                return {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['pivotGroupedColumn', 'pivotStackedColumn', 'pivotNormalizedColumn']
                };
            case 'pivotGroupedColumn':
                return pivotChartMenuItem('groupedColumn', 'Grouped&lrm;', ChartType.GroupedColumn);
            case 'pivotStackedColumn':
                return pivotChartMenuItem('stackedColumn', 'Stacked&lrm;', ChartType.StackedColumn);
            case 'pivotNormalizedColumn':
                return pivotChartMenuItem('normalizedColumn', '100% Stacked&lrm;', ChartType.NormalizedColumn);
            case 'rangeColumnChart':
                return {
                    name: localeTextFunc('columnChart', 'Column'),
                    subMenu: ['rangeGroupedColumn', 'rangeStackedColumn', 'rangeNormalizedColumn']
                };
            case 'rangeGroupedColumn':
                return rangeChartMenuItem('groupedColumn', 'Grouped&lrm;', ChartType.GroupedColumn);
            case 'rangeStackedColumn':
                return rangeChartMenuItem('stackedColumn', 'Stacked&lrm;', ChartType.StackedColumn);
            case 'rangeNormalizedColumn':
                return rangeChartMenuItem('normalizedColumn', '100% Stacked&lrm;', ChartType.NormalizedColumn);
            case 'pivotBarChart':
                return {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['pivotGroupedBar', 'pivotStackedBar', 'pivotNormalizedBar']
                };
            case 'pivotGroupedBar':
                return pivotChartMenuItem('groupedBar', 'Grouped&lrm;', ChartType.GroupedBar);
            case 'pivotStackedBar':
                return pivotChartMenuItem('stackedBar', 'Stacked&lrm;', ChartType.StackedBar);
            case 'pivotNormalizedBar':
                return pivotChartMenuItem('normalizedBar', '100% Stacked&lrm;', ChartType.NormalizedBar);
            case 'rangeBarChart':
                return {
                    name: localeTextFunc('barChart', 'Bar'),
                    subMenu: ['rangeGroupedBar', 'rangeStackedBar', 'rangeNormalizedBar']
                };
            case 'rangeGroupedBar':
                return rangeChartMenuItem('groupedBar', 'Grouped&lrm;', ChartType.GroupedBar);
            case 'rangeStackedBar':
                return rangeChartMenuItem('stackedBar', 'Stacked&lrm;', ChartType.StackedBar);
            case 'rangeNormalizedBar':
                return rangeChartMenuItem('normalizedBar', '100% Stacked&lrm;', ChartType.NormalizedBar);
            case 'pivotPieChart':
                return {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['pivotPie', 'pivotDoughnut']
                };
            case 'pivotPie':
                return pivotChartMenuItem('pie', 'Pie&lrm;', ChartType.Pie);
            case 'pivotDoughnut':
                return pivotChartMenuItem('doughnut', 'Doughnut&lrm;', ChartType.Doughnut);
            case 'rangePieChart':
                return {
                    name: localeTextFunc('pieChart', 'Pie'),
                    subMenu: ['rangePie', 'rangeDoughnut']
                };
            case 'rangePie':
                return rangeChartMenuItem('pie', 'Pie&lrm;', ChartType.Pie);
            case 'rangeDoughnut':
                return rangeChartMenuItem('doughnut', 'Doughnut&lrm;', ChartType.Doughnut);
            case 'pivotLineChart':
                return pivotChartMenuItem('line', 'Line&lrm;', ChartType.Line);
            case 'rangeLineChart':
                return rangeChartMenuItem('line', 'Line&lrm;', ChartType.Line);
            case 'pivotXYChart':
                return {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['pivotScatter', 'pivotBubble']
                };
            case 'pivotScatter':
                return pivotChartMenuItem('scatter', 'Scatter&lrm;', ChartType.Scatter);
            case 'pivotBubble':
                return pivotChartMenuItem('bubble', 'Bubble&lrm;', ChartType.Bubble);
            case 'rangeXYChart':
                return {
                    name: localeTextFunc('xyChart', 'X Y (Scatter)'),
                    subMenu: ['rangeScatter', 'rangeBubble']
                };
            case 'rangeScatter':
                return rangeChartMenuItem('scatter', 'Scatter&lrm;', ChartType.Scatter);
            case 'rangeBubble':
                return rangeChartMenuItem('bubble', 'Bubble&lrm;', ChartType.Bubble);
            case 'pivotAreaChart':
                return {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['pivotArea', 'pivotStackedArea', 'pivotNormalizedArea']
                };
            case 'pivotArea':
                return pivotChartMenuItem('area', 'Area&lrm;', ChartType.Area);
            case 'pivotStackedArea':
                return pivotChartMenuItem('stackedArea', 'Stacked&lrm;', ChartType.StackedArea);
            case 'pivotNormalizedArea':
                return pivotChartMenuItem('normalizedArea', '100% Stacked&lrm;', ChartType.NormalizedArea);
            case 'rangeAreaChart':
                return {
                    name: localeTextFunc('areaChart', 'Area'),
                    subMenu: ['rangeArea', 'rangeStackedArea', 'rangeNormalizedArea']
                };
            case 'rangeArea':
                return rangeChartMenuItem('area', 'Area&lrm;', ChartType.Area);
            case 'rangeStackedArea':
                return rangeChartMenuItem('stackedArea', 'Stacked&lrm;', ChartType.StackedArea);
            case 'rangeNormalizedArea':
                return rangeChartMenuItem('normalizedArea', '100% Stacked&lrm;', ChartType.NormalizedArea);
            case 'rangeHistogramChart':
                return rangeChartMenuItem('histogramChart', 'Histogram&lrm;', ChartType.Histogram);
            default:
                return null;
        }
    };
    MenuItemMapper.prototype.createAggregationSubMenu = function (column) {
        var _this = this;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnIsAlreadyAggValue = column.isValueActive();
        var funcNames = this.aggFuncService.getFuncNames(column);
        var columnToUse;
        if (column.isPrimary()) {
            columnToUse = column;
        }
        else {
            var pivotValueColumn = column.getColDef().pivotValueColumn;
            columnToUse = _.exists(pivotValueColumn) ? pivotValueColumn : undefined;
        }
        var result = [];
        funcNames.forEach(function (funcName) {
            result.push({
                name: localeTextFunc(funcName, funcName),
                action: function () {
                    _this.columnModel.setColumnAggFunc(columnToUse, funcName, "contextMenu");
                    _this.columnModel.addValueColumn(columnToUse, "contextMenu");
                },
                checked: columnIsAlreadyAggValue && columnToUse.getAggFunc() === funcName
            });
        });
        return result;
    };
    __decorate$5([
        Autowired('columnModel')
    ], MenuItemMapper.prototype, "columnModel", void 0);
    __decorate$5([
        Autowired('gridApi')
    ], MenuItemMapper.prototype, "gridApi", void 0);
    __decorate$5([
        Optional('clipboardService')
    ], MenuItemMapper.prototype, "clipboardService", void 0);
    __decorate$5([
        Optional('aggFuncService')
    ], MenuItemMapper.prototype, "aggFuncService", void 0);
    __decorate$5([
        Optional('chartService')
    ], MenuItemMapper.prototype, "chartService", void 0);
    MenuItemMapper = __decorate$5([
        Bean('menuItemMapper')
    ], MenuItemMapper);
    return MenuItemMapper;
}(BeanStub));

var MenuModule = {
    moduleName: ModuleNames.MenuModule,
    beans: [EnterpriseMenuFactory, ContextMenuFactory, MenuItemMapper],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

export { MenuItemComponent, MenuModule };
