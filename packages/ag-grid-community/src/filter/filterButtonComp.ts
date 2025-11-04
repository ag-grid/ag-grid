import { KeyCode } from '../agStack/constants/keyCode';
import type { AgEvent } from '../agStack/interfaces/agEvent';
import { _clearElement, _setDisabled } from '../agStack/utils/dom';
import type { FilterAction } from '../interfaces/iFilter';
import type { ITooltipCtrl, TooltipFeature } from '../tooltip/tooltipFeature';
import type { ElementParams } from '../utils/element';
import { _createElement } from '../utils/element';
import { _warn } from '../validation/logging';
import type { ComponentSelector } from '../widgets/component';
import { Component } from '../widgets/component';

interface FilterButtonCompParams {
    className?: string;
}

export interface FilterButtonEvent extends AgEvent<FilterAction> {
    event?: Event;
}

export interface FilterButton {
    type: FilterAction;
    label: string;
}

function getElement(className: string): ElementParams {
    return {
        tag: 'div',
        cls: className,
    };
}

export class FilterButtonComp extends Component<FilterAction> {
    private buttons: FilterButton[];
    private listeners: (() => void)[] = [];
    private eApply?: HTMLElement;

    private validationTooltipFeature?: TooltipFeature;
    private validationMessage: string | null = null;
    private readonly className: string;

    constructor(config?: FilterButtonCompParams) {
        const { className = 'ag-filter-apply-panel' } = config ?? {};
        super(getElement(className));
        this.className = className;
    }

    public updateButtons(buttons: FilterButton[], useForm?: boolean): void {
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

        const className = this.className;

        const addButton = ({ type, label }: FilterButton): void => {
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
                cls: `ag-button ag-standard-button ${className}-button${isApply ? ' ' + className + '-apply-button' : ''}`,
                children: label,
            });
            this.activateTabIndex([button]);

            if (isApply) {
                eApplyButton = button;
            }

            const keydownListener = (event: KeyboardEvent) => {
                if (event.key === KeyCode.ENTER) {
                    // this is needed to ensure a keyboard event is passed through, rather than a click event.
                    // otherwise focus won't be restored if a popup is closed
                    event.preventDefault();
                    clickListener(event);
                }
            };

            const listeners = this.listeners;

            button.addEventListener('click', clickListener);
            listeners.push(() => button.removeEventListener('click', clickListener));
            button.addEventListener('keydown', keydownListener);
            listeners.push(() => button.removeEventListener('keydown', keydownListener));

            fragment.append(button);
        };

        for (const button of buttons) {
            addButton(button);
        }

        this.eApply = eApplyButton;

        const tooltip = this.validationTooltipFeature;

        if (eApplyButton && !tooltip) {
            this.validationTooltipFeature = this.createOptionalManagedBean(
                this.beans.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, {
                    getGui: () => this.eApply,
                    getLocation: () => 'advancedFilter',
                    getTooltipShowDelayOverride: () => 1000,
                } as ITooltipCtrl)
            );
        } else if (!eApplyButton && tooltip) {
            this.validationTooltipFeature = this.destroyBean(tooltip);
        }

        eGui.append(fragment);
    }

    public getApplyButton(): HTMLElement | undefined {
        return this.eApply;
    }

    public updateValidity(valid: boolean, message: string | null = null): void {
        const eApplyButton = this.eApply;
        if (!eApplyButton) {
            return;
        }
        _setDisabled(eApplyButton, valid === false);
        this.validationMessage = message ?? null;
        this.validationTooltipFeature?.setTooltipAndRefresh(this.validationMessage);
    }

    private destroyListeners(): void {
        for (const destroyFunc of this.listeners) {
            destroyFunc();
        }
        this.listeners = [];
    }

    public override destroy(): void {
        this.destroyListeners();
        super.destroy();
    }
}

export const AgFilterButtonSelector: ComponentSelector = {
    selector: 'AG-FILTER-BUTTON',
    component: FilterButtonComp,
};
