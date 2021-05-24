/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { loadTemplate, addCssClass, clearElement } from "../../utils/dom";
import { missing, exists } from "../../utils/generic";
var AnimateSlideCellRenderer = /** @class */ (function (_super) {
    __extends(AnimateSlideCellRenderer, _super);
    function AnimateSlideCellRenderer() {
        var _this = _super.call(this, AnimateSlideCellRenderer.TEMPLATE) || this;
        _this.refreshCount = 0;
        _this.eCurrent = _this.queryForHtmlElement('.ag-value-slide-current');
        return _this;
    }
    AnimateSlideCellRenderer.prototype.init = function (params) {
        this.refresh(params);
    };
    AnimateSlideCellRenderer.prototype.addSlideAnimation = function () {
        var _this = this;
        this.refreshCount++;
        // below we keep checking this, and stop working on the animation
        // if it no longer matches - this means another animation has started
        // and this one is stale.
        var refreshCountCopy = this.refreshCount;
        // if old animation, remove it
        if (this.ePrevious) {
            this.getGui().removeChild(this.ePrevious);
        }
        this.ePrevious = loadTemplate('<span class="ag-value-slide-previous ag-value-slide-out"></span>');
        this.ePrevious.innerHTML = this.eCurrent.innerHTML;
        this.getGui().insertBefore(this.ePrevious, this.eCurrent);
        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        window.setTimeout(function () {
            if (refreshCountCopy !== _this.refreshCount) {
                return;
            }
            addCssClass(_this.ePrevious, 'ag-value-slide-out-end');
        }, 50);
        window.setTimeout(function () {
            if (refreshCountCopy !== _this.refreshCount) {
                return;
            }
            _this.getGui().removeChild(_this.ePrevious);
            _this.ePrevious = null;
        }, 3000);
    };
    AnimateSlideCellRenderer.prototype.refresh = function (params) {
        var value = params.value;
        if (missing(value)) {
            value = '';
        }
        if (value === this.lastValue) {
            return false;
        }
        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.filterManager.isSuppressFlashingCellsBecauseFiltering()) {
            return false;
        }
        this.addSlideAnimation();
        this.lastValue = value;
        if (exists(params.valueFormatted)) {
            this.eCurrent.innerHTML = params.valueFormatted;
        }
        else if (exists(params.value)) {
            this.eCurrent.innerHTML = value;
        }
        else {
            clearElement(this.eCurrent);
        }
        return true;
    };
    AnimateSlideCellRenderer.TEMPLATE = "<span>\n            <span class=\"ag-value-slide-current\"></span>\n        </span>";
    __decorate([
        Autowired('filterManager')
    ], AnimateSlideCellRenderer.prototype, "filterManager", void 0);
    return AnimateSlideCellRenderer;
}(Component));
export { AnimateSlideCellRenderer };
