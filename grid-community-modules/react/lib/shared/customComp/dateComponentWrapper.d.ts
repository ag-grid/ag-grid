// @ag-grid-community/react v31.0.0
import { IDate, IDateParams } from "@ag-grid-community/core";
import { CustomComponentWrapper } from "./customComponentWrapper";
import { CustomDateProps, CustomDateCallbacks } from "./interfaces";
export declare class DateComponentWrapper extends CustomComponentWrapper<IDateParams, CustomDateProps, CustomDateCallbacks> implements IDate {
    private date;
    getDate(): Date | null;
    setDate(date: Date | null): void;
    refresh(params: IDateParams): void;
    protected getOptionalMethods(): string[];
    private updateDate;
    protected getProps(): CustomDateProps;
}
