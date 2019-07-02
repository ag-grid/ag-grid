import { AgColorPanel } from "./agColorPanel";
import { AgDialog } from "./agDialog";
import { IAgLabel } from "./agAbstractLabel";
import { AgPickerField } from "./agPickerField";
import { AgAbstractField } from "./agAbstractField";
import { _ } from "../utils";

interface ColorPickerConfig extends IAgLabel {
    color: string;
}

export class AgColorPicker extends AgPickerField<HTMLElement, string> {

    protected displayTag = 'div';
    protected className = 'ag-color-picker';
    protected pickerIcon = 'colorPicker';

    constructor(config?: ColorPickerConfig) {
        super();
        this.setTemplate(this.TEMPLATE.replace(/%displayField%/g, this.displayTag));

        if (config && config.color) {
            this.value = config.color;
        }
    }

    protected postConstruct() {
        super.postConstruct();
        _.addCssClass(this.getGui(), this.className);
        this.addDestroyableEventListener(this.eDisplayField, 'click', () => this.showPicker());

        if (this.value) {
            this.setValue(this.value);
        }
    }

    protected showPicker() {
        if (this.displayedPicker) {
            this.displayedPicker = false;
            return;
        }

        const eGuiRect = this.getGui().getBoundingClientRect();
        const colorDialog = new AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 190,
            width: 190,
            height: 250,
            x: eGuiRect.right - 190,
            y: eGuiRect.top - 250
        });

        _.addCssClass(colorDialog.getGui(), 'ag-color-dialog');
        this.getContext().wireBean(colorDialog);

        const colorPanel = new AgColorPanel({
            picker: this
        });

        this.getContext().wireBean(colorPanel);

        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());

        colorDialog.addDestroyFunc(() => {
            this.displayedPicker = false;
            if (colorPanel.isAlive()) {
                colorPanel.destroy();
            }
        });
    }

    public setValue(color: string): this {
        this.value = color;
        this.eDisplayField.style.backgroundColor = color;
        this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });

        return this;
    }
}