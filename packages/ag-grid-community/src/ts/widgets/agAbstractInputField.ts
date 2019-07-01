import { IAgLabel } from "./agAbstractLabel";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";
import { AgAbstractField } from "./agAbstractField";

export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgAbstractInputField<T> extends AgAbstractField<T> {
    protected abstract className: string;
    protected abstract inputType: string;

    protected config: IInputField = {};
    protected value: T;

    protected TEMPLATE =
        `<div class="ag-input-field">
            <label ref="eLabel"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper">
                <%displayField% ref="eInput"></%displayField%>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eWrapper') protected eWrapper: HTMLElement;
    @RefSelector('eInput') protected eInput: FieldElement;

    protected postConstruct() {
        super.postConstruct();
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

        this.addInputListeners();
    }

    protected addInputListeners() {
        this.addDestroyableEventListener(this.eInput, 'input', (e) => {
            const value = e.target.value;

            this.setValue(value);
        });
    }

    private setInputType() {
        if (this.inputType) {
            this.eInput.setAttribute('type', this.inputType);
        }
    }

    public getInputElement(): FieldElement {
        return this.eInput;
    }

    public onValueChange(callbackFn: (newValue: T) => void) {
        this.addDestroyableEventListener(this, AgAbstractField.EVENT_CHANGED, () => {
            callbackFn(this.getValue());
        });
        return this;
    }

    public setInputWidth(width: number | 'flex'): this {
        _.setElementWidth(this.eWrapper, width);
        return this;
    }

    public setInputName(name: string): this {
        this.getInputElement().setAttribute('name', name);

        return this;
    }

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }

    public getValue(): T {
        return this.value;
    }

    public setValue(value: T, silent?: boolean): this {
        if (this.value === value) {
            return this;
        }

        this.value = value;

        if (!silent) {
            this.dispatchEvent({ type: AgAbstractField.EVENT_CHANGED });
        }

        return this;
    }
}