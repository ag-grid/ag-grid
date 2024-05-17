import { AgDialog } from "@ag-grid-enterprise/core";
import { AgColorPanel } from "./agColorPanel";
import { AgPickerFieldParams, AgPickerField } from "@ag-grid-community/core";

export interface AgColorPickerParams extends Omit<AgPickerFieldParams, 'pickerType' | 'pickerAriaLabelKey' | 'pickerAriaLabelValue'> {
    pickerType?: string;
    pickerAriaLabelKey?: string;
    pickerAriaLabelValue?: string;
}

export class AgColorPicker extends AgPickerField<string, AgColorPickerParams & AgPickerFieldParams, AgDialog> {

    private isDestroyingPicker: boolean;

    constructor(config?: AgColorPickerParams) {
        super({
            pickerAriaLabelKey: 'ariaLabelColorPicker',
            pickerAriaLabelValue: 'Color Picker',
            pickerType: 'ag-list',
            className: 'ag-color-picker',
            pickerIcon: 'colorPicker',
            ...config,
        });
    }

    protected postConstruct() {
        super.postConstruct();

        if (this.value) {
            this.setValue(this.value);
        }
    }

    protected createPickerComponent() {
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

    protected renderAndPositionPicker(): (() => void) {
        const pickerComponent = this.pickerComponent!;
        const colorPanel = this.createBean(new AgColorPanel({ picker: this }));

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
            } else {
                this.isDestroyingPicker = false;
            }
        });

        return () => this.pickerComponent?.close();
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
