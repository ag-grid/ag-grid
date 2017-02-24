// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IComponent } from "../interfaces/iComponent";
export interface IDate {
    /** Returns the current date represented by this editor */
    getDate(): Date;
    /** Sets the date represented by this component */
    setDate(date: Date): void;
}
export interface IDateParams {
    /** Method for component to tell ag-Grid that the date has changed. */
    onDateChanged: () => void;
}
export interface IDateComp extends IComponent<IDateParams>, IDate {
}
