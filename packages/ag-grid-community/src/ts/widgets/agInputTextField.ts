import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

interface ITextField {
    label?: string;
    labelWidth?: number;
    labelSeparator?: string;
    width?:number;
    value?: string;
}

export class AgInputTextField extends Component {
    private static TEMPLATE =
        `<div class="ag-textfield">
            <label ref="eLabel"></label>
            <div class="ag-input-text-wrapper">
                <input type="text" ref="eInput" />
            </div>
        </div>`;

    @RefSelector('eLabel') private eLabel: HTMLElement;
    @RefSelector('eInput') private eInput: HTMLInputElement;

    private label: string;
    private labelSeparator: string = ':';
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

    public setLabelSeparator(labelSeparator: string): AgInputTextField {
        if (this.labelSeparator === labelSeparator) {
            return this;
        }

        this.labelSeparator = labelSeparator;

        if (this.label != null) {
            this.refreshLabel();
        }

        return this;
    }

    public setLabel(label: string): AgInputTextField {
        if (this.label === label) {
            return this;
        }

        this.label = label;

        this.refreshLabel();

        return this;
    }

    public setLabelWidth(width: number): AgInputTextField {
        if (this.label != null) {
            _.setFixedWidth(this.eLabel, width);
        }
        return this;
    }

    public setWidth(width: number): AgInputTextField {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    private refreshLabel() {
        this.eLabel.innerText = this.label + this.labelSeparator;
    }

    public getValue(): string {
        return this.eInput.value;
    }

    public setValue(value: string): AgInputTextField {
        if (this.getValue() === value) {
            return this;
        }

        this.eInput.value = value;

        return this;
    }
}