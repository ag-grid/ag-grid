// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Promise } from "../utils";
import { IAfterGuiAttachedParams } from "./iAfterGuiAttachedParams";
/** This is for User Components only, do not implement this for internal components. */
export interface IComponent<T> {
    /** Return the DOM element of your editor, this is what the grid puts into the DOM */
    getGui(): HTMLElement;
    /** Gets called once by grid after editing is finished - if your editor needs to do any cleanup, do it here */
    destroy?(): void;
    /** A hook to perform any necessary operation just after the gui for this component has been renderer
     in the screen.
     If the filter popup is closed and reopened, this method is called each time the filter is shown.
     This is useful for any
     logic that requires attachment before executing, such as putting focus on a particular DOM
     element. The params has one callback method 'hidePopup', which you can call at any later
     point to hide the popup - good if you have an 'Apply' button and you want to hide the popup
     after it is pressed. */
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
    /** The init(params) method is called on the filter once. See below for details on the parameters. */
    init?(params: T): Promise<void> | void;
}
