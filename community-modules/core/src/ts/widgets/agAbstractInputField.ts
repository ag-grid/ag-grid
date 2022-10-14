import { IAgLabel } from './agAbstractLabel';
import { RefSelector } from './componentAnnotations';
import { AgAbstractField, FieldElement } from './agAbstractField';
import { setDisabled, setElementWidth, addOrRemoveAttribute } from '../utils/dom';
import { setAriaLabelledBy, setAriaLabel } from '../utils/aria';
import { exists } from '../utils/generic';

export interface IInputField extends IAgLabel {
    value?: any;
    width?: number;
}

export abstract class AgAbstractInputField<TElement extends FieldElement, TValue, TConfig extends IInputField = IInputField>
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
        if (exists(this.getLabel())) {
            setAriaLabelledBy(this.eInput, this.getLabelId());
        } else {
            this.eInput.removeAttribute('aria-labelledby');
        }

        super.refreshLabel();
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

    public setInputPlaceholder(placeholder: string): this {
        addOrRemoveAttribute(this.eInput, 'placeholder', placeholder);

        return this;
    }

    public setInputAriaLabel(label?: string | null): this {
        setAriaLabel(this.eInput, label);

        return this;
    }

    public setDisabled(disabled: boolean): this {
        setDisabled(this.eInput, disabled);

        return super.setDisabled(disabled);
    }
}
