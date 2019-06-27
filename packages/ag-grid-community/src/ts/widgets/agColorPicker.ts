import { AgColorPanel } from "./agColorPanel";
import { AgDialog } from "./agDialog";
import { AgLabel, IAgLabel } from "./agLabel";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

type ColorMode = 'hex' | 'hsl' | 'rgba';

interface ColorPickerConfig extends IAgLabel {
    hideTextField?: boolean;
    color: string;
    mode: ColorMode;
}

export class AgColorPicker extends AgLabel {
    private static TEMPLATE =
        `<div class="ag-color-picker">
            <label ref="eLabel"></label>

            <!-- TODO $icon-size 30px for the color picker (???) -->
            <div class="ag-color-button" ref="eButton" style="width: 30px"></div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eButton') private eButton: HTMLElement;

    private color: string;

    constructor(config?: ColorPickerConfig) {
        super(AgColorPicker.TEMPLATE);

        if (config && config.color) {
            this.color = config.color;
        }
    }

    protected postConstruct() {
        super.postConstruct();
        if (this.color) {
            this.setValue(this.color);
        }
        this.addDestroyableEventListener(this.eButton, 'click', () => {
            this.showColorPicker();
        });
    }

    private showColorPicker() {
        const eGuiRect = this.getGui().getBoundingClientRect();
        const colorDialog = new AgDialog({
            closable: false,
            modal: true,
            hideTitleBar: true,
            minWidth: 200,
            width: 200,
            height: 280,
            x: eGuiRect.right - 200,
            y: eGuiRect.top - 280
        });
        this.getContext().wireBean(colorDialog);

        const colorPanel = new AgColorPanel({
            picker: this
        });

        this.getContext().wireBean(colorPanel);

        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);
        colorPanel.setValue(this.getValue());

        colorDialog.addDestroyFunc(() => {
            if (colorPanel.isAlive()) {
                colorPanel.destroy();
            }
        });
    }

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    public getValue(): string {
        return this.color;
    }

    public setValue(color: string): this {
        this.color = color;
        this.eButton.style.backgroundColor = color;
        this.dispatchEvent({ type: 'valueChange' });
        return this;
    }

    public onColorChange(callbackFn: (newColor: string) => void): this {
        this.addDestroyableEventListener(this, 'valueChange', () => {
            callbackFn(this.color);
        });
        return this;
    }
}