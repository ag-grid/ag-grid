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
import { TabGuardComp, KeyCode, PostConstruct } from '@ag-grid-community/core';
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
export { MenuPanel };
