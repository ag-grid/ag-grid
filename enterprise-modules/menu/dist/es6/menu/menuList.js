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
import { Autowired, Component, _ } from "@ag-grid-community/core";
import { MenuItemComponent } from "./menuItemComponent";
var MenuList = /** @class */ (function (_super) {
    __extends(MenuList, _super);
    function MenuList() {
        var _this = _super.call(this, MenuList.TEMPLATE) || this;
        _this.timerCount = 0;
        _this.removeChildFuncs = [];
        return _this;
    }
    MenuList.prototype.clearActiveItem = function () {
        this.removeActiveItem();
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
        var cMenuItem = new MenuItemComponent(menuItemDef);
        this.getContext().wireBean(cMenuItem);
        this.getGui().appendChild(cMenuItem.getGui());
        this.addDestroyFunc(function () { return cMenuItem.destroy(); });
        cMenuItem.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, function (event) {
            if (menuItemDef.subMenu && !menuItemDef.action) {
                _this.showChildMenu(menuItemDef, cMenuItem, event.mouseEvent);
            }
            else {
                _this.dispatchEvent(event);
            }
        });
        cMenuItem.addGuiEventListener('mouseenter', this.mouseEnterItem.bind(this, menuItemDef, cMenuItem));
        cMenuItem.addGuiEventListener('mouseleave', this.mouseLeaveItem.bind(this));
    };
    MenuList.prototype.mouseEnterItem = function (menuItemParams, menuItem) {
        if (menuItemParams.disabled) {
            return;
        }
        if (this.activeMenuItemParams !== menuItemParams) {
            this.removeChildPopup();
        }
        this.removeActiveItem();
        this.activeMenuItemParams = menuItemParams;
        this.activeMenuItem = menuItem;
        _.addCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');
        if (menuItemParams.subMenu) {
            this.addHoverForChildPopup(menuItemParams, menuItem);
        }
    };
    MenuList.prototype.mouseLeaveItem = function () {
        this.timerCount++;
        this.removeActiveItem();
    };
    MenuList.prototype.removeActiveItem = function () {
        if (this.activeMenuItem) {
            _.removeCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');
            this.activeMenuItem = null;
            this.activeMenuItemParams = null;
        }
    };
    MenuList.prototype.addHoverForChildPopup = function (menuItemDef, menuItemComp) {
        var _this = this;
        var timerCountCopy = this.timerCount;
        window.setTimeout(function () {
            var shouldShow = timerCountCopy === _this.timerCount;
            var showingThisMenu = _this.subMenuParentDef === menuItemDef;
            if (shouldShow && !showingThisMenu) {
                _this.showChildMenu(menuItemDef, menuItemComp, null);
            }
        }, 300);
    };
    MenuList.prototype.addSeparator = function () {
        this.getGui().appendChild(_.loadTemplate(MenuList.SEPARATOR_TEMPLATE));
    };
    MenuList.prototype.showChildMenu = function (menuItemDef, menuItemComp, mouseEvent) {
        var _this = this;
        this.removeChildPopup();
        var childMenu = new MenuList();
        this.getContext().wireBean(childMenu);
        childMenu.addMenuItems(menuItemDef.subMenu);
        var ePopup = _.loadTemplate('<div class="ag-menu"></div>');
        ePopup.appendChild(childMenu.getGui());
        var hidePopupFunc = this.popupService.addAsModalPopup(ePopup, true, undefined, mouseEvent);
        this.popupService.positionPopupForMenu({
            eventSource: menuItemComp.getGui(),
            ePopup: ePopup
        });
        this.subMenuParentDef = menuItemDef;
        var selectedListener = function (event) {
            _this.dispatchEvent(event);
        };
        childMenu.addEventListener(MenuItemComponent.EVENT_ITEM_SELECTED, selectedListener);
        this.removeChildFuncs.push(function () {
            childMenu.clearActiveItem();
            childMenu.destroy();
            _this.subMenuParentDef = null;
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
    MenuList.TEMPLATE = '<div class="ag-menu-list"></div>';
    MenuList.SEPARATOR_TEMPLATE = "<div class=\"ag-menu-separator\">\n            <span class=\"ag-menu-separator-cell\"></span>\n            <span class=\"ag-menu-separator-cell\"></span>\n            <span class=\"ag-menu-separator-cell\"></span>\n            <span class=\"ag-menu-separator-cell\"></span>\n        </div>";
    __decorate([
        Autowired('popupService')
    ], MenuList.prototype, "popupService", void 0);
    return MenuList;
}(Component));
export { MenuList };
