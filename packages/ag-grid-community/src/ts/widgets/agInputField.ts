import { AgLabel, IAgLabel } from "./agLabel";
import { RefSelector } from "./componentAnnotations";
import { _ } from "../utils";

export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgInputField extends AgLabel {
    protected abstract className: string;
    protected abstract inputType: string;
    protected abstract inputTag: string;
    public abstract getValue(): any;
    public abstract setValue(value: any): this;

    protected config: IInputField = {};

    protected TEMPLATE =
        `<div class="ag-input-field">
            <label ref="eLabel"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper">
                <%input% ref="eInput"></%input%>
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
    }

    private setInputType() {
        if (_.exists(this.inputType)) {
            this.eInput.setAttribute('type', this.inputType);
        }
    }

    public getInputElement(): FieldElement {
        return this.eInput;
    }

    public onValueChange(callbackFn: (newValue: any) => void) {
        this.addDestroyableEventListener(this.getInputElement(), 'input', () => {
            const newVal = this.getValue();
            callbackFn(newVal);
        });
        return this;
    }

    public setInputWidth(width: number | 'flex'): this {
        _.setElementWidth(this.eWrapper, width);
        return this;
    }

    public setWidth(width: number): this {
        _.setFixedWidth(this.getGui(), width);
        return this;
    }
}