"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgColorPicker = void 0;
const agColorPanel_1 = require("./agColorPanel");
const core_1 = require("@ag-grid-community/core");
class AgColorPicker extends core_1.AgPickerField {
    constructor(config) {
        super(Object.assign({ pickerAriaLabelKey: 'ariaLabelColorPicker', pickerAriaLabelValue: 'Color Picker', pickerType: 'ag-list', className: 'ag-color-picker', pickerIcon: 'colorPicker' }, config));
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
    createPickerComponent() {
        const eGuiRect = this.getGui().getBoundingClientRect();
        const colorDialog = this.createBean(new core_1.AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        }));
        return colorDialog;
    }
    renderAndPositionPicker() {
        const pickerComponent = this.pickerComponent;
        const colorPanel = this.createBean(new agColorPanel_1.AgColorPanel({ picker: this }));
        pickerComponent.addCssClass('ag-color-dialog');
        colorPanel.addDestroyFunc(() => {
            if (pickerComponent.isAlive()) {
                this.destroyBean(pickerComponent);
            }
        });
        pickerComponent.setParentComponent(this);
        pickerComponent.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());
        colorPanel.getGui().focus();
        pickerComponent.addDestroyFunc(() => {
            // here we check if the picker was already being
            // destroyed to avoid a stack overflow
            if (!this.isDestroyingPicker) {
                this.beforeHidePicker();
                this.isDestroyingPicker = true;
                if (colorPanel.isAlive()) {
                    this.destroyBean(colorPanel);
                }
                if (this.isAlive()) {
                    this.getFocusableElement().focus();
                }
            }
            else {
                this.isDestroyingPicker = false;
            }
        });
        return () => { var _a; return (_a = this.pickerComponent) === null || _a === void 0 ? void 0 : _a.close(); };
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
