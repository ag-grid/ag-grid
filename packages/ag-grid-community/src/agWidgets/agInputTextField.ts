import type {
    AgComponentSelector,
    AgCoreBeanCollection,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';
import {
    _createAgElement,
    _exists,
    _isEventFromPrintableCharacter,
    _setAriaInvalid,
    _setAriaLabel,
    _setDisplayed,
} from 'ag-stack';

import type { AgAbstractInputFieldEvent } from './agAbstractInputField';
import { AgAbstractInputField } from './agAbstractInputField';
import type { AgInputFieldParams } from './agFieldParams';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

// date inputs retain their browser-provided clear control; these types need the grid-provided button.
const CUSTOM_CLEAR_BUTTON_INPUT_TYPES: ReadonlySet<string> = new Set(['number', 'text']);

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgInputTextFieldParams<
    TComponentSelectorType extends string,
> extends AgInputFieldParams<TComponentSelectorType> {
    allowedCharPattern?: string;
    clearButton?: boolean;
    onValueClear?: () => void;
}
export type AgInputTextFieldEvent = AgAbstractInputFieldEvent | 'fieldValueCleared';
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class AgInputTextField<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TConfig extends AgInputTextFieldParams<TComponentSelectorType> = AgInputTextFieldParams<TComponentSelectorType>,
    TEventType extends string = AgInputTextFieldEvent,
> extends AgAbstractInputField<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    HTMLInputElement,
    string,
    TConfig,
    AgInputTextFieldEvent | TEventType
> {
    private eClearButton: HTMLButtonElement | undefined;
    private clearButtonEnabled: boolean = false;

    constructor(config?: TConfig, className = 'ag-text-field', inputType = 'text') {
        super(config, className, inputType);
    }

    public override postConstruct() {
        super.postConstruct();

        const { allowedCharPattern, clearButton, onValueClear } = this.config;

        if (allowedCharPattern) {
            this.preventDisallowedCharacters();
        }
        if (clearButton) {
            this.setClearButtonEnabled(true);
        }
        if (onValueClear) {
            this.onValueClear(onValueClear);
        }
        this.addManagedPropertyListener('suppressInputClearButton', () => this.refreshClearButton());
    }

    public override setInputType(inputType?: string): void {
        super.setInputType(inputType);
        this.refreshClearButton();
    }

    public override setValue(value?: string | null, silent?: boolean): this {
        const eInput = this.eInput;
        // update the input before we call super.setValue, so it's updated before the value changed event is fired
        if (eInput.value !== value) {
            eInput.value = _exists(value) ? value : '';
        }
        this.refreshClearButton();

        return super.setValue(value, silent);
    }

    public setClearButtonEnabled(enabled: boolean): this {
        this.clearButtonEnabled = enabled;
        if (enabled && !this.eClearButton) {
            this.createClearButton();
        }
        this.refreshClearButton();
        return this;
    }

    public onValueClear(callbackFn: () => void): this {
        this.addManagedListeners<AgInputTextFieldEvent>(this, { fieldValueCleared: callbackFn });
        return this;
    }

    public override setDisabled(disabled: boolean): this {
        super.setDisabled(disabled);
        this.refreshClearButton();
        return this;
    }

    /** Used to set an initial value into the input without necessarily setting `this.value` or triggering events (e.g. to set an invalid value) */
    public setStartValue(value?: string | null): void {
        this.setValue(value, true);
    }

    public setCustomValidity(message: string): void {
        const eInput = this.eInput;
        const isInvalid = message.length > 0;
        eInput.setCustomValidity(message);

        // Firefox automatically displays tooltips when inputs are invalid, but chrome and safari do not,
        // so we need to call `reportValidity`.
        if (isInvalid) {
            eInput.reportValidity();
        }

        _setAriaInvalid(eInput, isInvalid);
    }

    private clearInput(): void {
        const { eInput } = this;
        eInput.focus();
        if (!eInput.value) {
            return;
        }

        // silent, so consumers get exactly one notification per clear: fieldValueCleared
        this.setValue('', true);
        this.dispatchLocalEvent({ type: 'fieldValueCleared' });
    }

    private createClearButton(): void {
        const eClearButton = _createAgElement<HTMLButtonElement>({
            tag: 'button',
            cls: 'ag-input-field-clear-button',
            attrs: { type: 'button', tabindex: '-1' },
        });

        const clearIcon = this.beans.iconSvc.createIconNoSpan('cancel');
        if (clearIcon) {
            eClearButton.appendChild(clearIcon);
        }
        _setAriaLabel(eClearButton, this.getLocaleTextFunc()('ariaLabelInputClear', 'Clear'));
        this.addManagedElementListeners(eClearButton, {
            mousedown: (event: MouseEvent) => event.preventDefault(),
            click: () => this.clearInput(),
        });
        this.eWrapper.appendChild(eClearButton);
        this.eClearButton = eClearButton;
    }

    private refreshClearButton(): void {
        const { eClearButton, eInput } = this;
        if (!eClearButton || !eInput) {
            return;
        }
        const supportsClearButton =
            this.clearButtonEnabled &&
            !this.gos.get('suppressInputClearButton') &&
            CUSTOM_CLEAR_BUTTON_INPUT_TYPES.has(eInput.type);

        const canDisplay = supportsClearButton && !this.isDisabled();
        eInput.classList.toggle('ag-input-field-input-with-clear-button', canDisplay);
        _setDisplayed(eClearButton, canDisplay && !!eInput.value);
    }

    private preventDisallowedCharacters(): void {
        const pattern = new RegExp(`[${this.config.allowedCharPattern}]`);

        const preventCharacters = (event: KeyboardEvent) => {
            if (!_isEventFromPrintableCharacter(event)) {
                return;
            }

            if (event.key && !pattern.test(event.key)) {
                event.preventDefault();
            }
        };

        this.addManagedListeners(this.eInput, {
            keydown: preventCharacters,
            paste: (e: ClipboardEvent) => {
                const text = e.clipboardData?.getData('text');

                if (text?.split('').some((c) => !pattern.test(c))) {
                    e.preventDefault();
                }
            },
        });
    }
}
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export const AgInputTextFieldSelector: AgComponentSelector<AgWidgetSelectorType> = {
    selector: 'AG-INPUT-TEXT-FIELD',
    component: AgInputTextField,
};
