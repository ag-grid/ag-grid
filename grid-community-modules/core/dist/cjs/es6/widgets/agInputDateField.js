"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgInputDateField = void 0;
const agInputTextField_1 = require("./agInputTextField");
const dom_1 = require("../utils/dom");
const date_1 = require("../utils/date");
const browser_1 = require("../utils/browser");
class AgInputDateField extends agInputTextField_1.AgInputTextField {
    constructor(config) {
        super(config, 'ag-date-field', 'date');
    }
    postConstruct() {
        super.postConstruct();
        this.addManagedListener(this.eInput, 'wheel', this.onWheel.bind(this));
        // ensures that the input element is focussed when a clear button is clicked,
        // unless using safari as there is no clear button and focus does not work properly
        const usingSafari = (0, browser_1.isBrowserSafari)();
        this.addManagedListener(this.eInput, 'mousedown', () => {
            if (this.isDisabled() || usingSafari) {
                return;
            }
            this.eInput.focus();
        });
        this.eInput.step = 'any';
    }
    onWheel(e) {
        // Prevent default scroll events from incrementing / decrementing the input, since its inconsistent between browsers
        if (document.activeElement === this.eInput) {
            e.preventDefault();
        }
    }
    setMin(minDate) {
        var _a;
        const min = minDate instanceof Date ? (_a = (0, date_1.serialiseDate)(minDate !== null && minDate !== void 0 ? minDate : null, false)) !== null && _a !== void 0 ? _a : undefined : minDate;
        if (this.min === min) {
            return this;
        }
        this.min = min;
        (0, dom_1.addOrRemoveAttribute)(this.eInput, 'min', min);
        return this;
    }
    setMax(maxDate) {
        var _a;
        const max = maxDate instanceof Date ? (_a = (0, date_1.serialiseDate)(maxDate !== null && maxDate !== void 0 ? maxDate : null, false)) !== null && _a !== void 0 ? _a : undefined : maxDate;
        if (this.max === max) {
            return this;
        }
        this.max = max;
        (0, dom_1.addOrRemoveAttribute)(this.eInput, 'max', max);
        return this;
    }
    setStep(step) {
        if (this.step === step) {
            return this;
        }
        this.step = step;
        (0, dom_1.addOrRemoveAttribute)(this.eInput, 'step', step);
        return this;
    }
    getDate() {
        var _a;
        if (!this.eInput.validity.valid) {
            return undefined;
        }
        return (_a = (0, date_1.parseDateTimeFromString)(this.getValue())) !== null && _a !== void 0 ? _a : undefined;
    }
    setDate(date, silent) {
        this.setValue((0, date_1.serialiseDate)(date !== null && date !== void 0 ? date : null, false), silent);
    }
}
exports.AgInputDateField = AgInputDateField;
