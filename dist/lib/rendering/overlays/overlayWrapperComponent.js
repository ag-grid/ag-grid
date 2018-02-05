/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var utils_1 = require("../../utils");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var componentRecipes_1 = require("../../components/framework/componentRecipes");
var OverlayWrapperComponent = (function (_super) {
    __extends(OverlayWrapperComponent, _super);
    function OverlayWrapperComponent() {
        return _super.call(this) || this;
    }
    OverlayWrapperComponent.prototype.init = function () { };
    OverlayWrapperComponent.prototype.showLoadingOverlay = function (eOverlayWrapper) {
        var _this = this;
        this.setTemplate(OverlayWrapperComponent.LOADING_WRAPPER_OVERLAY_TEMPLATE);
        this.componentRecipes.newLoadingOverlayComponent().then(function (renderer) {
            var loadingOverlayWrapper = _this.getRefElement("loadingOverlayWrapper");
            utils_1.Utils.removeAllChildren(loadingOverlayWrapper);
            loadingOverlayWrapper.appendChild(renderer.getGui());
        });
        this.showOverlay(eOverlayWrapper, this.getGui());
    };
    OverlayWrapperComponent.prototype.showNoRowsOverlay = function (eOverlayWrapper) {
        var _this = this;
        this.setTemplate(OverlayWrapperComponent.NO_ROWS_WRAPPER_OVERLAY_TEMPLATE);
        this.componentRecipes.newNoRowsOverlayComponent().then(function (renderer) {
            var noRowsOverlayWrapper = _this.getRefElement("noRowsOverlayWrapper");
            utils_1.Utils.removeAllChildren(noRowsOverlayWrapper);
            noRowsOverlayWrapper.appendChild(renderer.getGui());
        });
        this.showOverlay(eOverlayWrapper, this.getGui());
    };
    OverlayWrapperComponent.prototype.hideOverlay = function (eOverlayWrapper) {
        utils_1.Utils.removeAllChildren(eOverlayWrapper);
        eOverlayWrapper.style.display = 'none';
    };
    OverlayWrapperComponent.prototype.showOverlay = function (eOverlayWrapper, overlay) {
        if (overlay) {
            utils_1.Utils.removeAllChildren(eOverlayWrapper);
            eOverlayWrapper.style.display = '';
            eOverlayWrapper.appendChild(overlay);
        }
        else {
            console.warn('ag-Grid: unknown overlay');
            this.hideOverlay(eOverlayWrapper);
        }
    };
    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    OverlayWrapperComponent.LOADING_WRAPPER_OVERLAY_TEMPLATE = '<div class="ag-overlay-panel" role="presentation">' +
        '<div class="ag-overlay-wrapper ag-overlay-loading-wrapper" ref="loadingOverlayWrapper">[OVERLAY_TEMPLATE]</div>' +
        '</div>';
    OverlayWrapperComponent.NO_ROWS_WRAPPER_OVERLAY_TEMPLATE = '<div class="ag-overlay-panel" role="presentation">' +
        '<div class="ag-overlay-wrapper ag-overlay-no-rows-wrapper" ref="noRowsOverlayWrapper">[OVERLAY_TEMPLATE]</div>' +
        '</div>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], OverlayWrapperComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('componentRecipes'),
        __metadata("design:type", componentRecipes_1.ComponentRecipes)
    ], OverlayWrapperComponent.prototype, "componentRecipes", void 0);
    return OverlayWrapperComponent;
}(component_1.Component));
exports.OverlayWrapperComponent = OverlayWrapperComponent;
