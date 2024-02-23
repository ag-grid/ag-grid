import { RefSelector } from './componentAnnotations';
import { AgAbstractField, AgFieldParams, FieldElement } from './agAbstractField';
import { setDisabled, setElementWidth, addOrRemoveAttribute } from '../utils/dom';
import { setAriaLabel } from '../utils/aria';

export interface AgInputFieldParams extends AgFieldParams {
    inputName?: string;
    inputWidth?: number | 'flex';
}

export abstract class AgAbstractInputField<TElement extends FieldElement, TValue, TConfig extends AgInputFieldParams = AgInputFieldParams>
    extends AgAbstractField<TValue, TConfig> {
    @RefSelector('eLabel') protected readonly eLabel: HTMLElement;
    @RefSelector('eWrapper') protected readonly eWrapper: HTMLElement;
    @RefSelector('eInput') protected readonly eInput: TElement;

    constructor(config?: TConfig, className?: string, private readonly inputType: string | null = 'text', private readonly displayFieldTag = 'input') {
        super(config, /* html */`
            <div role="presentation">
                <div ref="eLabel" class="ag-input-field-label"></div>
                <div ref="eWrapper" class="ag-wrapper ag-input-wrapper" role="presentation">
                    <${displayFieldTag} ref="eInput" class="ag-input-field-input"></${displayFieldTag}>
                </div>
            </div>`, className);
    }

    protected postConstruct() {
        super.postConstruct();
        this.setInputType();

        this.eLabel.classList.add(`${this.className}-label`);
        this.eWrapper.classList.add(`${this.className}-input-wrapper`);
        this.eInput.classList.add(`${this.className}-input`);
        this.addCssClass('ag-input-field');

        this.eInput.id = this.eInput.id || `ag-${this.getCompId()}-input`;

        const { inputName, inputWidth } = this.config;
        if (inputName != null) {
            this.setInputName(inputName);
        }
        if (inputWidth != null) {
            this.setInputWidth(inputWidth);
        }

        this.addInputListeners();
        this.activateTabIndex([this.eInput]);
    }

    protected addInputListeners() {
        this.addManagedListener(this.eInput, 'input', e => this.setValue(e.target.value));
    }

    private setInputType() {
        if (this.displayFieldTag === 'input') {
            this.eInput.setAttribute('type', this.inputType!);
        }
    }

    public getInputElement(): TElement {
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

    public setInputPlaceholder(placeholder?: string | null): this {
        addOrRemoveAttribute(this.eInput, 'placeholder', placeholder);

        return this;
    }

    public setInputAriaLabel(label?: string | null): this {
        setAriaLabel(this.eInput, label);
        this.refreshAriaLabelledBy();

        return this;
    }

    public setDisabled(disabled: boolean): this {
        setDisabled(this.eInput, disabled);

        return super.setDisabled(disabled);
    }

    public setAutoComplete(value: boolean | string) {
        if (value === true) {
            // Remove the autocomplete attribute if the value is explicitly set to true
            // to allow the default browser autocomplete/autofill behaviour.
            addOrRemoveAttribute(this.eInput, 'autocomplete', null);
        } else {
            // When a string is provided, use it as the value of the autocomplete attribute.
            // This enables users to specify how they want to the browser to handle the autocomplete on the input, as per spec:
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values
            const autoCompleteValue = typeof value === 'string' ? value : 'off'
            addOrRemoveAttribute(this.eInput, 'autocomplete', autoCompleteValue);
        }
        return this;
    }
}
