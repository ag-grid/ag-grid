/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFloatingFilter = void 0;
const numberFilter_1 = require("./numberFilter");
const textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
const agInputNumberField_1 = require("../../../widgets/agInputNumberField");
const agInputTextField_1 = require("../../../widgets/agInputTextField");
const beanStub_1 = require("../../../context/beanStub");
class FloatingFilterNumberInputService extends beanStub_1.BeanStub {
    constructor(params) {
        super();
        this.params = params;
        this.numberInputActive = true;
    }
    setupGui(parentElement) {
        this.eFloatingFilterNumberInput = this.createManagedBean(new agInputNumberField_1.AgInputNumberField());
        this.eFloatingFilterTextInput = this.createManagedBean(new agInputTextField_1.AgInputTextField());
        this.eFloatingFilterTextInput.setDisabled(true);
        this.eFloatingFilterNumberInput.setInputAriaLabel(this.params.ariaLabel);
        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);
        parentElement.appendChild(this.eFloatingFilterNumberInput.getGui());
        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    }
    setEditable(editable) {
        this.numberInputActive = editable;
        this.eFloatingFilterNumberInput.setDisplayed(this.numberInputActive);
        this.eFloatingFilterTextInput.setDisplayed(!this.numberInputActive);
    }
    getValue() {
        return this.getActiveInputElement().getValue();
    }
    setValue(value, silent) {
        this.getActiveInputElement().setValue(value, silent);
    }
    getActiveInputElement() {
        return this.numberInputActive ? this.eFloatingFilterNumberInput : this.eFloatingFilterTextInput;
    }
    addValueChangedListener(listener) {
        this.setupListeners(this.eFloatingFilterNumberInput.getGui(), listener);
        this.setupListeners(this.eFloatingFilterTextInput.getGui(), listener);
    }
    setupListeners(element, listener) {
        this.addManagedListener(element, 'input', listener);
        this.addManagedListener(element, 'keypress', listener);
        this.addManagedListener(element, 'keydown', listener);
    }
}
class NumberFloatingFilter extends textInputFloatingFilter_1.TextInputFloatingFilter {
    init(params) {
        super.init(params);
        this.filterModelFormatter = new numberFilter_1.NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    }
    getDefaultFilterOptions() {
        return numberFilter_1.NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
    getFilterModelFormatter() {
        return this.filterModelFormatter;
    }
    createFloatingFilterInputService(ariaLabel) {
        const allowedCharPattern = numberFilter_1.getAllowedCharPattern(this.params.filterParams);
        if (allowedCharPattern) {
            // need to sue text input
            return this.createManagedBean(new textInputFloatingFilter_1.FloatingFilterTextInputService({
                config: { allowedCharPattern },
                ariaLabel
            }));
        }
        return this.createManagedBean(new FloatingFilterNumberInputService({ ariaLabel }));
    }
}
exports.NumberFloatingFilter = NumberFloatingFilter;
