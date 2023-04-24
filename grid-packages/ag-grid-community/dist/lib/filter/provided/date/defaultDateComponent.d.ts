import { Component } from '../../../widgets/component';
import { IDateComp, IDateParams } from '../../../rendering/dateComponent';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
export declare class DefaultDateComponent extends Component implements IDateComp {
    private readonly eDateInput;
    constructor();
    destroy(): void;
    init(params: IDateParams): void;
    getDate(): Date | null;
    setDate(date: Date): void;
    setInputPlaceholder(placeholder: string): void;
    setDisabled(disabled: boolean): void;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    private shouldUseBrowserDatePicker;
}
