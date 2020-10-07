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
import { Autowired, ManagedFocusComponent, _, KeyCode, } from "@ag-grid-community/core";
import { MenuItemComponent } from "./menuItemComponent";
var MenuList = /** @class */ (function (_super) {
    __extends(MenuList, _super);
    function MenuList(level) {
        if (level === void 0) { level = 1; }
        var _this = _super.call(this, /* html */ "<div class=\"ag-menu-list\" role=\"tree\"></div>", true) || this;
        _this.level = level;
        _this.menuItems = [];
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
                    this.focusController.focusInto(topMenu.getGui());
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
                console.warn("ag-Grid: unrecognised menu item " + menuItemOrString);
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
        var item = this.menuItems.filter(function (item) { return !item.isDisabled(); })[0];
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
    __decorate([
        Autowired('gridOptionsWrapper')
    ], MenuList.prototype, "gridOptionsWrapper", void 0);
    return MenuList;
}(ManagedFocusComponent));
export { MenuList };
