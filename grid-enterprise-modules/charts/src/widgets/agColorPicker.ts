import { AgColorPanel } from "./agColorPanel";
import { _, IPickerFieldParams, AgPickerField, AgDialog, Component } from "@ag-grid-community/core";

interface ColorPickerConfig extends IPickerFieldParams {
    color: string;
}

export class AgColorPicker extends AgPickerField<HTMLElement, string> {
    constructor(config?: ColorPickerConfig) {
        super({
            pickerAriaLabelKey: 'ariaLabelColorPicker',
            pickerAriaLabelValue: 'Color Picker',
            pickerType: 'ag-list',
            ...config,
        }, 'ag-color-picker', 'colorPicker');

        if (config && config.color) {
            this.value = config.color;
        }
    }

    protected postConstruct() {
        super.postConstruct();

        if (this.value) {
            this.setValue(this.value);
        }
    }

    protected getPickerComponent(): Component {
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

        return colorDialog;
    }

    public showPicker() {
        this.isPickerDisplayed = true;

        if (!this.pickerComponent) {
            this.pickerComponent = this.getPickerComponent();
        }

        const colorDialog = this.pickerComponent as AgDialog;

        this.pickerComponent.addCssClass('ag-color-dialog');
        _.setAriaExpanded(this.eWrapper, true);

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
            } else {
                this.isDestroyingPicker = false;
            }

            if (this.isAlive()) {
                _.setAriaExpanded(this.eWrapper, false);
                this.getFocusableElement().focus();
            }

            this.isPickerDisplayed = false;
            this.pickerComponent = undefined;
        });
    }

    public hidePicker(): void {
        if (this.pickerComponent) {
            (this.pickerComponent as AgDialog).close();
        }
    }

    public setValue(color: string): this {
        if (this.value === color) { return this; }

        this.eDisplayField.style.backgroundColor = color;

        return super.setValue(color);
    }

    public getValue(): string {
        return this.value;
    }
}
