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
var agInputTextField_1 = require("./agInputTextField");
var AgInputNumberField = /** @class */ (function (_super) {
    __extends(AgInputNumberField, _super);
    function AgInputNumberField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.className = 'ag-number-field';
        _this.inputType = 'number';
        return _this;
    }
    AgInputNumberField.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.addDestroyableEventListener(this.eInput, 'blur', function () {
            var value = _this.normalizeValue(_this.eInput.value);
            if (_this.value !== value) {
                _this.setValue(value);
            }
        });
    };
    AgInputNumberField.prototype.normalizeValue = function (value) {
        if (value === '') {
            return '';
        }
        if (this.precision) {
            value = this.adjustPrecision(value);
        }
        var val = parseFloat(value);
        if (this.min != null && val < this.min) {
            value = this.min.toString();
        }
        else if (this.max != null && val > this.max) {
            value = this.max.toString();
        }
        return value;
    };
    AgInputNumberField.prototype.adjustPrecision = function (value) {
        if (this.precision) {
            var floatString = parseFloat(value).toFixed(this.precision);
            value = parseFloat(floatString).toString();
        }
        return value;
    };
    AgInputNumberField.prototype.setMin = function (min) {
        if (this.min === min) {
            return this;
        }
        this.min = min;
        if (this.min != null) {
            this.eInput.setAttribute('min', min.toString());
        }
        else {
            this.eInput.removeAttribute('min');
        }
        return this;
    };
    AgInputNumberField.prototype.setMax = function (max) {
        if (this.max === max) {
            return this;
        }
        this.max = max;
        if (this.max != null) {
            this.eInput.setAttribute('max', max.toString());
        }
        else {
            this.eInput.removeAttribute('max');
        }
        return this;
    };
    AgInputNumberField.prototype.setPrecision = function (precision) {
        this.precision = precision;
        return this;
    };
    AgInputNumberField.prototype.setStep = function (step) {
        if (this.step === step) {
            return this;
        }
        this.step = step;
        if (step != null) {
            this.eInput.setAttribute('step', step.toString());
        }
        else {
            this.eInput.removeAttribute('step');
        }
        return this;
    };
    AgInputNumberField.prototype.setValue = function (value, silent) {
        value = this.adjustPrecision(value);
        var normalizedValue = this.normalizeValue(value);
        if (value != normalizedValue) {
            return this;
        }
        return _super.prototype.setValue.call(this, value, silent);
    };
    return AgInputNumberField;
}(agInputTextField_1.AgInputTextField));
exports.AgInputNumberField = AgInputNumberField;
