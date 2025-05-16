import { KeyCode } from '../constants/keyCode';
import type { AgEvent } from '../events';
import type { FilterAction } from '../interfaces/iFilter';
import type { ElementParams } from '../utils/dom';
import { _clearElement, _createElement, _setDisabled } from '../utils/dom';
import { _warn } from '../validation/logging';
import { Component } from '../widgets/component';
import { FILTER_LOCALE_TEXT } from './filterLocaleText';

export interface FilterButtonEvent extends AgEvent<FilterAction> {
    event?: Event;
}

const FilterButtonCompElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-apply-panel',
};

export class FilterButtonComp extends Component<FilterAction> {
    private buttons: FilterAction[];
    private listeners: (() => void)[] = [];
    private eApply?: HTMLElement;

    constructor() {
        super(FilterButtonCompElement);
    }

    public updateButtons(buttons: FilterAction[], useForm?: boolean): void {
        const oldButtons = this.buttons;
        this.buttons = buttons;

        if (oldButtons === buttons) {
            return;
        }

        const eGui = this.getGui();
        _clearElement(eGui);
        let eApplyButton: HTMLElement | undefined;
        this.destroyListeners();

        // Instead of appending each button to the DOM individually, we create a fragment and append that
        // to the DOM once. This is much faster than appending each button individually.
        const fragment = document.createDocumentFragment();

        const translate = this.getLocaleTextFunc();

        const addButton = (type: FilterAction): void => {
            const localeKey = `${type}Filter` as const;
            const text = type ? translate(localeKey, FILTER_LOCALE_TEXT[localeKey]) : undefined;
            const clickListener = (event?: Event) => {
                this.dispatchLocalEvent<FilterButtonEvent>({
                    type,
                    event,
                });
            };
            if (!['apply', 'clear', 'reset', 'cancel'].includes(type)) {
                _warn(75);
            }

            const isApply = type === 'apply';
            const buttonType = isApply && useForm ? 'submit' : 'button';
            const button = _createElement({
                tag: 'button',
                attrs: { type: buttonType },
                ref: `${type}FilterButton`,
                cls: 'ag-button ag-standard-button ag-filter-apply-panel-button',
                children: text,
            });
            if (isApply) {
                eApplyButton = button;
            }

            button.addEventListener('click', clickListener);
            button.addEventListener('keydown', (event) => {
                if (event.key === KeyCode.ENTER) {
                    // this is needed to ensure a keyboard event is passed through, rather than a click event.
                    // otherwise focus won't be restored if a popup is closed
                    event.preventDefault();
                    clickListener(event);
                }
            });
            this.listeners.push(() => button.removeEventListener('click', clickListener));
            fragment.append(button);
        };

        buttons.forEach((type) => addButton(type));

        this.eApply = eApplyButton;

        eGui.append(fragment);
    }

    public updateValidity(valid?: boolean): void {
        const eApplyButton = this.eApply;
        if (!eApplyButton) {
            return;
        }
        _setDisabled(eApplyButton, valid === false);
    }

    private destroyListeners(): void {
        this.listeners.forEach((destroyFunc) => destroyFunc());
        this.listeners = [];
    }

    public override destroy(): void {
        this.destroyListeners();
        super.destroy();
    }
}
