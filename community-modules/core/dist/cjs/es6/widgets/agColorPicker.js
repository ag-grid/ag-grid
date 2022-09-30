/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agColorPanel_1 = require("./agColorPanel");
const agDialog_1 = require("./agDialog");
const agPickerField_1 = require("./agPickerField");
const aria_1 = require("../utils/aria");
class AgColorPicker extends agPickerField_1.AgPickerField {
    constructor(config) {
        super(config, 'ag-color-picker', 'colorPicker');
        if (config && config.color) {
            this.value = config.color;
        }
    }
    postConstruct() {
        super.postConstruct();
        if (this.value) {
            this.setValue(this.value);
        }
    }
    showPicker() {
        const eGuiRect = this.getGui().getBoundingClientRect();
        const colorDialog = this.createBean(new agDialog_1.AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        }));
        this.isPickerDisplayed = true;
        colorDialog.addCssClass('ag-color-dialog');
        aria_1.setAriaExpanded(this.eWrapper, true);
        const colorPanel = this.createBean(new agColorPanel_1.AgColorPanel({ picker: this }));
        colorPanel.addDestroyFunc(() => {
            if (colorDialog.isAlive()) {
                this.destroyBean(colorDialog);
            }
        });
        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorDialog.addDestroyFunc(() => {
            // here we check if the picker was already being
            // destroyed to avoid a stack overflow
            if (!this.isDestroyingPicker) {
                this.isDestroyingPicker = true;
                if (colorPanel.isAlive()) {
                    this.destroyBean(colorPanel);
                }
            }
            else {
                this.isDestroyingPicker = false;
            }
            if (this.isAlive()) {
                aria_1.setAriaExpanded(this.eWrapper, false);
                this.getFocusableElement().focus();
            }
            this.isPickerDisplayed = false;
        });
        return colorDialog;
    }
    setValue(color) {
        if (this.value === color) {
            return this;
        }
        this.eDisplayField.style.backgroundColor = color;
        return super.setValue(color);
    }
    getValue() {
        return this.value;
    }
}
exports.AgColorPicker = AgColorPicker;
