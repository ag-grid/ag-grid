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
const agAbstractField_1 = require("./agAbstractField");
const componentAnnotations_1 = require("./componentAnnotations");
const aria_1 = require("../utils/aria");
const icon_1 = require("../utils/icon");
const generic_1 = require("../utils/generic");
const dom_1 = require("../utils/dom");
const keyCode_1 = require("../constants/keyCode");
class AgPickerField extends agAbstractField_1.AgAbstractField {
    constructor(config, className, pickerIcon, ariaRole) {
        super(config, 
        /* html */ `<div class="ag-picker-field" role="presentation">
                <div ref="eLabel"></div>
                <div ref="eWrapper"
                    class="ag-wrapper ag-picker-field-wrapper"
                    tabIndex="-1"
                    aria-expanded="false"
                    ${ariaRole ? `role="${ariaRole}"` : ''}
                >
                    <div ref="eDisplayField" class="ag-picker-field-display"></div>
                    <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
                </div>
            </div>`, className);
        this.pickerIcon = pickerIcon;
        this.isPickerDisplayed = false;
        this.isDestroyingPicker = false;
        this.skipClick = false;
    }
    postConstruct() {
        super.postConstruct();
        const displayId = `${this.getCompId()}-display`;
        this.eDisplayField.setAttribute('id', displayId);
        aria_1.setAriaDescribedBy(this.eWrapper, displayId);
        const clickHandler = () => {
            if (this.skipClick) {
                this.skipClick = false;
                return;
            }
            if (this.isDisabled()) {
                return;
            }
            this.pickerComponent = this.showPicker();
        };
        const eGui = this.getGui();
        this.addManagedListener(eGui, 'mousedown', (e) => {
            if (!this.skipClick &&
                this.pickerComponent &&
                this.pickerComponent.isAlive() &&
                dom_1.isVisible(this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                this.skipClick = true;
            }
        });
        this.addManagedListener(eGui, 'keydown', (e) => {
            switch (e.key) {
                case keyCode_1.KeyCode.UP:
                case keyCode_1.KeyCode.DOWN:
                case keyCode_1.KeyCode.ENTER:
                case keyCode_1.KeyCode.SPACE:
                    clickHandler();
                case keyCode_1.KeyCode.ESCAPE:
                    if (this.isPickerDisplayed) {
                        e.preventDefault();
                    }
                    break;
            }
        });
        this.addManagedListener(this.eWrapper, 'click', clickHandler);
        this.addManagedListener(this.eLabel, 'click', clickHandler);
        if (this.pickerIcon) {
            const icon = icon_1.createIconNoSpan(this.pickerIcon, this.gridOptionsWrapper);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    }
    refreshLabel() {
        if (generic_1.exists(this.getLabel())) {
            aria_1.setAriaLabelledBy(this.eWrapper, this.getLabelId());
        }
        else {
            this.eWrapper.removeAttribute('aria-labelledby');
        }
        super.refreshLabel();
    }
    setAriaLabel(label) {
        aria_1.setAriaLabel(this.eWrapper, label);
        return this;
    }
    setInputWidth(width) {
        dom_1.setElementWidth(this.eWrapper, width);
        return this;
    }
    getFocusableElement() {
        return this.eWrapper;
    }
}
__decorate([
    componentAnnotations_1.RefSelector('eLabel')
], AgPickerField.prototype, "eLabel", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eWrapper')
], AgPickerField.prototype, "eWrapper", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eDisplayField')
], AgPickerField.prototype, "eDisplayField", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eIcon')
], AgPickerField.prototype, "eIcon", void 0);
exports.AgPickerField = AgPickerField;
