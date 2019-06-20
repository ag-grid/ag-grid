import { Component } from "./component";
import { PostConstruct } from "../context/context";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

interface ITextField {
    label?: string;
    labelSeparator?: string;
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
        const { label, labelSeparator, value } = this.config;

        if (labelSeparator != null) {
            this.setLabelSeparator(labelSeparator);
        }

        if (label != null) {
            this.setLabel(label);
        }

        if (value != null) {
            this.setValue(value);
        }
    }

    public getInputElement(): HTMLInputElement {
        return this.eInput;
    }

    public setLabelSeparator(labelSeparator: string) {
        if (this.labelSeparator === labelSeparator) {
            return;
        }

        this.labelSeparator = labelSeparator;

        if (this.label != null) {
            this.refreshLabel();
        }
    }

    public setLabel(label: string) {
        if (this.label === label) {
            return;
        }

        this.label = label;

        this.refreshLabel();
    }

    private refreshLabel() {
        this.eLabel.innerText = this.label + this.labelSeparator;
    }

    public getValue(): string {
        return this.eInput.value;
    }

    public setValue(value: string) {
        if (this.getValue() === value) {
            return;
        }

        this.eInput.value = value;
    }
}