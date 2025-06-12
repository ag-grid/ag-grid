import { KeyCode } from '../constants/keyCode';
import type { AgEvent } from '../events';
import type { FilterAction } from '../interfaces/iFilter';
import type { BeanCollection, ITooltipCtrl, Registry, TooltipFeature } from '../main-umd-noStyles';
import type { ElementParams } from '../utils/dom';
import { _clearElement, _createElement, _setDisabled } from '../utils/dom';
import { _warn } from '../validation/logging';
import { Component, type ComponentSelector } from '../widgets/component';

export interface FilterButtonEvent extends AgEvent<FilterAction> {
    event?: Event;
}

export interface FilterButton {
    type: FilterAction;
    label: string;
}

const FilterButtonCompElement: ElementParams = {
    tag: 'div',
    cls: 'ag-filter-apply-panel',
};

export class FilterButtonComp extends Component<FilterAction> {
    private registry: Registry;

    private buttons: FilterButton[];
    private listeners: (() => void)[] = [];
    private eApply?: HTMLElement;

    private validationTooltipFeature?: TooltipFeature;
    private validationMessage: string | null = null;

    constructor() {
        super(FilterButtonCompElement);
    }

    public wireBeans(beans: BeanCollection): void {
        this.registry = beans.registry;
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
                cls: 'ag-button ag-standard-button ag-filter-apply-panel-button',
                children: label,
            });
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

            button.addEventListener('click', clickListener);
            this.listeners.push(() => button.removeEventListener('click', clickListener));
            button.addEventListener('keydown', keydownListener);
            this.listeners.push(() => button.removeEventListener('keydown', keydownListener));

            fragment.append(button);
        };

        buttons.forEach((button) => addButton(button));

        this.eApply = eApplyButton;

        if (this.eApply && !this.validationTooltipFeature) {
            this.validationTooltipFeature = this.createOptionalManagedBean(
                this.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, {
                    getGui: () => this.eApply,
                    getLocation: () => 'advancedFilter',
                    getTooltipShowDelayOverride: () => 1000,
                } as ITooltipCtrl)
            );
        } else if (!this.eApply && this.validationTooltipFeature) {
            this.validationTooltipFeature = this.destroyBean(this.validationTooltipFeature);
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
        this.listeners.forEach((destroyFunc) => destroyFunc());
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
