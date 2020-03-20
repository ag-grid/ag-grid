/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
var utils_1 = require("../utils");
var AgAbstractInputField = /** @class */ (function (_super) {
    __extends(AgAbstractInputField, _super);
    function AgAbstractInputField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.config = {};
        _this.TEMPLATE = "<div role=\"presentation\">\n            <label ref=\"eLabel\" class=\"ag-input-field-label\"></label>\n            <div ref=\"eWrapper\" class=\"ag-wrapper ag-input-wrapper\" role=\"presentation\">\n                <%displayField% ref=\"eInput\" class=\"ag-input-field-input\"></%displayField%>\n            </div>\n        </div>";
        return _this;
    }
    AgAbstractInputField.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        this.setInputType();
        utils_1._.addCssClass(this.eLabel, this.className + "-label");
        utils_1._.addCssClass(this.eWrapper, this.className + "-input-wrapper");
        utils_1._.addCssClass(this.eInput, this.className + "-input");
        utils_1._.addCssClass(this.getGui(), 'ag-input-field');
        var inputId = this.eInput.id ? this.eInput.id : "ag-input-id-" + this.getCompId();
        this.eLabel.htmlFor = inputId;
        this.eInput.id = inputId;
        var _a = this.config, width = _a.width, value = _a.value;
        if (width != null) {
            this.setWidth(width);
        }
        if (value != null) {
            this.setValue(value);
        }
        this.addInputListeners();
    };
    AgAbstractInputField.prototype.addInputListeners = function () {
        var _this = this;
        this.addDestroyableEventListener(this.eInput, 'input', function (e) {
            var value = e.target.value;
            _this.setValue(value);
        });
    };
    AgAbstractInputField.prototype.setInputType = function () {
        if (this.inputType) {
            this.eInput.setAttribute('type', this.inputType);
        }
    };
    AgAbstractInputField.prototype.getInputElement = function () {
        return this.eInput;
    };
    AgAbstractInputField.prototype.setInputWidth = function (width) {
        utils_1._.setElementWidth(this.eWrapper, width);
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
        var eInput = this.eInput;
        if (placeholder) {
            eInput.setAttribute('placeholder', placeholder);
        }
        else {
            eInput.removeAttribute('placeholder');
        }
        return this;
    };
    AgAbstractInputField.prototype.setDisabled = function (disabled) {
        if (disabled) {
            this.eInput.setAttribute('disabled', 'true');
        }
        else {
            this.eInput.removeAttribute('disabled');
        }
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
