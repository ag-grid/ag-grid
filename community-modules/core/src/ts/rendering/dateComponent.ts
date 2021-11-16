import { IComponent } from "../interfaces/iComponent";
import { IDateFilterParams } from "../filter/provided/date/dateFilter";
export interface IDate {
    /** Returns the current date represented by this editor */
    getDate(): Date | null;

    /** Sets the date represented by this component */
    setDate(date: Date | null): void;

    /** Sets the disabled state of this component */
    setDisabled?(disabled: boolean): void;

    /* [optional method] sets the current input placeholder */
    setInputPlaceholder?(placeholder: string): void;

    /* [optional method] sets the current input aria label */
    setInputAriaLabel?(placeholder: string): void;
}

export interface IDateParams {
    /** Method for component to tell AG Grid that the date has changed. */
    onDateChanged: () => void;
    filterParams: IDateFilterParams;
}

export interface IDateComp extends IComponent<IDateParams>, IDate {
}