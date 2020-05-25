import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { CellComp } from '../rendering/cellComp';
import { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import { includes } from './array';

const AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';
const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
const OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
const supports: { [key: string]: boolean; } = {};

/**
 * a user once raised an issue - they said that when you opened a popup (eg context menu)
 * and then clicked on a selection checkbox, the popup wasn't closed. this is because the
 * popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
 * checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
 * to get around this, we have a pattern to stop propagation for the purposes of ag-Grid,
 * but we still let the event pass back to the body.
 * @param {Event} event
 */
export function stopPropagationForAgGrid(event: Event): void {
    (event as any)[AG_GRID_STOP_PROPAGATION] = true;
}

export function isStopPropagationForAgGrid(event: Event): boolean {
    return (event as any)[AG_GRID_STOP_PROPAGATION] === true;
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
    } as any;

    const isEventSupported = (eventName: any) => {
        if (typeof supports[eventName] === 'boolean') {
            return supports[eventName];
        }

        let el = document.createElement(tags[eventName] || 'div');
        eventName = 'on' + eventName;

        let isSupported = (eventName in el);

        if (!isSupported) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] == 'function';
        }
        el = null;

        return supports[eventName] = isSupported;
    };

    return isEventSupported;
})();

export function getCellCompForEvent(gridOptionsWrapper: GridOptionsWrapper, event: Event): CellComp {
    let sourceElement = getTarget(event);

    while (sourceElement) {
        const renderedCell = gridOptionsWrapper.getDomData(sourceElement, 'cellComp');

        if (renderedCell) {
            return renderedCell as CellComp;
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
export function addChangeListener(element: HTMLElement, listener: EventListener) {
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
export function getTarget(event: Event): Element {
    const eventNoType = event as any;

    return eventNoType.target || eventNoType.srcElement;
}

export function isElementInEventPath(element: HTMLElement, event: Event): boolean {
    if (!event || !element) { return false; }

    return getEventPath(event).indexOf(element) >= 0;
}

export function createEventPath(event: Event): EventTarget[] {
    const res: EventTarget[] = [];
    let pointer: any = getTarget(event);

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
export function addAgGridEventPath(event: Event): void {
    (event as any).__agGridEventPath = getEventPath(event);
}

/**
 * Gets the path for an Event.
 * https://stackoverflow.com/questions/39245488/event-path-undefined-with-firefox-and-vue-js
 * https://developer.mozilla.org/en-US/docs/Web/API/Event
 * @param {Event} event
 * @returns {EventTarget[]}
 */
export function getEventPath(event: Event): EventTarget[] {
    const eventNoType = event as any;

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

export function addSafePassiveEventListener(
    frameworkOverrides: IFrameworkOverrides,
    eElement: HTMLElement,
    event: string, listener: (event?: any) => void,
    options: AddEventListenerOptions = {}
) {
    const isPassive = includes(PASSIVE_EVENTS, event);
    const isOutsideAngular = includes(OUTSIDE_ANGULAR_EVENTS, event);

    if (isPassive) {
        options.passive = true;
    }

    if (isOutsideAngular) {
        // this happens in certain scenarios where I believe the user must be destroying the grid somehow but continuing
        // for it to be used
        // don't fall through to the else part either - just don't add the listener
        if (frameworkOverrides && frameworkOverrides.addEventListenerOutsideAngular) {
            frameworkOverrides.addEventListenerOutsideAngular(eElement, event, listener, options);
        }
    } else {
        eElement.addEventListener(event, listener, options);
    }
}
