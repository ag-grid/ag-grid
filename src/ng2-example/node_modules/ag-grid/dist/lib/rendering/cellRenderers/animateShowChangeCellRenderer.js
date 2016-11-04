/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v6.2.1
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
var ARROW_UP = '&#65514;';
var ARROW_DOWN = '&#65516;';
var AnimateShowChangeCellRenderer = (function (_super) {
    __extends(AnimateShowChangeCellRenderer, _super);
    function AnimateShowChangeCellRenderer() {
        _super.call(this, AnimateShowChangeCellRenderer.TEMPLATE);
        this.refreshCount = 0;
    }
    AnimateShowChangeCellRenderer.prototype.init = function (params) {
        this.params = params;
        this.eValue = this.queryForHtmlElement('.ag-value-change-value');
        this.eDelta = this.queryForHtmlElement('.ag-value-change-delta');
        this.refresh(params);
    };
    AnimateShowChangeCellRenderer.prototype.showDelta = function (params, delta) {
        var absDelta = Math.abs(delta);
        var valueFormatted = params.formatValue(absDelta);
        var valueToUse = utils_1.Utils.exists(valueFormatted) ? valueFormatted : absDelta;
        var deltaUp = (delta >= 0);
        if (deltaUp) {
            this.eDelta.innerHTML = ARROW_UP + valueToUse;
        }
        else {
            // because negative, use ABS to remove sign
            this.eDelta.innerHTML = ARROW_DOWN + valueToUse;
        }
        // class makes it green (in ag-fresh)
        utils_1.Utils.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-up', deltaUp);
        // class makes it red (in ag-fresh)
        utils_1.Utils.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-down', !deltaUp);
    };
    AnimateShowChangeCellRenderer.prototype.setTimerToRemoveDelta = function () {
        var _this = this;
        // the refreshCount makes sure that if the value updates again while
        // the below timer is waiting, then the below timer will realise it
        // is not the most recent and will not try to remove the delta value.
        this.refreshCount++;
        var refreshCountCopy = this.refreshCount;
        setTimeout(function () {
            if (refreshCountCopy === _this.refreshCount) {
                _this.hideDeltaValue();
            }
        }, 2000);
    };
    AnimateShowChangeCellRenderer.prototype.hideDeltaValue = function () {
        utils_1.Utils.removeCssClass(this.eValue, 'ag-value-change-value-highlight');
        this.eDelta.innerHTML = '';
    };
    AnimateShowChangeCellRenderer.prototype.refresh = function (params) {
        var value = params.value;
        if (value === this.lastValue) {
            return;
        }
        if (utils_1.Utils.exists(params.valueFormatted)) {
            this.eValue.innerHTML = params.valueFormatted;
        }
        else if (utils_1.Utils.exists(params.value)) {
            this.eValue.innerHTML = value;
        }
        else {
            this.eValue.innerHTML = '';
        }
        if (typeof value === 'number' && typeof this.lastValue === 'number') {
            var delta = value - this.lastValue;
            this.showDelta(params, delta);
        }
        // highlight the current value, but only if it's not new, otherwise it
        // would get highlighted first time the value is shown
        if (this.lastValue) {
            utils_1.Utils.addCssClass(this.eValue, 'ag-value-change-value-highlight');
        }
        this.setTimerToRemoveDelta();
        this.lastValue = value;
    };
    AnimateShowChangeCellRenderer.TEMPLATE = '<span>' +
        '<span class="ag-value-change-delta"></span>' +
        '<span class="ag-value-change-value"></span>' +
        '</span>';
    return AnimateShowChangeCellRenderer;
})(component_1.Component);
exports.AnimateShowChangeCellRenderer = AnimateShowChangeCellRenderer;
