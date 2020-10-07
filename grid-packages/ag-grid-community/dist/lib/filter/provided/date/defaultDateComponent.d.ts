import { Component } from '../../../widgets/component';
import { IDateComp, IDateParams } from '../../../rendering/dateComponent';
export declare class DefaultDateComponent extends Component implements IDateComp {
    private eDateInput;
    private listener;
    constructor();
    destroy(): void;
    init(params: IDateParams): void;
    getDate(): Date;
    setDate(date: Date): void;
    setInputPlaceholder(placeholder: string): void;
    private shouldUseBrowserDatePicker;
}
