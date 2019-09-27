/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var NoRowsOverlayComponent = /** @class */ (function (_super) {
    __extends(NoRowsOverlayComponent, _super);
    function NoRowsOverlayComponent() {
        return _super.call(this) || this;
    }
    NoRowsOverlayComponent.prototype.init = function (params) {
        var template = this.gridOptionsWrapper.getOverlayNoRowsTemplate() ?
            this.gridOptionsWrapper.getOverlayNoRowsTemplate() : NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var localisedTemplate = template.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
        this.setTemplate(localisedTemplate);
    };
    NoRowsOverlayComponent.DEFAULT_NO_ROWS_TEMPLATE = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], NoRowsOverlayComponent.prototype, "gridOptionsWrapper", void 0);
    return NoRowsOverlayComponent;
}(component_1.Component));
exports.NoRowsOverlayComponent = NoRowsOverlayComponent;
