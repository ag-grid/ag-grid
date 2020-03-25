/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Autowired } from "../../context/context";
import { Component } from "../../widgets/component";
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
        Autowired('gridOptionsWrapper')
    ], NoRowsOverlayComponent.prototype, "gridOptionsWrapper", void 0);
    return NoRowsOverlayComponent;
}(Component));
export { NoRowsOverlayComponent };
