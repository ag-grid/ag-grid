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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, PostConstruct } from "../context/context";
import { AgMenuItemComponent } from "./agMenuItemComponent";
import { TabGuardComp } from "./tabGuardComp";
import { KeyCode } from "../constants/keyCode";
import { loadTemplate } from "../utils/dom";
import { last } from "../utils/array";
import { AgPromise } from "../utils/promise";
import { stopPropagationForAgGrid } from "../utils/event";
var AgMenuList = /** @class */ (function (_super) {
    __extends(AgMenuList, _super);
    function AgMenuList(level, params) {
        if (level === void 0) { level = 0; }
        var _this = _super.call(this, /* html */ "<div class=\"ag-menu-list\" role=\"tree\"></div>") || this;
        _this.level = level;
        _this.menuItems = [];
        _this.params = params !== null && params !== void 0 ? params : {
            column: null,
            node: null,
            value: null
        };
        return _this;
    }
    AgMenuList.prototype.postConstruct = function () {
        var _this = this;
        this.initialiseTabGuard({
            onTabKeyDown: function (e) { return _this.onTabKeyDown(e); },
            handleKeyDown: function (e) { return _this.handleKeyDown(e); },
            onFocusIn: function (e) { return _this.handleFocusIn(e); },
            onFocusOut: function (e) { return _this.handleFocusOut(e); },
        });
    };
    AgMenuList.prototype.onTabKeyDown = function (e) {
        var parent = this.getParentComponent();
        var parentGui = parent && parent.getGui();
        var isManaged = parentGui && parentGui.classList.contains('ag-focus-managed');
        if (!isManaged) {
            e.preventDefault();
        }
        if (e.shiftKey) {
            this.closeIfIsChild(e);
        }
    };
    AgMenuList.prototype.handleKeyDown = function (e) {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
            case KeyCode.LEFT:
                e.preventDefault();
                this.handleNavKey(e.key);
                break;
            case KeyCode.ESCAPE:
                if (this.closeIfIsChild()) {
                    stopPropagationForAgGrid(e);
                }
                break;
        }
    };
    AgMenuList.prototype.handleFocusIn = function (e) {
        var _a, _b;
        // if focus is coming from outside the menu list, then re-activate an item
        var oldFocusedElement = e.relatedTarget;
        if (!this.tabGuardCtrl.isTabGuard(oldFocusedElement) && (this.getGui().contains(oldFocusedElement) || ((_b = (_a = this.activeMenuItem) === null || _a === void 0 ? void 0 : _a.getSubMenuGui()) === null || _b === void 0 ? void 0 : _b.contains(oldFocusedElement)))) {
            return;
        }
        if (this.activeMenuItem) {
            this.activeMenuItem.activate();
        }
        else {
            this.activateFirstItem();
        }
    };
    AgMenuList.prototype.handleFocusOut = function (e) {
        var _a;
        // if focus is going outside the menu list, deactivate the current item
        var newFocusedElement = e.relatedTarget;
        if (!this.activeMenuItem || this.getGui().contains(newFocusedElement) || ((_a = this.activeMenuItem.getSubMenuGui()) === null || _a === void 0 ? void 0 : _a.contains(newFocusedElement))) {
            return;
        }
        if (!this.activeMenuItem.isSubMenuOpening()) {
            this.activeMenuItem.deactivate();
        }
    };
    AgMenuList.prototype.clearActiveItem = function () {
        if (this.activeMenuItem) {
            this.activeMenuItem.deactivate();
            this.activeMenuItem = null;
        }
    };
    AgMenuList.prototype.addMenuItems = function (menuItems) {
        var _this = this;
        if (menuItems == null) {
            return;
        }
        AgPromise.all(menuItems.map(function (menuItemOrString) {
            if (menuItemOrString === 'separator') {
                return AgPromise.resolve({ eGui: _this.createSeparator() });
            }
            else if (typeof menuItemOrString === 'string') {
                console.warn("AG Grid: unrecognised menu item ".concat(menuItemOrString));
                return AgPromise.resolve({ eGui: null });
            }
            else {
                return _this.addItem(menuItemOrString);
            }
        })).then(function (elements) {
            elements.forEach(function (element) {
                if (element === null || element === void 0 ? void 0 : element.eGui) {
                    _this.appendChild(element.eGui);
                    if (element.comp) {
                        _this.menuItems.push(element.comp);
                    }
                }
            });
        });
    };
    AgMenuList.prototype.addItem = function (menuItemDef) {
        var _this = this;
        var menuItem = this.createManagedBean(new AgMenuItemComponent());
        return menuItem.init({
            menuItemDef: menuItemDef,
            isAnotherSubMenuOpen: function () { return _this.menuItems.some(function (m) { return m.isSubMenuOpen(); }); },
            level: this.level,
            contextParams: this.params
        }).then(function () {
            menuItem.setParentComponent(_this);
            _this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_CLOSE_MENU, function (event) {
                _this.dispatchEvent(event);
            });
            _this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, function (event) {
                if (_this.activeMenuItem && _this.activeMenuItem !== event.menuItem) {
                    _this.activeMenuItem.deactivate();
                }
                _this.activeMenuItem = event.menuItem;
            });
            return {
                comp: menuItem,
                eGui: menuItem.getGui()
            };
        });
    };
    AgMenuList.prototype.activateFirstItem = function () {
        var item = this.menuItems.filter(function (currentItem) { return !currentItem.isDisabled(); })[0];
        if (!item) {
            return;
        }
        item.activate();
    };
    AgMenuList.prototype.createSeparator = function () {
        var separatorHtml = /* html */ "\n            <div class=\"ag-menu-separator\" aria-hidden=\"true\">\n                <div class=\"ag-menu-separator-part\"></div>\n                <div class=\"ag-menu-separator-part\"></div>\n                <div class=\"ag-menu-separator-part\"></div>\n                <div class=\"ag-menu-separator-part\"></div>\n            </div>";
        return loadTemplate(separatorHtml);
    };
    AgMenuList.prototype.handleNavKey = function (key) {
        switch (key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                var nextItem = this.findNextItem(key === KeyCode.UP);
                if (nextItem && nextItem !== this.activeMenuItem) {
                    nextItem.activate();
                }
                return;
        }
        var left = this.gridOptionsService.get('enableRtl') ? KeyCode.RIGHT : KeyCode.LEFT;
        if (key === left) {
            this.closeIfIsChild();
        }
        else {
            this.openChild();
        }
    };
    AgMenuList.prototype.closeIfIsChild = function (e) {
        var parentItem = this.getParentComponent();
        if (parentItem && parentItem instanceof AgMenuItemComponent) {
            if (e) {
                e.preventDefault();
            }
            parentItem.closeSubMenu();
            parentItem.getGui().focus();
            return true;
        }
        return false;
    };
    AgMenuList.prototype.openChild = function () {
        if (this.activeMenuItem) {
            this.activeMenuItem.openSubMenu(true);
        }
    };
    AgMenuList.prototype.findNextItem = function (up) {
        var items = this.menuItems.filter(function (item) { return !item.isDisabled(); });
        if (!items.length) {
            return;
        }
        if (!this.activeMenuItem) {
            return up ? last(items) : items[0];
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
        if (foundCurrent && !nextItem) {
            // start again from the beginning (/end)
            return items[0];
        }
        return nextItem || this.activeMenuItem;
    };
    AgMenuList.prototype.destroy = function () {
        this.clearActiveItem();
        _super.prototype.destroy.call(this);
    };
    __decorate([
        Autowired('focusService')
    ], AgMenuList.prototype, "focusService", void 0);
    __decorate([
        PostConstruct
    ], AgMenuList.prototype, "postConstruct", null);
    return AgMenuList;
}(TabGuardComp));
export { AgMenuList };
