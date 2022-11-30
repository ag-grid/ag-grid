import { AgColorPanel } from "./agColorPanel";
import { _, Internal } from "@ag-grid-community/core";

interface ColorPickerConfig extends Internal.IAgLabel {
    color: string;
}

export class AgColorPicker extends Internal.AgPickerField<HTMLElement, string> {
    constructor(config?: ColorPickerConfig) {
        super(config, 'ag-color-picker', 'colorPicker');

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

    public showPicker() {
        const eGuiRect = this.getGui().getBoundingClientRect();
        const colorDialog = this.createBean(new Internal.AgDialog({
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
        });

        return colorDialog;
    }

    public setValue(color: string): this {
        if (this.value === color) { return this; }

        this.eDisplayField.style.backgroundColor = color;
        console.log('setting vlaues')
        return super.setValue(color);
    }

    public getValue(): string {
        return this.value;
    }
}
