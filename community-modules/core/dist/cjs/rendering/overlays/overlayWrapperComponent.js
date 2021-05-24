/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var component_1 = require("../../widgets/component");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var dom_1 = require("../../utils/dom");
var layoutFeature_1 = require("../../styling/layoutFeature");
var eventKeys_1 = require("../../eventKeys");
var LoadingType;
(function (LoadingType) {
    LoadingType[LoadingType["Loading"] = 0] = "Loading";
    LoadingType[LoadingType["NoRows"] = 1] = "NoRows";
})(LoadingType || (LoadingType = {}));
var OverlayWrapperComponent = /** @class */ (function (_super) {
    __extends(OverlayWrapperComponent, _super);
    function OverlayWrapperComponent() {
        var _this = _super.call(this, OverlayWrapperComponent.TEMPLATE) || this;
        _this.inProgress = false;
        _this.destroyRequested = false;
        return _this;
    }
    OverlayWrapperComponent.prototype.updateLayoutClasses = function (params) {
        dom_1.addOrRemoveCssClass(this.eOverlayWrapper, layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
        dom_1.addOrRemoveCssClass(this.eOverlayWrapper, layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
        dom_1.addOrRemoveCssClass(this.eOverlayWrapper, layoutFeature_1.LayoutCssClasses.PRINT, params.print);
    };
    OverlayWrapperComponent.prototype.postConstruct = function () {
        this.createManagedBean(new layoutFeature_1.LayoutFeature(this));
        this.setDisplayed(false);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_DATA_UPDATED, this.onRowDataChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
            this.showLoadingOverlay();
        }
        this.gridApi.registerOverlayWrapperComp(this);
    };
    OverlayWrapperComponent.prototype.setWrapperTypeClass = function (loadingType) {
        dom_1.addOrRemoveCssClass(this.eOverlayWrapper, 'ag-overlay-loading-wrapper', loadingType === LoadingType.Loading);
        dom_1.addOrRemoveCssClass(this.eOverlayWrapper, 'ag-overlay-no-rows-wrapper', loadingType === LoadingType.NoRows);
    };
    OverlayWrapperComponent.prototype.showLoadingOverlay = function () {
        if (this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
            return;
        }
        var workItem = this.userComponentFactory.newLoadingOverlayComponent({
            api: this.gridOptionsWrapper.getApi()
        });
        this.showOverlay(workItem, LoadingType.Loading);
    };
    OverlayWrapperComponent.prototype.showNoRowsOverlay = function () {
        if (this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
            return;
        }
        var workItem = this.userComponentFactory.newNoRowsOverlayComponent({
            api: this.gridOptionsWrapper.getApi()
        });
        this.showOverlay(workItem, LoadingType.NoRows);
    };
    OverlayWrapperComponent.prototype.showOverlay = function (workItem, type) {
        var _this = this;
        if (this.inProgress) {
            return;
        }
        this.setWrapperTypeClass(type);
        this.destroyActiveOverlay();
        this.inProgress = true;
        if (workItem) {
            workItem.then(function (comp) {
                _this.inProgress = false;
                _this.eOverlayWrapper.appendChild(comp.getGui());
                _this.activeOverlay = comp;
                if (_this.destroyRequested) {
                    _this.destroyRequested = false;
                    _this.destroyActiveOverlay();
                }
            });
        }
        this.setDisplayed(true);
    };
    OverlayWrapperComponent.prototype.destroyActiveOverlay = function () {
        if (this.inProgress) {
            this.destroyRequested = true;
            return;
        }
        if (!this.activeOverlay) {
            return;
        }
        this.activeOverlay = this.getContext().destroyBean(this.activeOverlay);
        dom_1.clearElement(this.eOverlayWrapper);
    };
    OverlayWrapperComponent.prototype.hideOverlay = function () {
        this.destroyActiveOverlay();
        this.setDisplayed(false);
    };
    OverlayWrapperComponent.prototype.destroy = function () {
        this.destroyActiveOverlay();
        _super.prototype.destroy.call(this);
    };
    OverlayWrapperComponent.prototype.showOrHideOverlay = function () {
        var isEmpty = this.paginationProxy.isEmpty();
        var isSuppressNoRowsOverlay = this.gridOptionsWrapper.isSuppressNoRowsOverlay();
        if (isEmpty && !isSuppressNoRowsOverlay) {
            this.showNoRowsOverlay();
        }
        else {
            this.hideOverlay();
        }
    };
    OverlayWrapperComponent.prototype.onRowDataChanged = function () {
        this.showOrHideOverlay();
    };
    OverlayWrapperComponent.prototype.onNewColumnsLoaded = function () {
        // hide overlay if columns and rows exist, this can happen if columns are loaded after data.
        // this problem exists before of the race condition between the services (column controller in this case)
        // and the view (grid panel). if the model beans were all initialised first, and then the view beans second,
        // this race condition would not happen.
        if (this.columnController.isReady() && !this.paginationProxy.isEmpty()) {
            this.hideOverlay();
        }
    };
    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    OverlayWrapperComponent.TEMPLATE = "\n        <div class=\"ag-overlay\" aria-hidden=\"true\">\n            <div class=\"ag-overlay-panel\">\n                <div class=\"ag-overlay-wrapper\" ref=\"eOverlayWrapper\"></div>\n            </div>\n        </div>";
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], OverlayWrapperComponent.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('paginationProxy')
    ], OverlayWrapperComponent.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], OverlayWrapperComponent.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], OverlayWrapperComponent.prototype, "columnController", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eOverlayWrapper')
    ], OverlayWrapperComponent.prototype, "eOverlayWrapper", void 0);
    __decorate([
        context_1.PostConstruct
    ], OverlayWrapperComponent.prototype, "postConstruct", null);
    return OverlayWrapperComponent;
}(component_1.Component));
exports.OverlayWrapperComponent = OverlayWrapperComponent;

//# sourceMappingURL=overlayWrapperComponent.js.map
