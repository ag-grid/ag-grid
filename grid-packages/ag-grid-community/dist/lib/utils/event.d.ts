import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
/**
 * a user once raised an issue - they said that when you opened a popup (eg context menu)
 * and then clicked on a selection checkbox, the popup wasn't closed. this is because the
 * popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
 * checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
 * to get around this, we have a pattern to stop propagation for the purposes of AG Grid,
 * but we still let the event pass back to the body.
 * @param {Event} event
 */
export declare function stopPropagationForAgGrid(event: Event): void;
export declare function isStopPropagationForAgGrid(event: Event): boolean;
export declare const isEventSupported: (eventName: any) => boolean;
export declare function getCtrlForEvent<T>(gridOptionsWrapper: GridOptionsWrapper, event: Event, type: string): T | null;
/**
 * @deprecated
 * Adds all type of change listeners to an element, intended to be a text field
 * @param {HTMLElement} element
 * @param {EventListener} listener
 */
export declare function addChangeListener(element: HTMLElement, listener: EventListener): void;
/**
 * srcElement is only available in IE. In all other browsers it is target
 * http://stackoverflow.com/questions/5301643/how-can-i-make-event-srcelement-work-in-firefox-and-what-does-it-mean
 * @param {Event} event
 * @returns {Element}
 */
export declare function getTarget(event: Event): Element;
export declare function isElementInEventPath(element: HTMLElement, event: Event): boolean;
export declare function createEventPath(event: Event): EventTarget[];
/**
 * firefox doesn't have event.path set, or any alternative to it, so we hack
 * it in. this is needed as it's to late to work out the path when the item is
 * removed from the dom. used by MouseEventService, where it works out if a click
 * was from the current grid, or a detail grid (master / detail).
 * @param {Event} event
 */
export declare function addAgGridEventPath(event: Event): void;
/**
 * Gets the path for an Event.
 * https://stackoverflow.com/questions/39245488/event-path-undefined-with-firefox-and-vue-js
 * https://developer.mozilla.org/en-US/docs/Web/API/Event
 * @param {Event} event
 * @returns {EventTarget[]}
 */
export declare function getEventPath(event: Event): EventTarget[];
export declare function addSafePassiveEventListener(frameworkOverrides: IFrameworkOverrides, eElement: HTMLElement, event: string, listener: (event?: any) => void): void;
