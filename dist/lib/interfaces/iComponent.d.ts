import { AgPromise } from '../utils';
import { IAfterGuiAttachedParams } from './iAfterGuiAttachedParams';
/** This is for User Components only, do not implement this for internal components. */
export interface IComponent<T> {
    /** Return the DOM element of your component, this is what the grid puts into the DOM */
    getGui(): HTMLElement;
    /** Gets called once by grid when the component is being removed; if your component needs to do any cleanup, do it here */
    destroy?(): void;
    /** A hook to perform any necessary operation just after the GUI for this component has been rendered
     on the screen.
     If a parent popup is closed and reopened (e.g. for filters), this method is called each time the component is shown.
     This is useful for any
     logic that requires attachment before executing, such as putting focus on a particular DOM
     element. The params has one callback method 'hidePopup', which you can call at any later
     point to hide the popup - good if you have an 'Apply' button and you want to hide the popup
     after it is pressed. */
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void;
    /** The init(params) method is called on the component once. See below for details on the parameters. */
    init?(params: T): AgPromise<void> | void;
}
