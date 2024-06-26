import type { IDateComp, IDateParams } from '../../../interfaces/dateComponent';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { Component } from '../../../widgets/component';
export declare class DefaultDateComponent extends Component implements IDateComp {
    private readonly eDateInput;
    constructor();
    private params;
    private usingSafariDatePicker;
    destroy(): void;
    init(params: IDateParams): void;
    private setParams;
    onParamsUpdated(params: IDateParams): void;
    refresh(params: IDateParams): void;
    getDate(): Date | null;
    setDate(date: Date): void;
    setInputPlaceholder(placeholder: string): void;
    setInputAriaLabel(ariaLabel: string): void;
    setDisabled(disabled: boolean): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    private shouldUseBrowserDatePicker;
}
