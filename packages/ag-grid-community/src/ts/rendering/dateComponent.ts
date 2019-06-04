import { IComponent } from "../interfaces/iComponent";
import { IDateFilterParams } from "../filter/provided/date/dateFilter";
export interface IDate {
    /** Returns the current date represented by this editor */
    getDate(): Date;

    /** Sets the date represented by this component */
    setDate(date: Date): void;
}

export interface IDateParams {
    /** Method for component to tell ag-Grid that the date has changed. */
    onDateChanged: () => void;
    filterParams:IDateFilterParams;
}

export interface IDateComp extends IComponent<IDateParams>, IDate {

}