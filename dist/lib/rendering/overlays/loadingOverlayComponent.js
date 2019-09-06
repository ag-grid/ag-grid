/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var LoadingOverlayComponent = /** @class */ (function (_super) {
    __extends(LoadingOverlayComponent, _super);
    function LoadingOverlayComponent() {
        return _super.call(this) || this;
    }
    LoadingOverlayComponent.prototype.init = function (params) {
        var template = this.gridOptionsWrapper.getOverlayLoadingTemplate() ?
            this.gridOptionsWrapper.getOverlayLoadingTemplate() : LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE;
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        var localisedTemplate = template.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
        this.setTemplate(localisedTemplate);
    };
    LoadingOverlayComponent.DEFAULT_LOADING_OVERLAY_TEMPLATE = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], LoadingOverlayComponent.prototype, "gridOptionsWrapper", void 0);
    return LoadingOverlayComponent;
}(component_1.Component));
exports.LoadingOverlayComponent = LoadingOverlayComponent;
