var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { AgInputTextField } from "./agInputTextField";
import { addOrRemoveAttribute } from '../utils/dom';
import { exists } from "../utils/generic";
var AgInputNumberField = /** @class */ (function (_super) {
    __extends(AgInputNumberField, _super);
    function AgInputNumberField(config) {
        return _super.call(this, config, 'ag-number-field', 'number') || this;
    }
    AgInputNumberField.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.addManagedListener(this.eInput, 'blur', function () {
            var floatedValue = parseFloat(_this.eInput.value);
            var value = isNaN(floatedValue) ? '' : _this.normalizeValue(floatedValue.toString());
            if (_this.value !== value) {
                _this.setValue(value);
            }
        });
        this.addManagedListener(this.eInput, 'wheel', this.onWheel.bind(this));
        this.eInput.step = 'any';
    };
    AgInputNumberField.prototype.onWheel = function (e) {
        // Prevent default scroll events from incrementing / decrementing the input, since its inconsistent between browsers
        if (document.activeElement === this.eInput) {
            e.preventDefault();
        }
    };
    AgInputNumberField.prototype.normalizeValue = function (value) {
        if (value === '') {
            return '';
        }
        if (this.precision != null) {
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
    AgInputNumberField.prototype.adjustPrecision = function (value, isScientificNotation) {
        if (this.precision == null) {
            return value;
        }
        if (isScientificNotation) {
            var floatString = parseFloat(value).toFixed(this.precision);
            return parseFloat(floatString).toString();
        }
        // can't use toFixed here because we don't want to round up
        var parts = String(value).split('.');
        if (parts.length > 1) {
            if (parts[1].length <= this.precision) {
                return value;
            }
            else if (this.precision > 0) {
                return "".concat(parts[0], ".").concat(parts[1].slice(0, this.precision));
            }
        }
        return parts[0];
    };
    AgInputNumberField.prototype.setMin = function (min) {
        if (this.min === min) {
            return this;
        }
        this.min = min;
        addOrRemoveAttribute(this.eInput, 'min', min);
        return this;
    };
    AgInputNumberField.prototype.setMax = function (max) {
        if (this.max === max) {
            return this;
        }
        this.max = max;
        addOrRemoveAttribute(this.eInput, 'max', max);
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
        addOrRemoveAttribute(this.eInput, 'step', step);
        return this;
    };
    AgInputNumberField.prototype.setValue = function (value, silent) {
        var _this = this;
        return this.setValueOrInputValue(function (v) { return _super.prototype.setValue.call(_this, v, silent); }, function () { return _this; }, value);
    };
    AgInputNumberField.prototype.setStartValue = function (value) {
        var _this = this;
        return this.setValueOrInputValue(function (v) { return _super.prototype.setValue.call(_this, v, true); }, function (v) { _this.eInput.value = v; }, value);
    };
    AgInputNumberField.prototype.setValueOrInputValue = function (setValueFunc, setInputValueOnlyFunc, value) {
        if (exists(value)) {
            // need to maintain the scientific notation format whilst typing (e.g. 1e10)
            var setInputValueOnly = this.isScientificNotation(value);
            if (setInputValueOnly && this.eInput.validity.valid) {
                return setValueFunc(value);
            }
            if (!setInputValueOnly) {
                value = this.adjustPrecision(value);
                var normalizedValue = this.normalizeValue(value);
                // outside of valid range
                setInputValueOnly = value != normalizedValue;
            }
            if (setInputValueOnly) {
                return setInputValueOnlyFunc(value);
            }
        }
        return setValueFunc(value);
    };
    AgInputNumberField.prototype.getValue = function () {
        if (!this.eInput.validity.valid) {
            return undefined;
        }
        var inputValue = this.eInput.value;
        if (this.isScientificNotation(inputValue)) {
            return this.adjustPrecision(inputValue, true);
        }
        return _super.prototype.getValue.call(this);
    };
    AgInputNumberField.prototype.isScientificNotation = function (value) {
        return typeof value === 'string' && value.includes('e');
    };
    return AgInputNumberField;
}(AgInputTextField));
export { AgInputNumberField };
