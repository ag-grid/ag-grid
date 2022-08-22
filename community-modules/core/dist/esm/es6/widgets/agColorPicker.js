/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { AgColorPanel } from "./agColorPanel";
import { AgDialog } from "./agDialog";
import { AgPickerField } from "./agPickerField";
import { setAriaExpanded } from "../utils/aria";
export class AgColorPicker extends AgPickerField {
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
        const colorDialog = this.createBean(new AgDialog({
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
        setAriaExpanded(this.eWrapper, true);
        const colorPanel = this.createBean(new AgColorPanel({ picker: this }));
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
                setAriaExpanded(this.eWrapper, false);
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
