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
import { Autowired, Constants, ManagedFocusComponent, _ } from "@ag-grid-community/core";
import { MenuItemComponent } from "./menuItemComponent";
var MenuList = /** @class */ (function (_super) {
    __extends(MenuList, _super);
    function MenuList() {
        var _this = _super.call(this, MenuList.TEMPLATE) || this;
        _this.menuItems = [];
        _this.subMenuHideTimer = 0;
        _this.subMenuShowTimer = 0;
        _this.removeChildFuncs = [];
        return _this;
    }
    MenuList.prototype.onTabKeyDown = function (e) {
        var parent = this.getParentComponent();
        var isManaged = parent && parent instanceof ManagedFocusComponent;
        if (!isManaged) {
            e.preventDefault();
        }
        if (e.shiftKey) {
            this.closeIfIsChild(e);
        }
    };
    MenuList.prototype.handleKeyDown = function (e) {
        switch (e.keyCode) {
            case Constants.KEY_UP:
            case Constants.KEY_RIGHT:
            case Constants.KEY_DOWN:
            case Constants.KEY_LEFT:
                e.preventDefault();
                this.handleNavKey(e.keyCode);
                break;
            case Constants.KEY_ESCAPE:
                var topMenu = this.findTopMenu();
                if (topMenu) {
                    topMenu.getGui().focus();
                }
                break;
        }
    };
    MenuList.prototype.isFocusableContainer = function () {
        return true;
    };
    MenuList.prototype.clearActiveItem = function () {
        this.deactivateItem();
        this.removeChildPopup();
    };
    MenuList.prototype.addMenuItems = function (menuItems) {
        var _this = this;
        if (!menuItems || _.missing(menuItems)) {
            return;
        }
        menuItems.forEach(function (menuItemOrString) {
            if (menuItemOrString === 'separator') {
                _this.addSeparator();
            }
            else if (typeof menuItemOrString === 'string') {
                console.warn("ag-Grid: unrecognised menu item " + menuItemOrString);
            }
            else {
                var menuItem = menuItemOrString;
                _this.addItem(menuItem);
            }
        });
    };
    MenuList.prototype.addItem = function (menuItemDef) {
        var _this = this;
        var cMenuItem = this.createManagedBean(new MenuItemComponent(menuItemDef));
        this.menuItems.push({ comp: cMenuItem, params: menuItemDef });
        this.appendChild(cMenuItem.getGui());
        cMenuItem.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, function (event) {
            if (menuItemDef.subMenu && !menuItemDef.action) {
                _this.showChildMenu(cMenuItem, menuItemDef);
                if (event.event.type === 'keydown') {
                    _this.subMenuComp.activateFirstItem();
                }
            }
            else {
                _this.dispatchEvent(event);
            }
        });
        cMenuItem.setParentComponent(this);
        var handleMouseEnter = function (cMenuItem, menuItemParams) {
            if (_this.subMenuShowTimer) {
                window.clearTimeout(_this.subMenuShowTimer);
                _this.subMenuShowTimer = 0;
            }
            if (!_this.subMenuHideTimer) {
                _this.mouseEnterItem(cMenuItem, menuItemParams);
            }
            else {
                _this.subMenuShowTimer = window.setTimeout(function () {
                    handleMouseEnter(cMenuItem, menuItemParams);
                }, MenuList.HIDE_MENU_DELAY);
            }
        };
        var handleMouseLeave = function (e, cMenuItem, menuItemParams) {
            if (_this.subMenuParentComp === cMenuItem) {
                if (_this.subMenuHideTimer) {
                    return;
                }
                _this.subMenuHideTimer = window.setTimeout(function () { return _this.mouseLeaveItem(e, cMenuItem, menuItemParams); }, MenuList.HIDE_MENU_DELAY);
            }
            else if (!_this.subMenuHideTimer) {
                _this.mouseLeaveItem(e, cMenuItem, menuItemParams);
            }
        };
        cMenuItem.addGuiEventListener('mouseenter', function () { return handleMouseEnter(cMenuItem, menuItemDef); });
        cMenuItem.addGuiEventListener('mouseleave', function (e) { return handleMouseLeave(e, cMenuItem, menuItemDef); });
    };
    MenuList.prototype.activateFirstItem = function () {
        var item = this.menuItems.filter(function (item) { return !item.params.disabled; })[0];
        if (!item) {
            return;
        }
        this.activateItem(item.comp, item.params);
    };
    MenuList.prototype.mouseEnterItem = function (menuItem, menuItemParams) {
        this.subMenuShowTimer = 0;
        this.activateItem(menuItem, menuItemParams, true);
    };
    MenuList.prototype.mouseLeaveItem = function (e, menuItem, menuItemParams) {
        var isParent = this.subMenuComp && this.subMenuComp.getParentComponent() === menuItem;
        var subMenuGui = isParent && this.subMenuComp.getGui();
        var relatedTarget = e.relatedTarget;
        this.subMenuHideTimer = 0;
        if (relatedTarget && subMenuGui &&
            (subMenuGui.contains(relatedTarget) || relatedTarget.contains(subMenuGui))) {
            return;
        }
        this.deactivateItem(menuItem, menuItemParams);
    };
    MenuList.prototype.activateItem = function (menuItem, menuItemParams, openSubMenu) {
        if (menuItemParams.disabled) {
            this.deactivateItem();
            return;
        }
        if (this.activeMenuItemParams !== menuItemParams) {
            this.removeChildPopup();
        }
        if (this.activeMenuItem && this.activeMenuItem !== menuItem) {
            this.deactivateItem();
        }
        this.activeMenuItemParams = menuItemParams;
        this.activeMenuItem = menuItem;
        var eGui = menuItem.getGui();
        _.addCssClass(eGui, 'ag-menu-option-active');
        eGui.focus();
        if (openSubMenu && menuItemParams.subMenu) {
            this.addHoverForChildPopup(menuItem, menuItemParams);
        }
    };
    MenuList.prototype.deactivateItem = function (menuItem, menuItemParams) {
        if (!menuItem && this.activeMenuItem) {
            menuItem = this.activeMenuItem;
            menuItemParams = this.activeMenuItemParams;
        }
        if (!menuItem || menuItemParams.disabled) {
            return;
        }
        _.removeCssClass(menuItem.getGui(), 'ag-menu-option-active');
        if (this.subMenuParentComp === menuItem) {
            this.removeChildPopup();
        }
        this.activeMenuItem = null;
        this.activeMenuItemParams = null;
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
            case Constants.KEY_UP:
            case Constants.KEY_DOWN:
                var nextItem = this.findNextItem(key === Constants.KEY_UP);
                if (nextItem && nextItem.comp !== this.activeMenuItem) {
                    this.deactivateItem();
                    this.activateItem(nextItem.comp, nextItem.params);
                }
                return;
        }
        if (!this.activateItem) {
            return;
        }
        var left = this.gridOptionsWrapper.isEnableRtl() ? Constants.KEY_RIGHT : Constants.KEY_LEFT;
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
            var parentMenuList = parentItem.getParentComponent();
            parentItem.getGui().focus();
            parentMenuList.removeChildPopup();
        }
    };
    MenuList.prototype.openChild = function () {
        var _this = this;
        if (this.activeMenuItemParams && this.activeMenuItemParams.subMenu) {
            this.showChildMenu(this.activeMenuItem, this.activeMenuItemParams);
            setTimeout(function () {
                var subMenu = _this.subMenuComp;
                subMenu.activateFirstItem();
            }, 0);
        }
    };
    MenuList.prototype.findNextItem = function (up) {
        var items = this.menuItems.filter(function (item) { return !item.params.disabled; });
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
                if (item.comp === this.activeMenuItem) {
                    foundCurrent = true;
                }
                continue;
            }
            nextItem = item;
            break;
        }
        return nextItem || { comp: this.activeMenuItem, params: this.activeMenuItemParams };
    };
    MenuList.prototype.addHoverForChildPopup = function (menuItemComp, menuItemDef) {
        var _this = this;
        window.setTimeout(function () {
            var showingThisMenu = _this.subMenuParentComp === menuItemComp;
            var menuItemIsActive = _this.activeMenuItem === menuItemComp;
            if (_this.isAlive() && menuItemIsActive && !showingThisMenu) {
                _this.showChildMenu(menuItemComp, menuItemDef);
            }
        }, 300);
    };
    MenuList.prototype.addSeparator = function () {
        var template = _.loadTemplate(MenuList.SEPARATOR_TEMPLATE);
        this.appendChild(template);
    };
    MenuList.prototype.showChildMenu = function (menuItemComp, menuItemDef) {
        var _this = this;
        this.removeChildPopup();
        var childMenu = new MenuList();
        childMenu.setParentComponent(menuItemComp);
        this.getContext().createBean(childMenu);
        childMenu.addMenuItems(menuItemDef.subMenu);
        var ePopup = _.loadTemplate('<div class="ag-menu" tabindex="-1"></div>');
        ePopup.appendChild(childMenu.getGui());
        var hidePopupFunc = this.popupService.addAsModalPopup(ePopup, false);
        this.popupService.positionPopupForMenu({
            eventSource: menuItemComp.getGui(),
            ePopup: ePopup
        });
        this.subMenuParentComp = menuItemComp;
        this.subMenuComp = childMenu;
        childMenu.addManagedListener(ePopup, 'mouseover', function () {
            if (_this.subMenuHideTimer && menuItemComp === _this.subMenuParentComp) {
                window.clearTimeout(_this.subMenuHideTimer);
                window.clearTimeout(_this.subMenuShowTimer);
                _this.subMenuHideTimer = 0;
                _this.subMenuShowTimer = 0;
            }
        });
        var selectedListener = function (event) {
            _this.dispatchEvent(event);
        };
        childMenu.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);
        this.removeChildFuncs.push(function () {
            childMenu.clearActiveItem();
            childMenu.destroy();
            _this.subMenuParentComp = null;
            _this.subMenuComp = null;
            childMenu.removeEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);
            hidePopupFunc();
        });
    };
    MenuList.prototype.removeChildPopup = function () {
        this.removeChildFuncs.forEach(function (func) { return func(); });
        this.removeChildFuncs = [];
    };
    MenuList.prototype.destroy = function () {
        this.removeChildPopup();
        _super.prototype.destroy.call(this);
    };
    MenuList.TEMPLATE = "\n        <div class=\"ag-menu-list\"><div class=\"ag-menu-list-body\"></div>";
    MenuList.SEPARATOR_TEMPLATE = "<div class=\"ag-menu-separator\">\n            <span class=\"ag-menu-separator-cell\"></span>\n            <span class=\"ag-menu-separator-cell\"></span>\n            <span class=\"ag-menu-separator-cell\"></span>\n            <span class=\"ag-menu-separator-cell\"></span>\n        </div>";
    MenuList.HIDE_MENU_DELAY = 80;
    __decorate([
        Autowired('popupService')
    ], MenuList.prototype, "popupService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], MenuList.prototype, "gridOptionsWrapper", void 0);
    return MenuList;
}(ManagedFocusComponent));
export { MenuList };
