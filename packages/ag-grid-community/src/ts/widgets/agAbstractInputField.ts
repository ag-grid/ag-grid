import { IAgLabel } from "./agAbstractLabel";
import { RefSelector } from "./componentAnnotations";
import { AgAbstractField } from "./agAbstractField";
import { _ } from "../utils";

export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}

export type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
export abstract class AgAbstractInputField<T extends FieldElement, K> extends AgAbstractField<K> {
    protected abstract className: string;
    protected abstract inputType: string;

    protected config: IInputField = {};

    protected TEMPLATE =
        `<div class="ag-input-field" role="presentation">
            <label ref="eLabel"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper" role="presentation">
                <%displayField% ref="eInput"></%displayField%>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eWrapper') protected eWrapper: HTMLElement;
    @RefSelector('eInput') protected eInput: T;

    protected postConstruct() {
        super.postConstruct();
        this.setInputType();
        _.addCssClass(this.getGui(), this.className);

        const { width, value } = this.config;

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

    public setInputWidth(width: number | 'flex'): this {
        _.setElementWidth(this.eWrapper, width);
        return this;
    }

    public setInputName(name: string): this {
        this.getInputElement().setAttribute('name', name);

        return this;
    }
}