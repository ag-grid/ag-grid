/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { AgAbstractField } from "./agAbstractField";
import { RefSelector } from "./componentAnnotations";
import { setAriaLabelledBy, setAriaLabel, setAriaDescribedBy } from "../utils/aria";
import { createIconNoSpan } from "../utils/icon";
import { exists } from "../utils/generic";
import { setElementWidth, isVisible } from "../utils/dom";
import { KeyCode } from '../constants/keyCode';
export class AgPickerField extends AgAbstractField {
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
        setAriaDescribedBy(this.eWrapper, displayId);
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
                isVisible(this.pickerComponent.getGui()) &&
                eGui.contains(e.target)) {
                this.skipClick = true;
            }
        });
        this.addManagedListener(eGui, 'keydown', (e) => {
            switch (e.key) {
                case KeyCode.UP:
                case KeyCode.DOWN:
                case KeyCode.ENTER:
                case KeyCode.SPACE:
                    clickHandler();
                case KeyCode.ESCAPE:
                    if (this.isPickerDisplayed) {
                        e.preventDefault();
                    }
                    break;
            }
        });
        this.addManagedListener(this.eWrapper, 'click', clickHandler);
        this.addManagedListener(this.eLabel, 'click', clickHandler);
        if (this.pickerIcon) {
            const icon = createIconNoSpan(this.pickerIcon, this.gridOptionsService);
            if (icon) {
                this.eIcon.appendChild(icon);
            }
        }
    }
    refreshLabel() {
        if (exists(this.getLabel())) {
            setAriaLabelledBy(this.eWrapper, this.getLabelId());
        }
        else {
            this.eWrapper.removeAttribute('aria-labelledby');
        }
        super.refreshLabel();
    }
    setAriaLabel(label) {
        setAriaLabel(this.eWrapper, label);
        return this;
    }
    setInputWidth(width) {
        setElementWidth(this.eWrapper, width);
        return this;
    }
    getFocusableElement() {
        return this.eWrapper;
    }
}
__decorate([
    RefSelector('eLabel')
], AgPickerField.prototype, "eLabel", void 0);
__decorate([
    RefSelector('eWrapper')
], AgPickerField.prototype, "eWrapper", void 0);
__decorate([
    RefSelector('eDisplayField')
], AgPickerField.prototype, "eDisplayField", void 0);
__decorate([
    RefSelector('eIcon')
], AgPickerField.prototype, "eIcon", void 0);
