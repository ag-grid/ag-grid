/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.4
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var component_1 = require("./component");
var context_1 = require("../context/context");
var popupService_1 = require("./popupService");
var utils_1 = require('../utils');
var svgFactory_1 = require("../svgFactory");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var MenuItemComponent = (function (_super) {
    __extends(MenuItemComponent, _super);
    function MenuItemComponent(params) {
        _super.call(this, MenuItemComponent.TEMPLATE);
        this.params = params;
        if (params.checked) {
            this.queryForHtmlElement('#eIcon').innerHTML = '&#10004;';
        }
        else if (params.icon) {
            if (utils_1.Utils.isNodeOrElement(params.icon)) {
                this.queryForHtmlElement('#eIcon').appendChild(params.icon);
            }
            else if (typeof params.icon === 'string') {
                this.queryForHtmlElement('#eIcon').innerHTML = params.icon;
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
        if (params.shortcut) {
            this.queryForHtmlElement('#eShortcut').innerHTML = params.shortcut;
        }
        if (params.childMenu) {
            this.queryForHtmlElement('#ePopupPointer').appendChild(svgFactory.createSmallArrowRightSvg());
        }
        else {
            this.queryForHtmlElement('#ePopupPointer').innerHTML = '&nbsp;';
        }
        this.queryForHtmlElement('#eName').innerHTML = params.name;
        if (params.disabled) {
            utils_1.Utils.addCssClass(this.getGui(), 'ag-menu-option-disabled');
        }
        else {
            this.addGuiEventListener('click', this.onOptionSelected.bind(this));
        }
    }
    MenuItemComponent.prototype.onOptionSelected = function () {
        this.dispatchEvent(MenuItemComponent.EVENT_ITEM_SELECTED, this.params);
        if (this.params.action) {
            this.params.action();
        }
    };
    MenuItemComponent.TEMPLATE = '<div class="ag-menu-option">' +
        '  <span id="eIcon" class="ag-menu-option-icon"></span>' +
        '  <span id="eName" class="ag-menu-option-text"></span>' +
        '  <span id="eShortcut" class="ag-menu-option-shortcut"></span>' +
        '  <span id="ePopupPointer" class="ag-menu-option-popup-pointer"></span>' +
        '</div>';
    MenuItemComponent.EVENT_ITEM_SELECTED = 'itemSelected';
    __decorate([
        context_1.Autowired('popupService'), 
        __metadata('design:type', popupService_1.PopupService)
    ], MenuItemComponent.prototype, "popupService", void 0);
    return MenuItemComponent;
})(component_1.Component);
exports.MenuItemComponent = MenuItemComponent;
