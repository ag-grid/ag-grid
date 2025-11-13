import { RefPlaceholder } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _setAriaLabel } from '../utils/aria';
import type { AgElementParams } from '../utils/dom';
import { _addOrRemoveAttribute, _setDisabled, _setElementWidth } from '../utils/dom';
import type { AgAbstractFieldEvent, FieldElement } from './agAbstractField';
import { AgAbstractField } from './agAbstractField';
import type { AgInputFieldParams } from './agFieldParams';

function buildTemplate<TComponentSelectorType extends string>(
    displayFieldTag: keyof HTMLElementTagNameMap
): AgElementParams<TComponentSelectorType> {
    return {
        tag: 'div',
        role: 'presentation',
        children: [
            { tag: 'div', ref: 'eLabel', cls: 'ag-input-field-label' },
            {
                tag: 'div',
                ref: 'eWrapper',
                cls: 'ag-wrapper ag-input-wrapper',
                role: 'presentation',
                children: [{ tag: displayFieldTag, ref: 'eInput', cls: 'ag-input-field-input' }],
            },
        ],
    };
}

export type AgAbstractInputFieldEvent = AgAbstractFieldEvent;
export abstract class AgAbstractInputField<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TElement extends FieldElement,
    TValue,
    TConfig extends AgInputFieldParams<TComponentSelectorType> = AgInputFieldParams<TComponentSelectorType>,
    TEventType extends string = AgAbstractInputFieldEvent,
> extends AgAbstractField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    TValue,
    TConfig,
    AgAbstractInputFieldEvent | TEventType
> {
    protected readonly eLabel: HTMLElement = RefPlaceholder;
    protected readonly eWrapper: HTMLElement = RefPlaceholder;
    protected readonly eInput: TElement = RefPlaceholder;

    constructor(
        config?: TConfig,
        className?: string,
        private inputType: string | null | undefined = 'text',
        private readonly displayFieldTag: keyof HTMLElementTagNameMap = 'input'
    ) {
        super(config, config?.template ?? buildTemplate(displayFieldTag), [], className);
    }

    public override postConstruct() {
        super.postConstruct();
        this.setInputType(this.inputType!);

        const { eLabel, eWrapper, eInput, className } = this;
        eLabel.classList.add(`${className}-label`);
        eWrapper.classList.add(`${className}-input-wrapper`);
        eInput.classList.add(`${className}-input`);
        this.addCss('ag-input-field');

        eInput.id = eInput.id || `ag-${this.getCompId()}-input`;

        const { inputName, inputWidth, inputPlaceholder, autoComplete, tabIndex } = this.config;
        if (inputName != null) {
            this.setInputName(inputName);
        }
        if (inputWidth != null) {
            this.setInputWidth(inputWidth);
        }
        if (inputPlaceholder != null) {
            this.setInputPlaceholder(inputPlaceholder);
        }
        if (autoComplete != null) {
            this.setAutoComplete(autoComplete);
        }

        this.addInputListeners();
        this.activateTabIndex([eInput], tabIndex);
    }

    protected addInputListeners() {
        this.addManagedElementListeners(this.eInput, {
            input: (e: InputEvent) => this.setValue((e.target as HTMLInputElement).value as TValue),
        });
    }

    public setInputType(inputType?: string) {
        if (this.displayFieldTag === 'input') {
            this.inputType = inputType;
            _addOrRemoveAttribute(this.eInput, 'type', inputType);
        }
    }

    public getInputElement(): TElement {
        return this.eInput;
    }

    public getWrapperElement(): HTMLElement {
        return this.eWrapper;
    }

    public setInputWidth(width: number | 'flex'): this {
        _setElementWidth(this.eWrapper, width);

        return this;
    }

    public setInputName(name: string): this {
        this.getInputElement().setAttribute('name', name);

        return this;
    }

    public override getFocusableElement(): HTMLElement {
        return this.eInput;
    }

    public setMaxLength(length: number): this {
        const eInput = this.eInput as HTMLInputElement | HTMLTextAreaElement;
        eInput.maxLength = length;

        return this;
    }

    public setInputPlaceholder(placeholder?: string | null): this {
        _addOrRemoveAttribute(this.eInput, 'placeholder', placeholder);

        return this;
    }

    public setInputAriaLabel(label?: string | null): this {
        _setAriaLabel(this.eInput, label);
        this.refreshAriaLabelledBy();

        return this;
    }

    public override setDisabled(disabled: boolean): this {
        _setDisabled(this.eInput, disabled);

        return super.setDisabled(disabled);
    }

    public setAutoComplete(value: boolean | string) {
        if (value === true) {
            // Remove the autocomplete attribute if the value is explicitly set to true
            // to allow the default browser autocomplete/autofill behaviour.
            _addOrRemoveAttribute(this.eInput, 'autocomplete', null);
        } else {
            // When a string is provided, use it as the value of the autocomplete attribute.
            // This enables users to specify how they want to the browser to handle the autocomplete on the input, as per spec:
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values
            const autoCompleteValue = typeof value === 'string' ? value : 'off';
            _addOrRemoveAttribute(this.eInput, 'autocomplete', autoCompleteValue);
        }
        return this;
    }
}
