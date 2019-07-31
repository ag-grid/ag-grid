/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var utils_1 = require("../../utils");
var LoadingCellRenderer = /** @class */ (function (_super) {
    __extends(LoadingCellRenderer, _super);
    function LoadingCellRenderer() {
        return _super.call(this, LoadingCellRenderer.TEMPLATE) || this;
    }
    LoadingCellRenderer.prototype.init = function (params) {
        var eLoadingIcon = utils_1._.createIconNoSpan('groupLoading', this.gridOptionsWrapper, null);
        this.eLoadingIcon.appendChild(eLoadingIcon);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    };
    LoadingCellRenderer.prototype.refresh = function (params) {
        return false;
    };
    LoadingCellRenderer.TEMPLATE = "<div class=\"ag-stub-cell\">\n            <span class=\"ag-loading-icon\" ref=\"eLoadingIcon\"></span>\n            <span class=\"ag-loading-text\" ref=\"eLoadingText\"></span>\n        </div>";
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], LoadingCellRenderer.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLoadingIcon'),
        __metadata("design:type", HTMLElement)
    ], LoadingCellRenderer.prototype, "eLoadingIcon", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLoadingText'),
        __metadata("design:type", HTMLElement)
    ], LoadingCellRenderer.prototype, "eLoadingText", void 0);
    return LoadingCellRenderer;
}(component_1.Component));
exports.LoadingCellRenderer = LoadingCellRenderer;
