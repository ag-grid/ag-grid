import { AgLabel, IAgLabel } from "./agLabel";
import { PostConstruct } from "../context/context";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

interface ITextField extends IAgLabel {
    width?:number;
    value?: string;
}

export class AgInputTextField extends AgLabel {
    private static TEMPLATE =
        `<div class="ag-textfield">
            <label ref="eLabel"></label>
            <div class="ag-input-text-wrapper">
                <input type="text" ref="eInput" />
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eInput') private eInput: HTMLInputElement;

    private config: ITextField = {};

    constructor(config?: ITextField) {
        super(AgInputTextField.TEMPLATE);

        if (config) {
            this.config = config;
        }
    }

    @PostConstruct
    private postConstruct() {
        const { label, labelSeparator, labelWidth, width, value } = this.config;

        if (labelSeparator != null) {
            this.setLabelSeparator(labelSeparator);
        }

        if (label != null) {
            this.setLabel(label);
        }

        if (labelWidth != null) {
            this.setLabelWidth(labelWidth);
        }

        if (width != null) {
            this.setWidth(width);
        }

        if (value != null) {
            this.setValue(value);
        }
    }

    public getInputElement(): HTMLInputElement {
        return this.eInput;
    }

    public onInputChange(callbackFn: (newValue: number) => void) {
        this.addDestroyableEventListener(this.getInputElement(), 'input', () => {
            const newVal = parseInt(this.getValue(), 10);
            callbackFn(newVal);
        });
        return this;
    }

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    public getValue(): string {
        return this.eInput.value;
    }

    public setValue(value: string): this {
        if (this.getValue() === value) {
            return this;
        }

        this.eInput.value = value;

        return this;
    }
}