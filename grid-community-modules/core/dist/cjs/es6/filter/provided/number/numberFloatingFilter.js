"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFloatingFilter = void 0;
const numberFilter_1 = require("./numberFilter");
const textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
const agInputNumberField_1 = require("../../../widgets/agInputNumberField");
const agInputTextField_1 = require("../../../widgets/agInputTextField");
const beanStub_1 = require("../../../context/beanStub");
class FloatingFilterNumberInputService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.valueChangedListener = () => { };
        this.numberInputActive = true;
    }
    setupGui(parentElement) {
        this.eFloatingFilterNumberInput = this.createManagedBean(new agInputNumberField_1.AgInputNumberField());
        this.eFloatingFilterTextInput = this.createManagedBean(new agInputTextField_1.AgInputTextField());
        this.eFloatingFilterTextInput.setDisabled(true);
        const eNumberInput = this.eFloatingFilterNumberInput.getGui();
        const eTextInput = this.eFloatingFilterTextInput.getGui();
        parentElement.appendChild(eNumberInput);
        parentElement.appendChild(eTextInput);
        this.setupListeners(eNumberInput, (e) => this.valueChangedListener(e));
        this.setupListeners(eTextInput, (e) => this.valueChangedListener(e));
    }
    setEditable(editable) {
        this.numberInputActive = editable;
        this.eFloatingFilterNumberInput.setDisplayed(this.numberInputActive);
        this.eFloatingFilterTextInput.setDisplayed(!this.numberInputActive);
    }
    setAutoComplete(autoComplete) {
        this.eFloatingFilterNumberInput.setAutoComplete(autoComplete);
        this.eFloatingFilterTextInput.setAutoComplete(autoComplete);
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
    setValueChangedListener(listener) {
        this.valueChangedListener = listener;
    }
    setupListeners(element, listener) {
        this.addManagedListener(element, 'input', listener);
        this.addManagedListener(element, 'keydown', listener);
    }
    setParams(params) {
        this.setAriaLabel(params.ariaLabel);
        if (params.autoComplete !== undefined) {
            this.setAutoComplete(params.autoComplete);
        }
    }
    setAriaLabel(ariaLabel) {
        this.eFloatingFilterNumberInput.setInputAriaLabel(ariaLabel);
        this.eFloatingFilterTextInput.setInputAriaLabel(ariaLabel);
    }
}
class NumberFloatingFilter extends textInputFloatingFilter_1.TextInputFloatingFilter {
    init(params) {
        var _a;
        super.init(params);
        this.filterModelFormatter = new numberFilter_1.NumberFilterModelFormatter(this.localeService, this.optionsFactory, (_a = params.filterParams) === null || _a === void 0 ? void 0 : _a.numberFormatter);
    }
    onParamsUpdated(params) {
        const allowedCharPattern = (0, numberFilter_1.getAllowedCharPattern)(params.filterParams);
        if (allowedCharPattern !== this.allowedCharPattern) {
            this.recreateFloatingFilterInputService(params);
        }
        super.onParamsUpdated(params);
        this.filterModelFormatter.updateParams({ optionsFactory: this.optionsFactory });
    }
    getDefaultFilterOptions() {
        return numberFilter_1.NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
    getFilterModelFormatter() {
        return this.filterModelFormatter;
    }
    createFloatingFilterInputService(params) {
        this.allowedCharPattern = (0, numberFilter_1.getAllowedCharPattern)(params.filterParams);
        if (this.allowedCharPattern) {
            // need to use text input
            return this.createManagedBean(new textInputFloatingFilter_1.FloatingFilterTextInputService({
                config: { allowedCharPattern: this.allowedCharPattern },
            }));
        }
        return this.createManagedBean(new FloatingFilterNumberInputService());
    }
}
exports.NumberFloatingFilter = NumberFloatingFilter;
