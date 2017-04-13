/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils");
var component_1 = require("../../widgets/component");
var AnimateSlideCellRenderer = (function (_super) {
    __extends(AnimateSlideCellRenderer, _super);
    function AnimateSlideCellRenderer() {
        var _this = _super.call(this, AnimateSlideCellRenderer.TEMPLATE) || this;
        _this.refreshCount = 0;
        _this.eCurrent = _this.queryForHtmlElement('.ag-value-slide-current');
        return _this;
    }
    AnimateSlideCellRenderer.prototype.init = function (params) {
        this.params = params;
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
        this.ePrevious = utils_1.Utils.loadTemplate('<span class="ag-value-slide-previous ag-value-slide-out"></span>');
        this.ePrevious.innerHTML = this.eCurrent.innerHTML;
        this.getGui().insertBefore(this.ePrevious, this.eCurrent);
        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        setTimeout(function () {
            if (refreshCountCopy !== _this.refreshCount) {
                return;
            }
            utils_1.Utils.addCssClass(_this.ePrevious, 'ag-value-slide-out-end');
        }, 50);
        setTimeout(function () {
            if (refreshCountCopy !== _this.refreshCount) {
                return;
            }
            _this.getGui().removeChild(_this.ePrevious);
            _this.ePrevious = null;
        }, 3000);
    };
    AnimateSlideCellRenderer.prototype.refresh = function (params) {
        var value = params.value;
        if (utils_1.Utils.missing(value)) {
            value = '';
        }
        if (value === this.lastValue) {
            return;
        }
        this.addSlideAnimation();
        this.lastValue = value;
        if (utils_1.Utils.exists(params.valueFormatted)) {
            this.eCurrent.innerHTML = params.valueFormatted;
        }
        else if (utils_1.Utils.exists(params.value)) {
            this.eCurrent.innerHTML = value;
        }
        else {
            this.eCurrent.innerHTML = '';
        }
    };
    return AnimateSlideCellRenderer;
}(component_1.Component));
AnimateSlideCellRenderer.TEMPLATE = '<span>' +
    '<span class="ag-value-slide-current"></span>' +
    '</span>';
exports.AnimateSlideCellRenderer = AnimateSlideCellRenderer;
