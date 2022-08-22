/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { includes } from './array';
const AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';
const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
const supports = {};
/**
 * a user once raised an issue - they said that when you opened a popup (eg context menu)
 * and then clicked on a selection checkbox, the popup wasn't closed. this is because the
 * popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
 * checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
 * to get around this, we have a pattern to stop propagation for the purposes of AG Grid,
 * but we still let the event pass back to the body.
 * @param {Event} event
 */
export function stopPropagationForAgGrid(event) {
    event[AG_GRID_STOP_PROPAGATION] = true;
}
export function isStopPropagationForAgGrid(event) {
    return event[AG_GRID_STOP_PROPAGATION] === true;
}
export const isEventSupported = (() => {
    const tags = {
        select: 'input',
        change: 'input',
        submit: 'form',
        reset: 'form',
        error: 'img',
        load: 'img',
        abort: 'img'
    };
    const eventChecker = (eventName) => {
        if (typeof supports[eventName] === 'boolean') {
            return supports[eventName];
        }
        const el = document.createElement(tags[eventName] || 'div');
        eventName = 'on' + eventName;
        return supports[eventName] = (eventName in el);
    };
    return eventChecker;
})();
export function getCtrlForEvent(gridOptionsWrapper, event, type) {
    let sourceElement = event.target;
    while (sourceElement) {
        const renderedComp = gridOptionsWrapper.getDomData(sourceElement, type);
        if (renderedComp) {
            return renderedComp;
        }
        sourceElement = sourceElement.parentElement;
    }
    return null;
}
/**
 * @deprecated
 * Adds all type of change listeners to an element, intended to be a text field
 * @param {HTMLElement} element
 * @param {EventListener} listener
 */
export function addChangeListener(element, listener) {
    element.addEventListener('changed', listener);
    element.addEventListener('paste', listener);
    element.addEventListener('input', listener);
}
export function isElementInEventPath(element, event) {
    if (!event || !element) {
        return false;
    }
    return getEventPath(event).indexOf(element) >= 0;
}
export function createEventPath(event) {
    const res = [];
    let pointer = event.target;
    while (pointer) {
        res.push(pointer);
        pointer = pointer.parentElement;
    }
    return res;
}
/**
 * firefox doesn't have event.path set, or any alternative to it, so we hack
 * it in. this is needed as it's to late to work out the path when the item is
 * removed from the dom. used by MouseEventService, where it works out if a click
 * was from the current grid, or a detail grid (master / detail).
 * @param {Event} event
 */
export function addAgGridEventPath(event) {
    event.__agGridEventPath = getEventPath(event);
}
/**
 * Gets the path for an Event.
 * https://stackoverflow.com/questions/39245488/event-path-undefined-with-firefox-and-vue-js
 * https://developer.mozilla.org/en-US/docs/Web/API/Event
 * @param {Event} event
 * @returns {EventTarget[]}
 */
export function getEventPath(event) {
    const eventNoType = event;
    if (eventNoType.path) {
        // Chrome supports path
        return eventNoType.path;
    }
    if (eventNoType.composedPath) {
        // Firefox supports composePath
        return eventNoType.composedPath();
    }
    if (eventNoType.__agGridEventPath) {
        // Firefox supports composePath
        return eventNoType.__agGridEventPath;
    }
    // and finally, if none of the above worked,
    // we create the path ourselves
    return createEventPath(event);
}
export function addSafePassiveEventListener(frameworkOverrides, eElement, event, listener) {
    const isPassive = includes(PASSIVE_EVENTS, event);
    const options = isPassive ? { passive: true } : undefined;
    // this check is here for certain scenarios where I believe the user must be destroying
    // the grid somehow but continuing for it to be used
    if (frameworkOverrides && frameworkOverrides.addEventListener) {
        frameworkOverrides.addEventListener(eElement, event, listener, options);
    }
}
