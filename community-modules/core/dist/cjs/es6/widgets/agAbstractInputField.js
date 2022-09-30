/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const componentAnnotations_1 = require("./componentAnnotations");
const agAbstractField_1 = require("./agAbstractField");
const dom_1 = require("../utils/dom");
const aria_1 = require("../utils/aria");
const generic_1 = require("../utils/generic");
class AgAbstractInputField extends agAbstractField_1.AgAbstractField {
    constructor(config, className, inputType = 'text', displayFieldTag = 'input') {
        super(config, /* html */ `
            <div role="presentation">
                <div ref="eLabel" class="ag-input-field-label"></div>
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper" role="presentation">
                    <${displayFieldTag} ref="eInput" class="ag-input-field-input"></${displayFieldTag}>
                </div>
            </div>`, className);
        this.inputType = inputType;
        this.displayFieldTag = displayFieldTag;
    }
    postConstruct() {
        super.postConstruct();
        this.setInputType();
        this.eLabel.classList.add(`${this.className}-label`);
        this.eWrapper.classList.add(`${this.className}-input-wrapper`);
        this.eInput.classList.add(`${this.className}-input`);
        this.addCssClass('ag-input-field');
        this.eInput.id = this.eInput.id || `ag-${this.getCompId()}-input`;
        const { width, value } = this.config;
        if (width != null) {
            this.setWidth(width);
        }
        if (value != null) {
            this.setValue(value);
        }
        this.addInputListeners();
    }
    refreshLabel() {
        if (generic_1.exists(this.getLabel())) {
            aria_1.setAriaLabelledBy(this.eInput, this.getLabelId());
        }
        else {
            this.eInput.removeAttribute('aria-labelledby');
        }
        super.refreshLabel();
    }
    addInputListeners() {
        this.addManagedListener(this.eInput, 'input', e => this.setValue(e.target.value));
    }
    setInputType() {
        if (this.displayFieldTag === 'input') {
            this.eInput.setAttribute('type', this.inputType);
        }
    }
    getInputElement() {
        return this.eInput;
    }
    setInputWidth(width) {
        dom_1.setElementWidth(this.eWrapper, width);
        return this;
    }
    setInputName(name) {
        this.getInputElement().setAttribute('name', name);
        return this;
    }
    getFocusableElement() {
        return this.eInput;
    }
    setMaxLength(length) {
        const eInput = this.eInput;
        eInput.maxLength = length;
        return this;
    }
    setInputPlaceholder(placeholder) {
        dom_1.addOrRemoveAttribute(this.eInput, 'placeholder', placeholder);
        return this;
    }
    setInputAriaLabel(label) {
        aria_1.setAriaLabel(this.eInput, label);
        return this;
    }
    setDisabled(disabled) {
        dom_1.setDisabled(this.eInput, disabled);
        return super.setDisabled(disabled);
    }
}
__decorate([
    componentAnnotations_1.RefSelector('eLabel')
], AgAbstractInputField.prototype, "eLabel", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eWrapper')
], AgAbstractInputField.prototype, "eWrapper", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eInput')
], AgAbstractInputField.prototype, "eInput", void 0);
exports.AgAbstractInputField = AgAbstractInputField;
