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
import { addOrRemoveAttribute } from "../utils/dom";
import { parseDateTimeFromString, serialiseDate } from "../utils/date";
import { isBrowserSafari } from "../utils/browser";
var AgInputDateField = /** @class */ (function (_super) {
    __extends(AgInputDateField, _super);
    function AgInputDateField(config) {
        return _super.call(this, config, 'ag-date-field', 'date') || this;
    }
    AgInputDateField.prototype.postConstruct = function () {
        var _this = this;
        _super.prototype.postConstruct.call(this);
        this.addManagedListener(this.eInput, 'wheel', this.onWheel.bind(this));
        // ensures that the input element is focussed when a clear button is clicked,
        // unless using safari as there is no clear button and focus does not work properly
        var usingSafari = isBrowserSafari();
        this.addManagedListener(this.eInput, 'mousedown', function () {
            if (_this.isDisabled() || usingSafari) {
                return;
            }
            _this.eInput.focus();
        });
        this.eInput.step = 'any';
    };
    AgInputDateField.prototype.onWheel = function (e) {
        // Prevent default scroll events from incrementing / decrementing the input, since its inconsistent between browsers
        if (document.activeElement === this.eInput) {
            e.preventDefault();
        }
    };
    AgInputDateField.prototype.setMin = function (minDate) {
        var _a;
        var min = minDate instanceof Date ? (_a = serialiseDate(minDate !== null && minDate !== void 0 ? minDate : null, false)) !== null && _a !== void 0 ? _a : undefined : minDate;
        if (this.min === min) {
            return this;
        }
        this.min = min;
        addOrRemoveAttribute(this.eInput, 'min', min);
        return this;
    };
    AgInputDateField.prototype.setMax = function (maxDate) {
        var _a;
        var max = maxDate instanceof Date ? (_a = serialiseDate(maxDate !== null && maxDate !== void 0 ? maxDate : null, false)) !== null && _a !== void 0 ? _a : undefined : maxDate;
        if (this.max === max) {
            return this;
        }
        this.max = max;
        addOrRemoveAttribute(this.eInput, 'max', max);
        return this;
    };
    AgInputDateField.prototype.setStep = function (step) {
        if (this.step === step) {
            return this;
        }
        this.step = step;
        addOrRemoveAttribute(this.eInput, 'step', step);
        return this;
    };
    AgInputDateField.prototype.getDate = function () {
        var _a;
        if (!this.eInput.validity.valid) {
            return undefined;
        }
        return (_a = parseDateTimeFromString(this.getValue())) !== null && _a !== void 0 ? _a : undefined;
    };
    AgInputDateField.prototype.setDate = function (date, silent) {
        this.setValue(serialiseDate(date !== null && date !== void 0 ? date : null, false), silent);
    };
    return AgInputDateField;
}(AgInputTextField));
export { AgInputDateField };
