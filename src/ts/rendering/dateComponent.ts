import {IAfterGuiAttachedParams} from "../interfaces/iFilter";
export interface IDateComponent {
    /** Callback received to signal the creation of this cellEditorRenderer, placeholder to create the necessary logic
     * to setup the component, like initialising the gui, or any other part of your component*/
    init?(params: IDateComponentParams): void;

    /** Return the DOM element of your editor, this is what the grid puts into the DOM */
    getGui(): HTMLElement;

    /** Gets called once by grid after editing is finished - if your editor needs to do any cleanup, do it here */
    destroy?(): void;

    /** Returns the current date represented by this editor */
    getDate(): Date;

    /** Sets the date represented by this component */
    setDate(date:Date): void;

    /** A hook to perform any necessary operation just after the gui for this component has been renderer
     * in the screen*/
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
}

export interface IDateComponentParams{
    /** Method for component to tell ag-Grid that the date has changed. */
    onDateChanged:()=>void
}