import { IAgLabel } from './agAbstractLabel';
import { RefSelector } from './componentAnnotations';
import { AgAbstractField, FieldElement } from './agAbstractField';
import { setDisabled, setElementWidth, addCssClass, addOrRemoveAttribute } from '../utils/dom';
import { _ } from '../utils';

export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}

export abstract class AgAbstractInputField<T extends FieldElement, K> extends AgAbstractField<K> {
    protected abstract inputType: string;

    protected config: IInputField = {};

    protected TEMPLATE = /* html */`
        <div role="presentation">
            <div ref="eLabel" class="ag-input-field-label"></div>
            <div ref="eWrapper" class="ag-wrapper ag-input-wrapper" role="presentation">
                <%displayField% ref="eInput" class="ag-input-field-input"></%displayField%>
            </div>
        </div>`;

    @RefSelector('eLabel') protected eLabel: HTMLElement;
    @RefSelector('eWrapper') protected eWrapper: HTMLElement;
    @RefSelector('eInput') protected eInput: T;

    protected postConstruct() {
        super.postConstruct();
        this.setInputType();

        addCssClass(this.eLabel, `${this.className}-label`);
        addCssClass(this.eWrapper, `${this.className}-input-wrapper`);
        addCssClass(this.eInput, `${this.className}-input`);
        addCssClass(this.getGui(), 'ag-input-field');

        this.eInput.id = this.eInput.id || `ag-${this.getCompId()}-input`;

        const { width, value } = this.config;

        if (width != null) {
            this.setWidth(width);
        }

        if (value != null) {
            this.setValue(value);
        }

        this.addInputListeners();
    }

    protected refreshLabel() {
        if (_.exists(this.getLabel())) {
            this.eInput.setAttribute('aria-labelledby', this.getLabelId());
        } else {
            this.eInput.removeAttribute('aria-labelledby');
        }

        super.refreshLabel();
    }

    protected addInputListeners() {
        this.addManagedListener(this.eInput, 'input', e => this.setValue(e.target.value));
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
        addOrRemoveAttribute(this.eInput, 'placeholder', placeholder);

        return this;
    }

    public setInputAriaLabel(label: string): this {
        this.eInput.setAttribute('aria-label', label);

        return this;
    }

    public setDisabled(disabled: boolean): this {
        setDisabled(this.eInput, disabled);

        return super.setDisabled(disabled);
    }
}
