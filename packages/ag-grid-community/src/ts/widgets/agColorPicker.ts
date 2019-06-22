import {Component} from "./component";
import {PostConstruct} from "../context/context";
import {RefSelector} from "./componentAnnotations";
import {_} from "../utils";
import {AgDialog} from "./agDialog";
import {AgColorPanel} from "./agColorPanel";

type ColorMode = 'hex' | 'hsl' | 'rgba';

interface ColorPickerConfig {
    hideTextField?: boolean;
    color: string;
    mode: ColorMode;
}

export class AgColorPicker extends Component {
    private static TEMPLATE =
        `<div class="ag-color-picker">
             <div style="display: flex"> <!-- TODO -->
                <label ref="eLabel"></label>
                <div class="ag-color-button" ref="eButton"></div>
            </div>
        </div>`;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eButton') private eButton: HTMLElement;

    private hideTextField: boolean = true;
    private mode: ColorMode = 'hex';
    private color: string;

    private label: string;
    private labelSeparator: string = ':';

    constructor(config?: ColorPickerConfig) {
        super(AgColorPicker.TEMPLATE);

        if (config) {
            if (config.hideTextField) {
                this.hideTextField = config.hideTextField;
            }
            if (config.mode && config.mode !== 'hex') {
                this.mode = config.mode;
            }
            if (config.color) {
                this.color = config.color;
            }
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

    public setLabelSeparator(labelSeparator: string): AgColorPicker {
        if (this.labelSeparator === labelSeparator) {
            return this;
        }

        this.labelSeparator = labelSeparator;

        if (this.label != null) {
            this.refreshLabel();
        }

        return this;
    }

    public setLabel(label: string): AgColorPicker {
        if (this.label === label) {
            return this;
        }

        this.label = label;

        this.refreshLabel();

        return this;
    }

    public setLabelWidth(width: number): AgColorPicker {
        if (this.label != null) {
            _.setFixedWidth(this.eLabel, width);
        }
        return this;
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
        // this.eInput.setValue(this.color);
        this.dispatchEvent({type: 'valueChange'});
        return this;
    }

    private refreshLabel() {
        this.eLabel.innerText = this.label + this.labelSeparator;
    }

    public onColorChange(callbackFn: (newColor: string) => void): AgColorPicker {
        this.addDestroyableEventListener(this, 'valueChange', () => {
            callbackFn(this.color);
        });
        return this;
    }
}