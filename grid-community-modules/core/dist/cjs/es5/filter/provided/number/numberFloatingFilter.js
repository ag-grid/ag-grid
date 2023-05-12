/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFloatingFilter = void 0;
var numberFilter_1 = require("./numberFilter");
var textInputFloatingFilter_1 = require("../../floating/provided/textInputFloatingFilter");
var agInputNumberField_1 = require("../../../widgets/agInputNumberField");
var agInputTextField_1 = require("../../../widgets/agInputTextField");
var beanStub_1 = require("../../../context/beanStub");
var FloatingFilterNumberInputService = /** @class */ (function (_super) {
    __extends(FloatingFilterNumberInputService, _super);
    function FloatingFilterNumberInputService(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.numberInputActive = true;
        return _this;
    }
    FloatingFilterNumberInputService.prototype.setupGui = function (parentElement) {
        this.eFloatingFilterNumberInput = this.createManagedBean(new agInputNumberField_1.AgInputNumberField());
        this.eFloatingFilterTextInput = this.createManagedBean(new agInputTextField_1.AgInputTextField());
        this.eFloatingFilterTextInput.setDisabled(true);
        this.eFloatingFilterNumberInput.setInputAriaLabel(this.params.ariaLabel);
        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);
        parentElement.appendChild(this.eFloatingFilterNumberInput.getGui());
        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    };
    FloatingFilterNumberInputService.prototype.setEditable = function (editable) {
        this.numberInputActive = editable;
        this.eFloatingFilterNumberInput.setDisplayed(this.numberInputActive);
        this.eFloatingFilterTextInput.setDisplayed(!this.numberInputActive);
    };
    FloatingFilterNumberInputService.prototype.getValue = function () {
        return this.getActiveInputElement().getValue();
    };
    FloatingFilterNumberInputService.prototype.setValue = function (value, silent) {
        this.getActiveInputElement().setValue(value, silent);
    };
    FloatingFilterNumberInputService.prototype.getActiveInputElement = function () {
        return this.numberInputActive ? this.eFloatingFilterNumberInput : this.eFloatingFilterTextInput;
    };
    FloatingFilterNumberInputService.prototype.addValueChangedListener = function (listener) {
        this.setupListeners(this.eFloatingFilterNumberInput.getGui(), listener);
        this.setupListeners(this.eFloatingFilterTextInput.getGui(), listener);
    };
    FloatingFilterNumberInputService.prototype.setupListeners = function (element, listener) {
        this.addManagedListener(element, 'input', listener);
        this.addManagedListener(element, 'keypress', listener);
        this.addManagedListener(element, 'keydown', listener);
    };
    return FloatingFilterNumberInputService;
}(beanStub_1.BeanStub));
var NumberFloatingFilter = /** @class */ (function (_super) {
    __extends(NumberFloatingFilter, _super);
    function NumberFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.filterModelFormatter = new numberFilter_1.NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    };
    NumberFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return numberFilter_1.NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFloatingFilter.prototype.getFilterModelFormatter = function () {
        return this.filterModelFormatter;
    };
    NumberFloatingFilter.prototype.createFloatingFilterInputService = function (ariaLabel) {
        var allowedCharPattern = numberFilter_1.getAllowedCharPattern(this.params.filterParams);
        if (allowedCharPattern) {
            // need to sue text input
            return this.createManagedBean(new textInputFloatingFilter_1.FloatingFilterTextInputService({
                config: { allowedCharPattern: allowedCharPattern },
                ariaLabel: ariaLabel
            }));
        }
        return this.createManagedBean(new FloatingFilterNumberInputService({ ariaLabel: ariaLabel }));
    };
    return NumberFloatingFilter;
}(textInputFloatingFilter_1.TextInputFloatingFilter));
exports.NumberFloatingFilter = NumberFloatingFilter;
