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
import { getAllowedCharPattern, NumberFilter, NumberFilterModelFormatter } from './numberFilter';
import { FloatingFilterTextInputService, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { AgInputNumberField } from '../../../widgets/agInputNumberField';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
var FloatingFilterNumberInputService = /** @class */ (function (_super) {
    __extends(FloatingFilterNumberInputService, _super);
    function FloatingFilterNumberInputService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.valueChangedListener = function () { };
        _this.numberInputActive = true;
        return _this;
    }
    FloatingFilterNumberInputService.prototype.setupGui = function (parentElement) {
        var _this = this;
        this.eFloatingFilterNumberInput = this.createManagedBean(new AgInputNumberField());
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField());
        this.eFloatingFilterTextInput.setDisabled(true);
        var eNumberInput = this.eFloatingFilterNumberInput.getGui();
        var eTextInput = this.eFloatingFilterTextInput.getGui();
        parentElement.appendChild(eNumberInput);
        parentElement.appendChild(eTextInput);
        this.setupListeners(eNumberInput, function (e) { return _this.valueChangedListener(e); });
        this.setupListeners(eTextInput, function (e) { return _this.valueChangedListener(e); });
    };
    FloatingFilterNumberInputService.prototype.setEditable = function (editable) {
        this.numberInputActive = editable;
        this.eFloatingFilterNumberInput.setDisplayed(this.numberInputActive);
        this.eFloatingFilterTextInput.setDisplayed(!this.numberInputActive);
    };
    FloatingFilterNumberInputService.prototype.setAutoComplete = function (autoComplete) {
        this.eFloatingFilterNumberInput.setAutoComplete(autoComplete);
        this.eFloatingFilterTextInput.setAutoComplete(autoComplete);
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
    FloatingFilterNumberInputService.prototype.setValueChangedListener = function (listener) {
        this.valueChangedListener = listener;
    };
    FloatingFilterNumberInputService.prototype.setupListeners = function (element, listener) {
        this.addManagedListener(element, 'input', listener);
        this.addManagedListener(element, 'keydown', listener);
    };
    FloatingFilterNumberInputService.prototype.setParams = function (params) {
        this.setAriaLabel(params.ariaLabel);
        if (params.autoComplete !== undefined) {
            this.setAutoComplete(params.autoComplete);
        }
    };
    FloatingFilterNumberInputService.prototype.setAriaLabel = function (ariaLabel) {
        this.eFloatingFilterNumberInput.setInputAriaLabel(ariaLabel);
        this.eFloatingFilterTextInput.setInputAriaLabel(ariaLabel);
    };
    return FloatingFilterNumberInputService;
}(BeanStub));
var NumberFloatingFilter = /** @class */ (function (_super) {
    __extends(NumberFloatingFilter, _super);
    function NumberFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFloatingFilter.prototype.init = function (params) {
        var _a;
        _super.prototype.init.call(this, params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory, (_a = params.filterParams) === null || _a === void 0 ? void 0 : _a.numberFormatter);
    };
    NumberFloatingFilter.prototype.onParamsUpdated = function (params) {
        var allowedCharPattern = getAllowedCharPattern(params.filterParams);
        if (allowedCharPattern !== this.allowedCharPattern) {
            this.recreateFloatingFilterInputService(params);
        }
        _super.prototype.onParamsUpdated.call(this, params);
        this.filterModelFormatter.updateParams({ optionsFactory: this.optionsFactory });
    };
    NumberFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFloatingFilter.prototype.getFilterModelFormatter = function () {
        return this.filterModelFormatter;
    };
    NumberFloatingFilter.prototype.createFloatingFilterInputService = function (params) {
        this.allowedCharPattern = getAllowedCharPattern(params.filterParams);
        if (this.allowedCharPattern) {
            // need to use text input
            return this.createManagedBean(new FloatingFilterTextInputService({
                config: { allowedCharPattern: this.allowedCharPattern },
            }));
        }
        return this.createManagedBean(new FloatingFilterNumberInputService());
    };
    return NumberFloatingFilter;
}(TextInputFloatingFilter));
export { NumberFloatingFilter };
