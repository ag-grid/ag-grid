import { GridOptionsService } from '../gridOptionsService';
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
export declare function getCtrlForEvent<T>(gridOptionsService: GridOptionsService, event: Event, type: string): T | null;
export declare function isElementInEventPath(element: HTMLElement, event: Event): boolean;
export declare function createEventPath(event: {
    target: EventTarget;
}): EventTarget[];
/**
 * Gets the path for a browser Event or from the target on an AG Grid Event
 * https://developer.mozilla.org/en-US/docs/Web/API/Event
 * @param {Event| { target: EventTarget }} event
 * @returns {EventTarget[]}
 */
export declare function getEventPath(event: Event | {
    target: EventTarget;
}): EventTarget[];
export declare function addSafePassiveEventListener(frameworkOverrides: IFrameworkOverrides, eElement: HTMLElement, event: string, listener: (event?: any) => void): void;
