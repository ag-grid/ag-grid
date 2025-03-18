import type { AgEvent } from '../events';
import type { FilterButtonType } from '../interfaces/iFilter';
import { _clearElement, _loadTemplate } from '../utils/dom';
import { _warn } from '../validation/logging';
import { Component } from '../widgets/component';
import { FILTER_LOCALE_TEXT } from './filterLocaleText';
import { isUseApplyButton } from './floating/provided/providedFilterUtils';

export interface FilterButtonEvent extends AgEvent<FilterButtonType> {
    event?: Event;
    applyActive: boolean;
}

export class FilterButtonComp extends Component<FilterButtonType> {
    private buttons: FilterButtonType[];
    private buttonListeners: (() => void)[] = [];

    constructor() {
        super(/* html */ `
            <div class="ag-filter-apply-panel">
            </div>
        `);
    }

    public refresh(buttons: FilterButtonType[]): void {
        const oldButtons = this.buttons;
        this.buttons = buttons;

        if (oldButtons === buttons) {
            return;
        }

        const eGui = this.getGui();
        _clearElement(eGui);
        this.buttonListeners.forEach((destroyFunc) => destroyFunc());
        this.buttonListeners = [];

        // Instead of appending each button to the DOM individually, we create a fragment and append that
        // to the DOM once. This is much faster than appending each button individually.
        const fragment = document.createDocumentFragment();

        const translate = this.getLocaleTextFunc();

        const applyActive = isUseApplyButton({ buttons } as any);

        const addButton = (type: FilterButtonType): void => {
            const localeKey = `${type}Filter` as const;
            const text = type ? translate(localeKey, FILTER_LOCALE_TEXT[localeKey]) : undefined;
            const clickListener = (event?: Event) => {
                this.localEventService?.dispatchEvent({
                    type,
                    event,
                    applyActive,
                } as FilterButtonEvent);
            };
            if (!['apply', 'clear', 'reset', 'cancel'].includes(type)) {
                _warn(75);
            }

            const buttonType = type === 'apply' ? 'submit' : 'button';
            const button = _loadTemplate(
                /* html */
                `<button
                    type="${buttonType}"
                    data-ref="${type}FilterButton"
                    class="ag-button ag-standard-button ag-filter-apply-panel-button"
                >${text}
                </button>`
            );

            button.addEventListener('click', clickListener);
            this.buttonListeners.push(() => button.removeEventListener('click', clickListener));
            fragment.append(button);
        };

        buttons.forEach((type) => addButton(type));

        eGui.append(fragment);
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
