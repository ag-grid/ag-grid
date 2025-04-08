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
    private buttonListeners: (() => void)[] = [];
    private eApplyButton?: HTMLElement;

    constructor() {
        super(FilterButtonCompElement);
    }

    public updateButtons(buttons: FilterAction[]): void {
        const oldButtons = this.buttons;
        this.buttons = buttons;

        if (oldButtons === buttons) {
            return;
        }

        const eGui = this.getGui();
        _clearElement(eGui);
        let eApplyButton: HTMLElement | undefined;
        this.buttonListeners.forEach((destroyFunc) => destroyFunc());
        this.buttonListeners = [];

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
            const buttonType = isApply ? 'submit' : 'button';
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
            this.buttonListeners.push(() => button.removeEventListener('click', clickListener));
            fragment.append(button);
        };

        buttons.forEach((type) => addButton(type));

        this.eApplyButton = eApplyButton;

        eGui.append(fragment);
    }

    public updateValidity(valid?: boolean): void {
        const eApplyButton = this.eApplyButton;
        if (!eApplyButton) {
            return;
        }
        _setDisabled(eApplyButton, valid === false);
    }

    private destroyListeners(): void {
        this.buttonListeners.forEach((destroyFunc) => destroyFunc());
        this.buttonListeners = [];
    }

    public override destroy(): void {
        this.destroyListeners();
        super.destroy();
    }
}
