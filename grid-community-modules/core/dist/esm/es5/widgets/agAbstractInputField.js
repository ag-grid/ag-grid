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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RefSelector } from './componentAnnotations';
import { AgAbstractField } from './agAbstractField';
import { setDisabled, setElementWidth, addOrRemoveAttribute } from '../utils/dom';
import { setAriaLabel } from '../utils/aria';
var AgAbstractInputField = /** @class */ (function (_super) {
    __extends(AgAbstractInputField, _super);
    function AgAbstractInputField(config, className, inputType, displayFieldTag) {
        if (inputType === void 0) { inputType = 'text'; }
        if (displayFieldTag === void 0) { displayFieldTag = 'input'; }
        var _this = _super.call(this, config, /* html */ "\n            <div role=\"presentation\">\n                <div ref=\"eLabel\" class=\"ag-input-field-label\"></div>\n                <div ref=\"eWrapper\" class=\"ag-wrapper ag-input-wrapper\" role=\"presentation\">\n                    <".concat(displayFieldTag, " ref=\"eInput\" class=\"ag-input-field-input\"></").concat(displayFieldTag, ">\n                </div>\n            </div>"), className) || this;
        _this.inputType = inputType;
        _this.displayFieldTag = displayFieldTag;
        return _this;
    }
    AgAbstractInputField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.setInputType();
        this.eLabel.classList.add("".concat(this.className, "-label"));
        this.eWrapper.classList.add("".concat(this.className, "-input-wrapper"));
        this.eInput.classList.add("".concat(this.className, "-input"));
        this.addCssClass('ag-input-field');
        this.eInput.id = this.eInput.id || "ag-".concat(this.getCompId(), "-input");
        var _a = this.config, width = _a.width, value = _a.value;
        if (width != null) {
            this.setWidth(width);
        }
        if (value != null) {
            this.setValue(value);
        }
        this.addInputListeners();
        this.activateTabIndex([this.eInput]);
    };
    AgAbstractInputField.prototype.addInputListeners = function () {
        var _this = this;
        this.addManagedListener(this.eInput, 'input', function (e) { return _this.setValue(e.target.value); });
    };
    AgAbstractInputField.prototype.setInputType = function () {
        if (this.displayFieldTag === 'input') {
            this.eInput.setAttribute('type', this.inputType);
        }
    };
    AgAbstractInputField.prototype.getInputElement = function () {
        return this.eInput;
    };
    AgAbstractInputField.prototype.setInputWidth = function (width) {
        setElementWidth(this.eWrapper, width);
        return this;
    };
    AgAbstractInputField.prototype.setInputName = function (name) {
        this.getInputElement().setAttribute('name', name);
        return this;
    };
    AgAbstractInputField.prototype.getFocusableElement = function () {
        return this.eInput;
    };
    AgAbstractInputField.prototype.setMaxLength = function (length) {
        var eInput = this.eInput;
        eInput.maxLength = length;
        return this;
    };
    AgAbstractInputField.prototype.setInputPlaceholder = function (placeholder) {
        addOrRemoveAttribute(this.eInput, 'placeholder', placeholder);
        return this;
    };
    AgAbstractInputField.prototype.setInputAriaLabel = function (label) {
        setAriaLabel(this.eInput, label);
        this.refreshAriaLabelledBy();
        return this;
    };
    AgAbstractInputField.prototype.setDisabled = function (disabled) {
        setDisabled(this.eInput, disabled);
        return _super.prototype.setDisabled.call(this, disabled);
    };
    AgAbstractInputField.prototype.setAutoComplete = function (value) {
        if (value === true) {
            // Remove the autocomplete attribute if the value is explicitly set to true
            // to allow the default browser autocomplete/autofill behaviour.
            addOrRemoveAttribute(this.eInput, 'autocomplete', null);
        }
        else {
            // When a string is provided, use it as the value of the autocomplete attribute.
            // This enables users to specify how they want to the browser to handle the autocomplete on the input, as per spec:
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values
            var autoCompleteValue = typeof value === 'string' ? value : 'off';
            addOrRemoveAttribute(this.eInput, 'autocomplete', autoCompleteValue);
        }
        return this;
    };
    __decorate([
        RefSelector('eLabel')
    ], AgAbstractInputField.prototype, "eLabel", void 0);
    __decorate([
        RefSelector('eWrapper')
    ], AgAbstractInputField.prototype, "eWrapper", void 0);
    __decorate([
        RefSelector('eInput')
    ], AgAbstractInputField.prototype, "eInput", void 0);
    return AgAbstractInputField;
}(AgAbstractField));
export { AgAbstractInputField };
