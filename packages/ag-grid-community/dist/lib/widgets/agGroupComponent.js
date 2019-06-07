/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var utils_1 = require("../utils");
var AgGroupComponent = /** @class */ (function (_super) {
    __extends(AgGroupComponent, _super);
    function AgGroupComponent(params) {
        var _this = _super.call(this, AgGroupComponent.TEMPLATE) || this;
        _this.label = params.label;
        _this.items = params.items || [];
        return _this;
    }
    AgGroupComponent.prototype.init = function () {
        if (this.items.length) {
            var initialItems = this.items;
            this.items = [];
            this.addItems(initialItems);
        }
        this.eLabel.innerHTML = this.label;
    };
    AgGroupComponent.prototype.addItems = function (items) {
        items.forEach(this.addItem);
    };
    AgGroupComponent.prototype.addItem = function (item) {
        var eGui = this.getGui();
        var el = item instanceof component_1.Component ? item.getGui() : item;
        utils_1._.addCssClass(el, 'ag-group-item');
        eGui.appendChild(el);
        this.items.push(el);
    };
    AgGroupComponent.TEMPLATE = "<div class=\"ag-group-component\">\n            <div ref=\"eLabel\" class=\"ag-group-component-label\">\n        </div>\n        ";
    __decorate([
        componentAnnotations_1.RefSelector("eLabel"),
        __metadata("design:type", HTMLElement)
    ], AgGroupComponent.prototype, "eLabel", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], AgGroupComponent.prototype, "init", null);
    return AgGroupComponent;
}(component_1.Component));
exports.AgGroupComponent = AgGroupComponent;
