"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgInputNumberField = void 0;
const agInputTextField_1 = require("./agInputTextField");
const dom_1 = require("../utils/dom");
const generic_1 = require("../utils/generic");
class AgInputNumberField extends agInputTextField_1.AgInputTextField {
    constructor(config) {
        super(config, 'ag-number-field', 'number');
    }
    postConstruct() {
        super.postConstruct();
        this.addManagedListener(this.eInput, 'blur', () => {
            const floatedValue = parseFloat(this.eInput.value);
            const value = isNaN(floatedValue) ? '' : this.normalizeValue(floatedValue.toString());
            if (this.value !== value) {
                this.setValue(value);
            }
        });
        this.addManagedListener(this.eInput, 'wheel', this.onWheel.bind(this));
        this.eInput.step = 'any';
    }
    onWheel(e) {
        // Prevent default scroll events from incrementing / decrementing the input, since its inconsistent between browsers
        if (document.activeElement === this.eInput) {
            e.preventDefault();
        }
    }
    normalizeValue(value) {
        if (value === '') {
            return '';
        }
        if (this.precision != null) {
            value = this.adjustPrecision(value);
        }
        const val = parseFloat(value);
        if (this.min != null && val < this.min) {
            value = this.min.toString();
        }
        else if (this.max != null && val > this.max) {
            value = this.max.toString();
        }
        return value;
    }
    adjustPrecision(value, isScientificNotation) {
        if (this.precision == null) {
            return value;
        }
        if (isScientificNotation) {
            const floatString = parseFloat(value).toFixed(this.precision);
            return parseFloat(floatString).toString();
        }
        // can't use toFixed here because we don't want to round up
        const parts = String(value).split('.');
        if (parts.length > 1) {
            if (parts[1].length <= this.precision) {
                return value;
            }
            else if (this.precision > 0) {
                return `${parts[0]}.${parts[1].slice(0, this.precision)}`;
            }
        }
        return parts[0];
    }
    setMin(min) {
        if (this.min === min) {
            return this;
        }
        this.min = min;
        (0, dom_1.addOrRemoveAttribute)(this.eInput, 'min', min);
        return this;
    }
    setMax(max) {
        if (this.max === max) {
            return this;
        }
        this.max = max;
        (0, dom_1.addOrRemoveAttribute)(this.eInput, 'max', max);
        return this;
    }
    setPrecision(precision) {
        this.precision = precision;
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
    setValue(value, silent) {
        return this.setValueOrInputValue(v => super.setValue(v, silent), () => this, value);
    }
    setStartValue(value) {
        return this.setValueOrInputValue(v => super.setValue(v, true), v => { this.eInput.value = v; }, value);
    }
    setValueOrInputValue(setValueFunc, setInputValueOnlyFunc, value) {
        if ((0, generic_1.exists)(value)) {
            // need to maintain the scientific notation format whilst typing (e.g. 1e10)
            let setInputValueOnly = this.isScientificNotation(value);
            if (setInputValueOnly && this.eInput.validity.valid) {
                return setValueFunc(value);
            }
            if (!setInputValueOnly) {
                value = this.adjustPrecision(value);
                const normalizedValue = this.normalizeValue(value);
                // outside of valid range
                setInputValueOnly = value != normalizedValue;
            }
            if (setInputValueOnly) {
                return setInputValueOnlyFunc(value);
            }
        }
        return setValueFunc(value);
    }
    getValue() {
        if (!this.eInput.validity.valid) {
            return undefined;
        }
        const inputValue = this.eInput.value;
        if (this.isScientificNotation(inputValue)) {
            return this.adjustPrecision(inputValue, true);
        }
        return super.getValue();
    }
    isScientificNotation(value) {
        return typeof value === 'string' && value.includes('e');
    }
}
exports.AgInputNumberField = AgInputNumberField;
