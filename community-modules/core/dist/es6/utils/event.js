/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { includes } from './array';
var AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';
var PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
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
        var isSupported = (eventName in el);
        if (!isSupported) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] == 'function';
        }
        return supports[eventName] = isSupported;
    };
    return eventChecker;
})();
export function getComponentForEvent(gridOptionsWrapper, event, type) {
    var sourceElement = getTarget(event);
    while (sourceElement) {
        var renderedComp = gridOptionsWrapper.getDomData(sourceElement, type);
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
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    element.addEventListener('keydown', listener);
    element.addEventListener('keyup', listener);
}
/**
 * srcElement is only available in IE. In all other browsers it is target
 * http://stackoverflow.com/questions/5301643/how-can-i-make-event-srcelement-work-in-firefox-and-what-does-it-mean
 * @param {Event} event
 * @returns {Element}
 */
export function getTarget(event) {
    var eventNoType = event;
    return eventNoType.target || eventNoType.srcElement;
}
export function isElementInEventPath(element, event) {
    if (!event || !element) {
        return false;
    }
    return getEventPath(event).indexOf(element) >= 0;
}
export function createEventPath(event) {
    var res = [];
    var pointer = getTarget(event);
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
    var eventNoType = event;
    if (eventNoType.deepPath) {
        // IE supports deep path
        return eventNoType.deepPath();
    }
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
    var isPassive = includes(PASSIVE_EVENTS, event);
    var options = isPassive ? { passive: true } : undefined;
    // this check is here for certain scenarios where I believe the user must be destroying
    // the grid somehow but continuing for it to be used
    if (frameworkOverrides && frameworkOverrides.addEventListener) {
        frameworkOverrides.addEventListener(eElement, event, listener, options);
    }
}
