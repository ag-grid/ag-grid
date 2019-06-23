import { AgColorPanel } from "./agColorPanel";
import { AgDialog } from "./agDialog";
import { AgLabel, IAgLabel } from "./agLabel";
import { PostConstruct } from "../context/context";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

type ColorMode = 'hex' | 'hsl' | 'rgba';

interface ColorPickerConfig extends IAgLabel{
    hideTextField?: boolean;
    color: string;
    mode: ColorMode;
}

export class AgColorPicker extends AgLabel {
    private static TEMPLATE =
        `<div class="ag-color-picker">
            <label ref="eLabel"></label>
            <div class="ag-color-button" ref="eButton"></div>
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

    @PostConstruct
    private postConstruct() {
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
            width: 200,
            height: 320,
            x: eGuiRect.left,
            y: eGuiRect.top - 320
        });
        this.getContext().wireBean(colorDialog);

        const colorPanel = new AgColorPanel({
            picker: this
        });

        this.getContext().wireBean(colorPanel);

        colorDialog.setParentComponent(this);
        colorDialog.setBodyComponent(colorPanel);

        colorDialog.addDestroyFunc(() => {
            if (colorPanel.isAlive()) {
                colorPanel.destroy();
            }
        });
    }

    public setWidth(width: number): AgColorPicker {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    public getValue(): string {
        return this.color;
    }

    public setValue(color: string): AgColorPicker {
        this.color = color;
        this.eButton.style.backgroundColor = color;
        this.dispatchEvent({ type: 'valueChange' });
        return this;
    }

    public onColorChange(callbackFn: (newColor: string) => void): AgColorPicker {
        this.addDestroyableEventListener(this, 'valueChange', () => {
            callbackFn(this.color);
        });
        return this;
    }
}