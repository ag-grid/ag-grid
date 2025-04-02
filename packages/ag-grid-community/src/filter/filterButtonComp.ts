import type { AgEvent } from '../events';
import type { FilterAction } from '../interfaces/iFilter';
import { _clearElement, _loadTemplate, _setDisabled } from '../utils/dom';
import { _warn } from '../validation/logging';
import { Component } from '../widgets/component';
import { FILTER_LOCALE_TEXT } from './filterLocaleText';
import { isUseApplyButton } from './floating/provided/providedFilterUtils';

export interface FilterButtonEvent extends AgEvent<FilterAction> {
    event?: Event;
    applyActive: boolean;
    additionalEventAttributes?: any;
}

export class FilterButtonComp extends Component<FilterAction> {
    private buttons: FilterAction[];
    private buttonListeners: (() => void)[] = [];
    private eApplyButton?: HTMLElement;

    constructor() {
        super(/* html */ `
            <div class="ag-filter-apply-panel">
            </div>
        `);
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

        const applyActive = isUseApplyButton({ buttons } as any);

        const addButton = (type: FilterAction): void => {
            const localeKey = `${type}Filter` as const;
            const text = type ? translate(localeKey, FILTER_LOCALE_TEXT[localeKey]) : undefined;
            const clickListener = (event?: Event) => {
                this.dispatchLocalEvent<FilterButtonEvent>({
                    type,
                    event,
                    applyActive,
                });
            };
            if (!['apply', 'clear', 'reset', 'cancel'].includes(type)) {
                _warn(75);
            }

            const isApply = type === 'apply';
            const buttonType = isApply ? 'submit' : 'button';
            const button = _loadTemplate(
                /* html */
                `<button
                    type="${buttonType}"
                    data-ref="${type}FilterButton"
                    class="ag-button ag-standard-button ag-filter-apply-panel-button"
                >${text}
                </button>`
            );
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

    public performAction(action: FilterAction, event?: KeyboardEvent, additionalEventAttributes?: any): void {
        const buttons = this.buttons;
        if (buttons.includes(action)) {
            this.dispatchLocalEvent<FilterButtonEvent>({
                type: action,
                event,
                applyActive: isUseApplyButton({ buttons } as any),
                additionalEventAttributes,
            });
        }
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
