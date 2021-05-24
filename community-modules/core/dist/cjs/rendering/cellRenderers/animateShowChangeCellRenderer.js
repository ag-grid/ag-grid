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
var generic_1 = require("../../utils/generic");
var dom_1 = require("../../utils/dom");
var ARROW_UP = '\u2191';
var ARROW_DOWN = '\u2193';
var AnimateShowChangeCellRenderer = /** @class */ (function (_super) {
    __extends(AnimateShowChangeCellRenderer, _super);
    function AnimateShowChangeCellRenderer() {
        var _this = _super.call(this, AnimateShowChangeCellRenderer.TEMPLATE) || this;
        _this.refreshCount = 0;
        return _this;
    }
    AnimateShowChangeCellRenderer.prototype.init = function (params) {
        // this.params = params;
        this.eValue = this.queryForHtmlElement('.ag-value-change-value');
        this.eDelta = this.queryForHtmlElement('.ag-value-change-delta');
        this.refresh(params);
    };
    AnimateShowChangeCellRenderer.prototype.showDelta = function (params, delta) {
        var absDelta = Math.abs(delta);
        var valueFormatted = params.formatValue(absDelta);
        var valueToUse = generic_1.exists(valueFormatted) ? valueFormatted : absDelta;
        var deltaUp = (delta >= 0);
        if (deltaUp) {
            this.eDelta.innerHTML = ARROW_UP + valueToUse;
        }
        else {
            // because negative, use ABS to remove sign
            this.eDelta.innerHTML = ARROW_DOWN + valueToUse;
        }
        dom_1.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-up', deltaUp);
        dom_1.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-down', !deltaUp);
    };
    AnimateShowChangeCellRenderer.prototype.setTimerToRemoveDelta = function () {
        var _this = this;
        // the refreshCount makes sure that if the value updates again while
        // the below timer is waiting, then the below timer will realise it
        // is not the most recent and will not try to remove the delta value.
        this.refreshCount++;
        var refreshCountCopy = this.refreshCount;
        window.setTimeout(function () {
            if (refreshCountCopy === _this.refreshCount) {
                _this.hideDeltaValue();
            }
        }, 2000);
    };
    AnimateShowChangeCellRenderer.prototype.hideDeltaValue = function () {
        dom_1.removeCssClass(this.eValue, 'ag-value-change-value-highlight');
        dom_1.clearElement(this.eDelta);
    };
    AnimateShowChangeCellRenderer.prototype.refresh = function (params) {
        var value = params.value;
        if (value === this.lastValue) {
            return false;
        }
        if (generic_1.exists(params.valueFormatted)) {
            this.eValue.innerHTML = params.valueFormatted;
        }
        else if (generic_1.exists(params.value)) {
            this.eValue.innerHTML = value;
        }
        else {
            dom_1.clearElement(this.eValue);
        }
        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.filterManager.isSuppressFlashingCellsBecauseFiltering()) {
            return false;
        }
        if (typeof value === 'number' && typeof this.lastValue === 'number') {
            var delta = value - this.lastValue;
            this.showDelta(params, delta);
        }
        // highlight the current value, but only if it's not new, otherwise it
        // would get highlighted first time the value is shown
        if (this.lastValue) {
            dom_1.addCssClass(this.eValue, 'ag-value-change-value-highlight');
        }
        this.setTimerToRemoveDelta();
        this.lastValue = value;
        return true;
    };
    AnimateShowChangeCellRenderer.TEMPLATE = '<span>' +
        '<span class="ag-value-change-delta"></span>' +
        '<span class="ag-value-change-value"></span>' +
        '</span>';
    __decorate([
        context_1.Autowired('filterManager')
    ], AnimateShowChangeCellRenderer.prototype, "filterManager", void 0);
    return AnimateShowChangeCellRenderer;
}(component_1.Component));
exports.AnimateShowChangeCellRenderer = AnimateShowChangeCellRenderer;

//# sourceMappingURL=animateShowChangeCellRenderer.js.map
