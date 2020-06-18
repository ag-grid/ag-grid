/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
import { Autowired, PostConstruct } from '../../context/context';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { _ } from '../../utils';
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
    OverlayWrapperComponent.prototype.postConstruct = function () {
        this.gridOptionsWrapper.addLayoutElement(this.eOverlayWrapper);
        this.setDisplayed(false);
    };
    OverlayWrapperComponent.prototype.setWrapperTypeClass = function (loadingType) {
        _.addOrRemoveCssClass(this.eOverlayWrapper, 'ag-overlay-loading-wrapper', loadingType === LoadingType.Loading);
        _.addOrRemoveCssClass(this.eOverlayWrapper, 'ag-overlay-no-rows-wrapper', loadingType === LoadingType.NoRows);
    };
    OverlayWrapperComponent.prototype.showLoadingOverlay = function () {
        var workItem = this.userComponentFactory.newLoadingOverlayComponent({
            api: this.gridOptionsWrapper.getApi()
        });
        this.showOverlay(workItem, LoadingType.Loading);
    };
    OverlayWrapperComponent.prototype.showNoRowsOverlay = function () {
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
        workItem.then(function (comp) {
            _this.inProgress = false;
            _this.eOverlayWrapper.appendChild(comp.getGui());
            _this.activeOverlay = comp;
            if (_this.destroyRequested) {
                _this.destroyRequested = false;
                _this.destroyActiveOverlay();
            }
        });
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
        _.clearElement(this.eOverlayWrapper);
    };
    OverlayWrapperComponent.prototype.hideOverlay = function () {
        this.destroyActiveOverlay();
        this.setDisplayed(false);
    };
    OverlayWrapperComponent.prototype.destroy = function () {
        this.destroyActiveOverlay();
        _super.prototype.destroy.call(this);
    };
    // wrapping in outer div, and wrapper, is needed to center the loading icon
    // The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
    OverlayWrapperComponent.TEMPLATE = "\n        <div class=\"ag-overlay\" aria-hidden=\"true\">\n            <div class=\"ag-overlay-panel\">\n                <div class=\"ag-overlay-wrapper\" ref=\"eOverlayWrapper\"></div>\n            </div>\n        </div>";
    __decorate([
        Autowired('gridOptionsWrapper')
    ], OverlayWrapperComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], OverlayWrapperComponent.prototype, "userComponentFactory", void 0);
    __decorate([
        RefSelector('eOverlayWrapper')
    ], OverlayWrapperComponent.prototype, "eOverlayWrapper", void 0);
    __decorate([
        PostConstruct
    ], OverlayWrapperComponent.prototype, "postConstruct", null);
    return OverlayWrapperComponent;
}(Component));
export { OverlayWrapperComponent };
