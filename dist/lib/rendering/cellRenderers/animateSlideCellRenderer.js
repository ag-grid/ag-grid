/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.4.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../../utils");
var component_1 = require("../../widgets/component");
var AnimateSlideCellRenderer = (function (_super) {
    __extends(AnimateSlideCellRenderer, _super);
    function AnimateSlideCellRenderer() {
        _super.call(this, AnimateSlideCellRenderer.TEMPLATE);
        this.refreshCount = 0;
        this.eCurrent = this.queryForHtmlElement('.ag-value-slide-current');
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
        this.ePrevious = utils_1.Utils.loadTemplate('<span class="ag-value-slide-previous ag-fade-out"></span>');
        this.ePrevious.innerHTML = this.eCurrent.innerHTML;
        this.getGui().insertBefore(this.ePrevious, this.eCurrent);
        // having timeout of 0 allows use to skip to the next css turn,
        // so we know the previous css classes have been applied. so the
        // complex set of setTimeout below creates the animation
        setTimeout(function () {
            if (refreshCountCopy !== _this.refreshCount) {
                return;
            }
            utils_1.Utils.addCssClass(_this.ePrevious, 'ag-fade-out-end');
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
    AnimateSlideCellRenderer.TEMPLATE = '<span>' +
        '<span class="ag-value-slide-current"></span>' +
        '</span>';
    return AnimateSlideCellRenderer;
})(component_1.Component);
exports.AnimateSlideCellRenderer = AnimateSlideCellRenderer;
