import { IAgLabel } from './agAbstractLabel';
import { RefSelector } from './componentAnnotations';
import { AgAbstractField, FieldElement } from './agAbstractField';
import { setDisabled, setElementWidth, addCssClass } from '../utils/dom';

export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}

export abstract class AgAbstractInputField<T extends FieldElement, K> extends AgAbstractField<K> {
    protected abstract inputType: string;

    protected config: IInputField = {};

    protected TEMPLATE = /* html */`
        <div role="presentation">
            <label ref="eLabel" class="ag-input-field-label"></label>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper" role="presentation">
                <%displayField% ref="eInput" class="ag-input-field-input"></%displayField%>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLLabelElement;
    @RefSelector('eWrapper') protected eWrapper: HTMLElement;
    @RefSelector('eInput') protected eInput: T;

    protected postConstruct() {
        super.postConstruct();
        this.setInputType();

        addCssClass(this.eLabel, `${this.className}-label`);
        addCssClass(this.eWrapper, `${this.className}-input-wrapper`);
        addCssClass(this.eInput, `${this.className}-input`);
        addCssClass(this.getGui(), 'ag-input-field');

        const inputId = this.eInput.id ? this.eInput.id : `ag-input-id-${this.getCompId()}`;
        this.eLabel.htmlFor = inputId;
        this.eInput.id = inputId;

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
        this.addManagedListener(this.eInput, 'input', (e) => {
            const value = e.target.value;

            this.setValue(value);
        });
    }

    private setInputType() {
        if (this.inputType) {
            this.eInput.setAttribute('type', this.inputType);
        }
    }

    public getInputElement(): T {
        return this.eInput;
    }

    public setInputWidth(width: number | 'flex'): this {
        setElementWidth(this.eWrapper, width);

        return this;
    }

    public setInputName(name: string): this {
        this.getInputElement().setAttribute('name', name);

        return this;
    }

    public getFocusableElement(): HTMLElement {
        return this.eInput;
    }

    public setMaxLength(length: number): this {
        const eInput = this.eInput as HTMLInputElement | HTMLTextAreaElement;
        eInput.maxLength = length;

        return this;
    }

    public setInputPlaceholder(placeholder: string): this {
        const eInput = this.eInput;
        const attributeName = 'placeholder';

        if (placeholder) {
            eInput.setAttribute(attributeName, placeholder);
        } else {
            eInput.removeAttribute(attributeName);
        }

        return this;
    }

    public setDisabled(disabled: boolean): this {
        setDisabled(this.eInput, disabled);

        return super.setDisabled(disabled);
    }
}
