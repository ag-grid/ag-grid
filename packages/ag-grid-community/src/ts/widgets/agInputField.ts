import { AgLabel, IAgLabel } from "./agLabel";
import { PostConstruct, PreConstruct } from "../context/context";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}
export abstract class AgInputField extends AgLabel {
    protected abstract className: string;
    protected abstract inputType: string;
    public abstract getValue(): any;
    public abstract setValue(value: any): void;
    protected config: IInputField = {};

    private static TEMPLATE =
        `<div class="ag-input-field">
            <label ref="eLabel"></label>
            <div ref="eInputWrapper" class="ag-input-wrapper">
                <input ref="eInput" />
            </div>
        </div>`;

    @RefSelector('eInputWrapper') protected eInputWrapper: HTMLElement;
    @RefSelector('eInput') protected eInput: HTMLInputElement;

    constructor() {
        super(AgInputField.TEMPLATE);
    }

    @PostConstruct
    protected postConstruct() {
        this.setInputType();
        _.addCssClass(this.getGui(), this.className);

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

    private setInputType() {
        this.eInput.setAttribute('type', this.inputType);
    }

    public getInputElement(): HTMLInputElement {
        return this.eInput;
    }

    public onInputChange(callbackFn: (newValue: any) => void) {
        this.addDestroyableEventListener(this.getInputElement(), 'input', () => {
            const newVal = this.getValue();
            callbackFn(newVal);
        });
        return this;
    }

    public setInputWidth(width: number | 'flex'): this {
        _.setElementWidth(this.eInputWrapper, width);
        return this;
    }

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }
}