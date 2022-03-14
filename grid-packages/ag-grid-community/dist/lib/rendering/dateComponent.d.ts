import { IComponent } from "../interfaces/iComponent";
import { IDateFilterParams } from "../filter/provided/date/dateFilter";
import { IAfterGuiAttachedParams } from "../interfaces/iAfterGuiAttachedParams";
export interface IDate {
    /** Returns the current date represented by this component */
    getDate(): Date | null;
    /** Sets the date represented by this component */
    setDate(date: Date | null): void;
    /** Sets the disabled state of this component */
    setDisabled?(disabled: boolean): void;
    /** [optional method] sets the current input placeholder */
    setInputPlaceholder?(placeholder: string): void;
    /** [optional method] sets the current input aria label */
    setInputAriaLabel?(placeholder: string): void;
    /**
     * A hook to perform any necessary operation just after the GUI for this component has been rendered on the screen.
     * If a parent popup is closed and reopened (e.g. for filters), this method is called each time the component is shown.
     * This is useful for any logic that requires attachment before executing, such as putting focus on a particular DOM element.
     */
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
}
export interface IDateParams {
    /** Method for component to tell AG Grid that the date has changed. */
    onDateChanged: () => void;
    filterParams: IDateFilterParams;
}
export interface IDateComp extends IComponent<IDateParams>, IDate {
}
