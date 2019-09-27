/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
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
var component_1 = require("../../widgets/component");
var utils_1 = require("../../utils");
var filterManager_1 = require("../../filter/filterManager");
var context_1 = require("../../context/context");
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
        var valueToUse = utils_1._.exists(valueFormatted) ? valueFormatted : absDelta;
        var deltaUp = (delta >= 0);
        if (deltaUp) {
            this.eDelta.innerHTML = ARROW_UP + valueToUse;
        }
        else {
            // because negative, use ABS to remove sign
            this.eDelta.innerHTML = ARROW_DOWN + valueToUse;
        }
        // class makes it green (in ag-fresh)
        utils_1._.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-up', deltaUp);
        // class makes it red (in ag-fresh)
        utils_1._.addOrRemoveCssClass(this.eDelta, 'ag-value-change-delta-down', !deltaUp);
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
        utils_1._.removeCssClass(this.eValue, 'ag-value-change-value-highlight');
        utils_1._.clearElement(this.eDelta);
    };
    AnimateShowChangeCellRenderer.prototype.refresh = function (params) {
        var value = params.value;
        if (value === this.lastValue) {
            return;
        }
        if (utils_1._.exists(params.valueFormatted)) {
            this.eValue.innerHTML = params.valueFormatted;
        }
        else if (utils_1._.exists(params.value)) {
            this.eValue.innerHTML = value;
        }
        else {
            utils_1._.clearElement(this.eValue);
        }
        // we don't show the delta if we are in the middle of a filter. see comment on FilterManager
        // with regards processingFilterChange
        if (this.filterManager.isSuppressFlashingCellsBecauseFiltering()) {
            return;
        }
        if (typeof value === 'number' && typeof this.lastValue === 'number') {
            var delta = value - this.lastValue;
            this.showDelta(params, delta);
        }
        // highlight the current value, but only if it's not new, otherwise it
        // would get highlighted first time the value is shown
        if (this.lastValue) {
            utils_1._.addCssClass(this.eValue, 'ag-value-change-value-highlight');
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
        context_1.Autowired('filterManager'),
        __metadata("design:type", filterManager_1.FilterManager)
    ], AnimateShowChangeCellRenderer.prototype, "filterManager", void 0);
    return AnimateShowChangeCellRenderer;
}(component_1.Component));
exports.AnimateShowChangeCellRenderer = AnimateShowChangeCellRenderer;
