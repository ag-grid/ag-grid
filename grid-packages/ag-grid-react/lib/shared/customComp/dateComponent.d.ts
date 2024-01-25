// ag-grid-react v31.0.3
import { IDate, IDateParams } from "ag-grid-community";
import { CustomComponent } from "./customComponent";
import { CustomDateProps, CustomDateCallbacks } from "./interfaces";
export declare class DateComponent extends CustomComponent<IDateParams, CustomDateProps, CustomDateCallbacks> implements IDate {
    private date;
    getDate(): Date | null;
    setDate(date: Date | null): void;
    refresh(params: IDateParams): void;
    protected getOptionalMethods(): string[];
    private updateDate;
    protected getProps(): CustomDateProps;
}
