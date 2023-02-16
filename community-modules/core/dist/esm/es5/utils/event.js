/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { includes } from './array';
var AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';
var PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel', 'scroll'];
var supports = {};
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
export var isEventSupported = (function () {
    var tags = {
        select: 'input',
        change: 'input',
        submit: 'form',
        reset: 'form',
        error: 'img',
        load: 'img',
        abort: 'img'
    };
    var eventChecker = function (eventName) {
        if (typeof supports[eventName] === 'boolean') {
            return supports[eventName];
        }
        var el = document.createElement(tags[eventName] || 'div');
        eventName = 'on' + eventName;
        return supports[eventName] = (eventName in el);
    };
    return eventChecker;
})();
export function getCtrlForEvent(gridOptionsService, event, type) {
    var sourceElement = event.target;
    while (sourceElement) {
        var renderedComp = gridOptionsService.getDomData(sourceElement, type);
        if (renderedComp) {
            return renderedComp;
        }
        sourceElement = sourceElement.parentElement;
    }
    return null;
}
export function isElementInEventPath(element, event) {
    if (!event || !element) {
        return false;
    }
    return getEventPath(event).indexOf(element) >= 0;
}
export function createEventPath(event) {
    var res = [];
    var pointer = event.target;
    while (pointer) {
        res.push(pointer);
        pointer = pointer.parentElement;
    }
    return res;
}
/**
 * Gets the path for a browser Event or from the target on an AG Grid Event
 * https://developer.mozilla.org/en-US/docs/Web/API/Event
 * @param {Event| { target: EventTarget }} event
 * @returns {EventTarget[]}
 */
export function getEventPath(event) {
    // This can be called with either a browser event or an AG Grid Event that has a target property.
    var eventNoType = event;
    if (eventNoType.path) {
        return eventNoType.path;
    }
    if (eventNoType.composedPath) {
        return eventNoType.composedPath();
    }
    // If this is an AG Grid event build the path ourselves
    return createEventPath(eventNoType);
}
export function addSafePassiveEventListener(frameworkOverrides, eElement, event, listener) {
    var isPassive = includes(PASSIVE_EVENTS, event);
    var options = isPassive ? { passive: true } : undefined;
    // this check is here for certain scenarios where I believe the user must be destroying
    // the grid somehow but continuing for it to be used
    if (frameworkOverrides && frameworkOverrides.addEventListener) {
        frameworkOverrides.addEventListener(eElement, event, listener, options);
    }
}
