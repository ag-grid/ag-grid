/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { getAllowedCharPattern, NumberFilter, NumberFilterModelFormatter } from './numberFilter';
import { FloatingFilterTextInputService, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { AgInputNumberField } from '../../../widgets/agInputNumberField';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { BeanStub } from '../../../context/beanStub';
var FloatingFilterNumberInputService = /** @class */ (function (_super) {
    __extends(FloatingFilterNumberInputService, _super);
    function FloatingFilterNumberInputService(params) {
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.numberInputActive = true;
        return _this;
    }
    FloatingFilterNumberInputService.prototype.setupGui = function (parentElement) {
        this.eFloatingFilterNumberInput = this.createManagedBean(new AgInputNumberField());
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField());
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
}(BeanStub));
var NumberFloatingFilter = /** @class */ (function (_super) {
    __extends(NumberFloatingFilter, _super);
    function NumberFloatingFilter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberFloatingFilter.prototype.init = function (params) {
        _super.prototype.init.call(this, params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    };
    NumberFloatingFilter.prototype.getDefaultFilterOptions = function () {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    };
    NumberFloatingFilter.prototype.getFilterModelFormatter = function () {
        return this.filterModelFormatter;
    };
    NumberFloatingFilter.prototype.createFloatingFilterInputService = function (ariaLabel) {
        var allowedCharPattern = getAllowedCharPattern(this.params.filterParams);
        if (allowedCharPattern) {
            // need to sue text input
            return this.createManagedBean(new FloatingFilterTextInputService({
                config: { allowedCharPattern: allowedCharPattern },
                ariaLabel: ariaLabel
            }));
        }
        return this.createManagedBean(new FloatingFilterNumberInputService({ ariaLabel: ariaLabel }));
    };
    return NumberFloatingFilter;
}(TextInputFloatingFilter));
export { NumberFloatingFilter };
