/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
Object.defineProperty(exports, "__esModule", { value: true });
var agAbstractInputField_1 = require("./agAbstractInputField");
var utils_1 = require("../utils");
var AgInputRange = /** @class */ (function (_super) {
    __extends(AgInputRange, _super);
    function AgInputRange(config) {
        var _this = _super.call(this) || this;
        _this.className = 'ag-range-field';
        _this.displayTag = 'input';
        _this.inputType = 'range';
        _this.setTemplate(_this.TEMPLATE.replace(/%displayField%/g, _this.displayTag));
        if (config) {
            _this.config = config;
        }
        return _this;
    }
    AgInputRange.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        var _a = this.config, min = _a.min, max = _a.max, step = _a.step;
        if (min != null) {
            this.setMinValue(min);
        }
        if (max != null) {
            this.setMaxValue(max);
        }
        this.setStep(step || 1);
    };
    AgInputRange.prototype.addInputListeners = function () {
        var _this = this;
        var isIE = utils_1._.isBrowserIE();
        var eventName = isIE ? 'change' : 'input';
        this.addDestroyableEventListener(this.eInput, eventName, function (e) {
            var value = e.target.value;
            _this.setValue(value);
        });
    };
    AgInputRange.prototype.setMinValue = function (value) {
        this.min = value;
        this.eInput.setAttribute('min', value.toString());
        return this;
    };
    AgInputRange.prototype.setMaxValue = function (value) {
        this.max = value;
        this.eInput.setAttribute('max', value.toString());
        return this;
    };
    AgInputRange.prototype.setStep = function (value) {
        this.step = value;
        this.eInput.setAttribute('step', value.toString());
        return this;
    };
    AgInputRange.prototype.setValue = function (value, silent) {
        if (this.min != null) {
            value = Math.max(parseFloat(value), this.min).toString();
        }
        if (this.max != null) {
            value = Math.min(parseFloat(value), this.max).toString();
        }
        var ret = _super.prototype.setValue.call(this, value, silent);
        this.eInput.value = value;
        return ret;
    };
    return AgInputRange;
}(agAbstractInputField_1.AgAbstractInputField));
exports.AgInputRange = AgInputRange;
