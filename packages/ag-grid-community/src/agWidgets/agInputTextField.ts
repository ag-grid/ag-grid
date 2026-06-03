import type {
    AgComponentSelector,
    AgCoreBeanCollection,
    BaseEvents,
    BaseProperties,
    IPropertiesService,
} from 'ag-stack';
import { _exists, _isEventFromPrintableCharacter, _setAriaInvalid } from 'ag-stack';

import type { AgAbstractInputFieldEvent } from './agAbstractInputField';
import { AgAbstractInputField } from './agAbstractInputField';
import type { AgInputFieldParams } from './agFieldParams';
import type { AgWidgetSelectorType } from './agWidgetSelectorType';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgInputTextFieldParams<
    TComponentSelectorType extends string,
> extends AgInputFieldParams<TComponentSelectorType> {
    allowedCharPattern?: string;
}
export type AgInputTextFieldEvent = AgAbstractInputFieldEvent;
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
    constructor(config?: TConfig, className = 'ag-text-field', inputType = 'text') {
        super(config, className, inputType);
    }

    public override postConstruct() {
        super.postConstruct();

        if (this.config.allowedCharPattern) {
            this.preventDisallowedCharacters();
        }
    }

    public override setValue(value?: string | null, silent?: boolean): this {
        const eInput = this.eInput;
        // update the input before we call super.setValue, so it's updated before the value changed event is fired
        if (eInput.value !== value) {
            eInput.value = _exists(value) ? value : '';
        }

        return super.setValue(value, silent);
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
