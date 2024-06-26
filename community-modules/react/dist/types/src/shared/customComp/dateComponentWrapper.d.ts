import type { IDate, IDateParams } from '@ag-grid-community/core';
import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomDateCallbacks, CustomDateProps } from './interfaces';
export declare class DateComponentWrapper extends CustomComponentWrapper<IDateParams, CustomDateProps, CustomDateCallbacks> implements IDate {
    private date;
    private readonly onDateChange;
    getDate(): Date | null;
    setDate(date: Date | null): void;
    refresh(params: IDateParams): void;
    protected getOptionalMethods(): string[];
    private updateDate;
    protected getProps(): CustomDateProps;
}
