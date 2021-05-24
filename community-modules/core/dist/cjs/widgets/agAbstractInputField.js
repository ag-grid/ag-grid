/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
Object.defineProperty(exports, "__esModule", { value: true });
var componentAnnotations_1 = require("./componentAnnotations");
var agAbstractField_1 = require("./agAbstractField");
var dom_1 = require("../utils/dom");
var aria_1 = require("../utils/aria");
var generic_1 = require("../utils/generic");
var AgAbstractInputField = /** @class */ (function (_super) {
    __extends(AgAbstractInputField, _super);
    function AgAbstractInputField(config, className, inputType, displayFieldTag) {
        if (inputType === void 0) { inputType = 'text'; }
        if (displayFieldTag === void 0) { displayFieldTag = 'input'; }
        var _this = _super.call(this, config, /* html */ "\n            <div role=\"presentation\">\n                <div ref=\"eLabel\" class=\"ag-input-field-label\"></div>\n                <div ref=\"eWrapper\" class=\"ag-wrapper ag-input-wrapper\" role=\"presentation\">\n                    <" + displayFieldTag + " ref=\"eInput\" class=\"ag-input-field-input\"></" + displayFieldTag + ">\n                </div>\n            </div>", className) || this;
        _this.inputType = inputType;
        _this.displayFieldTag = displayFieldTag;
        return _this;
    }
    AgAbstractInputField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.setInputType();
        dom_1.addCssClass(this.eLabel, this.className + "-label");
        dom_1.addCssClass(this.eWrapper, this.className + "-input-wrapper");
        dom_1.addCssClass(this.eInput, this.className + "-input");
        dom_1.addCssClass(this.getGui(), 'ag-input-field');
        this.eInput.id = this.eInput.id || "ag-" + this.getCompId() + "-input";
        var _a = this.config, width = _a.width, value = _a.value;
        if (width != null) {
            this.setWidth(width);
        }
        if (value != null) {
            this.setValue(value);
        }
        this.addInputListeners();
    };
    AgAbstractInputField.prototype.refreshLabel = function () {
        if (generic_1.exists(this.getLabel())) {
            aria_1.setAriaLabelledBy(this.eInput, this.getLabelId());
        }
        else {
            this.eInput.removeAttribute('aria-labelledby');
        }
        _super.prototype.refreshLabel.call(this);
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
        dom_1.setElementWidth(this.eWrapper, width);
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
        dom_1.addOrRemoveAttribute(this.eInput, 'placeholder', placeholder);
        return this;
    };
    AgAbstractInputField.prototype.setInputAriaLabel = function (label) {
        aria_1.setAriaLabel(this.eInput, label);
        return this;
    };
    AgAbstractInputField.prototype.setDisabled = function (disabled) {
        dom_1.setDisabled(this.eInput, disabled);
        return _super.prototype.setDisabled.call(this, disabled);
    };
    __decorate([
        componentAnnotations_1.RefSelector('eLabel')
    ], AgAbstractInputField.prototype, "eLabel", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eWrapper')
    ], AgAbstractInputField.prototype, "eWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eInput')
    ], AgAbstractInputField.prototype, "eInput", void 0);
    return AgAbstractInputField;
}(agAbstractField_1.AgAbstractField));
exports.AgAbstractInputField = AgAbstractInputField;

//# sourceMappingURL=agAbstractInputField.js.map
