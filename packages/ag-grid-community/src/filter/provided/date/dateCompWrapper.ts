import { _debounce, _setAriaInvalid, _setDisplayed } from 'ag-stack';

import { _getDateCompDetails } from '../../../components/framework/userCompUtils';
import type { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import type { Context } from '../../../context/context';
import type { ColDef } from '../../../entities/colDef';
import type { IDateComp, IDateParams } from '../../../interfaces/dateComponent';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';

const CLASS_INPUT_FIELD = '.ag-input-field-input';

/**
 * How a validity change should be reported to the user:
 * - `immediate`: report synchronously (used on (re-)open, and always in Firefox).
 * - `debounce`: schedule a trailing report, resetting the timer on each call (used while typing so the
 *   report lands after the user stops, avoiding a mid-entry cursor reset).
 * - `debounceIfChanged`: schedule a trailing report only when the message actually changed, so a
 *   `focusin` fired by tab-switching (or reportValidity's own focus steal) does not re-report and blink
 *   the native validation bubble.
 */
export type ValidationReportMode = 'immediate' | 'debounce' | 'debounceIfChanged';

/** Provides sync access to async component. Date component can be lazy created - this class encapsulates
 * this by keeping value locally until DateComp has loaded, then passing DateComp the value. */
export class DateCompWrapper {
    private dateComp: IDateComp | null | undefined;
    private tempValue: Date | null;
    private disabled: boolean | null;
    private alive = true;
    private readonly debouncedReport = _debounce({ isAlive: () => this.alive }, reportValidity, 500);
    private timeoutHandle: number | null = null;
    private lastValidityMessage: string | null = null;

    constructor(
        private readonly context: Context,
        userCompFactory: UserComponentFactory,
        colDef: ColDef,
        dateComponentParams: IDateParams,
        private readonly eParent: HTMLElement,
        onReady?: (comp: DateCompWrapper) => void
    ) {
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
        this.dateComp = this.context.destroyBean(this.dateComp);
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
        const dateComp = this.dateComp;
        if (dateComp) {
            dateComp.setDisabled?.(disabled);
        } else {
            this.disabled = disabled;
        }
    }

    public setDisplayed(displayed: boolean) {
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
        this.dateComp?.refresh?.(params);
    }

    public setCustomValidity(message: string, reportMode: ValidationReportMode = 'immediate'): void {
        const eInput = this.dateComp?.getGui().querySelector<HTMLInputElement>(CLASS_INPUT_FIELD);

        if (eInput && 'setCustomValidity' in eInput) {
            const isInvalid = message.length > 0;
            const messageChanged = message !== this.lastValidityMessage;
            this.lastValidityMessage = message;
            eInput.setCustomValidity(message);

            // Firefox automatically displays tooltips when inputs are invalid, but chrome and safari do not,
            // so we need to call `reportValidity`.
            // In some browsers, this needs to be debounced or it will interrupt user inputs.
            if (isInvalid) {
                if (reportMode === 'immediate') {
                    reportValidity(eInput);
                } else if (reportMode === 'debounce' || messageChanged) {
                    this.timeoutHandle = this.debouncedReport(eInput);
                }
            } else if (this.timeoutHandle) {
                window.clearTimeout(this.timeoutHandle);
            }

            _setAriaInvalid(eInput, isInvalid);
        }
    }

    public getValidity(): ValidityState | undefined {
        return this.dateComp?.getGui().querySelector<HTMLInputElement>(CLASS_INPUT_FIELD)?.validity;
    }
}

function reportValidity(eInput: HTMLInputElement) {
    eInput.reportValidity();
}
