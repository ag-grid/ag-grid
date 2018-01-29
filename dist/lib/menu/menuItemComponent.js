// ag-grid-enterprise v16.0.1
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_1 = require("ag-grid");
var MenuItemComponent = (function (_super) {
    __extends(MenuItemComponent, _super);
    function MenuItemComponent(params) {
        var _this = _super.call(this, MenuItemComponent.TEMPLATE) || this;
        _this.params = params;
        return _this;
    }
    MenuItemComponent.prototype.init = function () {
        var _this = this;
        if (this.params.checked) {
            this.queryForHtmlElement('#eIcon').innerHTML = '<span class="ag-icon ag-icon-tick"></span>';
        }
        else if (this.params.icon) {
            if (ag_grid_1.Utils.isNodeOrElement(this.params.icon)) {
                this.queryForHtmlElement('#eIcon').appendChild(this.params.icon);
            }
            else if (typeof this.params.icon === 'string') {
                this.queryForHtmlElement('#eIcon').innerHTML = this.params.icon;
            }
            else {
                console.log('ag-Grid: menu item icon must be DOM node or string');
            }
        }
        else {
            // if i didn't put space here, the alignment was messed up, probably
            // fixable with CSS but i was spending to much time trying to figure
            // it out.
            this.queryForHtmlElement('#eIcon').innerHTML = '&nbsp;';
        }
        if (this.params.tooltip) {
            this.getGui().setAttribute('title', this.params.tooltip);
        }
        if (this.params.shortcut) {
            this.queryForHtmlElement('#eShortcut').innerHTML = this.params.shortcut;
        }
        if (this.params.subMenu) {
            if (this.gridOptionsWrapper.isEnableRtl()) {
                // for RTL, we show arrow going left
                this.queryForHtmlElement('#ePopupPointer').classList.add('ag-icon-small-left');
            }
            else {
                // for normal, we show arrow going right
                this.queryForHtmlElement('#ePopupPointer').classList.add('ag-icon-small-right');
            }
        }
        else {
            this.queryForHtmlElement('#ePopupPointer').innerHTML = '&nbsp;';
        }
        this.queryForHtmlElement('#eName').innerHTML = this.params.name;
        if (this.params.disabled) {
            ag_grid_1.Utils.addCssClass(this.getGui(), 'ag-menu-option-disabled');
        }
        else {
            this.addGuiEventListener('click', this.onOptionSelected.bind(this));
        }
        if (this.params.cssClasses) {
            this.params.cssClasses.forEach(function (it) { return ag_grid_1.Utils.addCssClass(_this.getGui(), it); });
        }
    };
    MenuItemComponent.prototype.onOptionSelected = function (mouseEvent) {
        var event = {
            type: MenuItemComponent.EVENT_ITEM_SELECTED,
            action: this.params.action,
            checked: this.params.checked,
            cssClasses: this.params.cssClasses,
            disabled: this.params.disabled,
            icon: this.params.icon,
            name: this.params.name,
            shortcut: this.params.shortcut,
            subMenu: this.params.subMenu,
            tooltip: this.params.tooltip,
            mouseEvent: mouseEvent
        };
        this.dispatchEvent(event);
        if (this.params.action) {
            this.params.action();
        }
    };
    MenuItemComponent.prototype.destroy = function () {
        // console.log('MenuItemComponent->destroy() ' + this.instance);
        _super.prototype.destroy.call(this);
    };
    // private instance = Math.random();
    MenuItemComponent.TEMPLATE = '<div class="ag-menu-option">' +
        '  <span id="eIcon" class="ag-menu-option-icon"></span>' +
        '  <span id="eName" class="ag-menu-option-text"></span>' +
        '  <span id="eShortcut" class="ag-menu-option-shortcut"></span>' +
        '  <span id="ePopupPointer" class="ag-menu-option-popup-pointer"></span>' +
        '</div>';
    MenuItemComponent.EVENT_ITEM_SELECTED = 'itemSelected';
    __decorate([
        ag_grid_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", ag_grid_1.GridOptionsWrapper)
    ], MenuItemComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        ag_grid_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MenuItemComponent.prototype, "init", null);
    return MenuItemComponent;
}(ag_grid_1.Component));
exports.MenuItemComponent = MenuItemComponent;
