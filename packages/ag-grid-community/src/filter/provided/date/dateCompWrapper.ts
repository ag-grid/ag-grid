import { _setAriaInvalid, _setDisplayed } from 'ag-stack';

import { _getDateCompDetails } from '../../../components/framework/userCompUtils';
import type { BeanCollection } from '../../../context/context';
import type { ColDef } from '../../../entities/colDef';
import type { IDateComp, IDateParams } from '../../../interfaces/dateComponent';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { TooltipFeature } from '../../../tooltip/tooltipFeature';

const CLASS_INPUT_FIELD = '.ag-input-field-input';

/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
export class DateCompWrapper {
    private dateComp: IDateComp | null | undefined;
    private tempValue: Date | null;
    private disabled: boolean | null;
    private alive = true;
    private validationTooltip?: TooltipFeature;

    constructor(
        private readonly beans: BeanCollection,
        colDef: ColDef,
        dateComponentParams: IDateParams,
        private readonly eParent: HTMLElement,
        onReady?: (comp: DateCompWrapper) => void
    ) {
        const { context, userCompFactory } = beans;
        const compDetails = _getDateCompDetails(userCompFactory, colDef, dateComponentParams);

        compDetails?.newAgStackInstance().then((dateComp) => {
            // because async, check the filter still exists after component comes back
            if (!this.alive) {
                context.destroyBean(dateComp);
                return;
            }

            this.dateComp = dateComp;

            if (!dateComp) {
                return;
            }

            eParent.appendChild(dateComp.getGui());

            dateComp?.afterGuiAttached?.();

            const { tempValue, disabled } = this;
            if (tempValue) {
                dateComp.setDate(tempValue);
            }
            if (disabled != null) {
                dateComp.setDisabled?.(disabled);
            }

            onReady?.(this);
        });
    }

    public destroy(): void {
        this.alive = false;
        this.hideValidationTooltip();
        this.dateComp = this.beans.context.destroyBean(this.dateComp);
    }

    public getDate(): Date | null {
        return this.dateComp ? this.dateComp.getDate() : this.tempValue;
    }

    public setDate(value: Date | null): void {
        const dateComp = this.dateComp;
        if (dateComp) {
            dateComp.setDate(value);
        } else {
            this.tempValue = value;
        }
    }

    public setDisabled(disabled: boolean): void {
        if (disabled) {
            this.hideValidationTooltip();
        }
        const dateComp = this.dateComp;
        if (dateComp) {
            dateComp.setDisabled?.(disabled);
        } else {
            this.disabled = disabled;
        }
    }

    public setDisplayed(displayed: boolean) {
        if (!displayed) {
            this.hideValidationTooltip();
        }
        _setDisplayed(this.eParent, displayed);
    }

    public setInputPlaceholder(placeholder: string): void {
        this.dateComp?.setInputPlaceholder?.(placeholder);
    }

    public setInputAriaLabel(label: string): void {
        this.dateComp?.setInputAriaLabel?.(label);
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        this.dateComp?.afterGuiAttached?.(params);
    }

    public updateParams(params: IDateParams): void {
        this.hideValidationTooltip();
        this.dateComp?.refresh?.(params);
    }

    public setCustomValidity(message: string): void {
        const eInput = this.dateComp?.getGui().querySelector<HTMLInputElement>(CLASS_INPUT_FIELD);

        if (eInput && 'setCustomValidity' in eInput) {
            const isInvalid = message.length > 0;
            const messageChanged = eInput.validationMessage !== message;
            // Surface the error via tooltip: reportValidity steals focus and resets the date segment mid-typing.
            eInput.setCustomValidity(message);
            _setAriaInvalid(eInput, isInvalid);

            if (!isInvalid) {
                this.hideValidationTooltip();
                return;
            }

            if (!this.validationTooltip) {
                const tooltip = this.beans.tooltipSvc?.createTooltip({
                    getGui: () => eInput,
                    getLocation: () => 'filterValidation',
                    getTooltip: () => ({ value: eInput.validationMessage }),
                    shouldDisplayTooltip: () => eInput.isConnected && !eInput.disabled && !!eInput.validationMessage,
                });
                if (tooltip) {
                    this.validationTooltip = this.beans.context.createBean(tooltip);
                }
            } else if (messageChanged) {
                this.validationTooltip.refreshTooltip();
            }
            this.validationTooltip?.showTooltipOnFocus();
        }
    }

    public hideValidationTooltip(): void {
        this.validationTooltip = this.beans.context.destroyBean(this.validationTooltip);
    }

    public getValidity(): ValidityState | undefined {
        return this.dateComp?.getGui().querySelector<HTMLInputElement>(CLASS_INPUT_FIELD)?.validity;
    }
}
