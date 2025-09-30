import type { UtilBeanCollection } from '../interfaces/agCoreBeanCollection';
import { _getBodyHeight, _getBodyWidth, _getDocument } from './document';
import { _getElementRectWithOffset } from './dom';

const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel', 'scroll'];
const NON_PASSIVE_EVENTS = ['wheel'];
const supports: { [key: string]: boolean } = {};

export const _isEventSupported = (() => {
    const tags = {
        select: 'input',
        change: 'input',
        submit: 'form',
        reset: 'form',
        error: 'img',
        load: 'img',
        abort: 'img',
    } as any;

    const eventChecker = (eventName: any) => {
        if (typeof supports[eventName] === 'boolean') {
            return supports[eventName];
        }

        const el = document.createElement(tags[eventName] || 'div');
        eventName = 'on' + eventName;

        return (supports[eventName] = eventName in el);
    };

    return eventChecker;
})();

export function _isElementInEventPath(element: HTMLElement, event: Event): boolean {
    if (!event || !element) {
        return false;
    }

    return _getEventPath(event).indexOf(element) >= 0;
}

function _createEventPath(event: { target: EventTarget }): EventTarget[] {
    const res: EventTarget[] = [];
    let pointer: any = event.target;

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

function _getEventPath(event: Event | { target: EventTarget }): EventTarget[] {
    // This can be called with either a browser event or an AG Grid Event that has a target property.
    const eventNoType = event as any;

    if (eventNoType.path) {
        return eventNoType.path;
    }

    if (eventNoType.composedPath) {
        return eventNoType.composedPath();
    }

    // If this is an AG Grid event build the path ourselves
    return _createEventPath(eventNoType);
}

export function _addSafePassiveEventListener(eElement: HTMLElement, event: string, listener: (event?: any) => void) {
    const passive = getPassiveStateForEvent(event);

    let options: AddEventListenerOptions | undefined;

    if (passive != null) {
        options = { passive };
    }

    eElement.addEventListener(event, listener, options);
}

const getPassiveStateForEvent = (event: string): boolean | undefined => {
    const isPassive = PASSIVE_EVENTS.includes(event);
    const isNonPassive = NON_PASSIVE_EVENTS.includes(event);

    if (isPassive) {
        return true;
    }

    if (isNonPassive) {
        return false;
    }
};

/**
 * `True` if the event is close to the original event by X pixels either vertically or horizontally.
 * we only start dragging after X pixels so this allows us to know if we should start dragging yet.
 * @param {MouseEvent | TouchEvent} e1
 * @param {MouseEvent | TouchEvent} e2
 * @param {number} pixelCount
 * @returns {boolean}
 */
export function _areEventsNear(e1: MouseEvent | Touch, e2: MouseEvent | Touch, pixelCount: number): boolean {
    // by default, we wait 4 pixels before starting the drag
    if (pixelCount === 0) {
        return false;
    }

    const diffX = Math.abs(e1.clientX - e2.clientX);
    const diffY = Math.abs(e1.clientY - e2.clientY);

    return Math.max(diffX, diffY) <= pixelCount;
}

/**
 * Returns the first touch in the touch list that matches the identifier of the provided touch.
 * @param touch The touch to match the identifier against.
 * @param touchList The list of touches to search.
 * @returns The matching touch, or null if not found.
 */
export const _getFirstActiveTouch = (touch: Touch, touchList: TouchList): Touch | null => {
    const identifier = touch.identifier;
    for (let i = 0, len = touchList.length; i < len; ++i) {
        const item = touchList[i];
        if (item.identifier === identifier) {
            return item;
        }
    }
    return null;
};

// walks the path of the event, and returns true if this instance is the first one that it finds. if doing things like
// master / detail grids, and a child grid is found, then it returns false. this stops things like copy/paste
// getting executed on many grids at the same time.
export function _isEventFromThisInstance(beans: UtilBeanCollection, event: UIEvent): boolean {
    return beans.gos.isElementInThisInstance(event.target as HTMLElement);
}

export function _anchorElementToMouseMoveEvent(
    element: HTMLElement,
    mouseMoveEvent: MouseEvent | Touch,
    beans: UtilBeanCollection
): void {
    const eRect = element.getBoundingClientRect();
    const height = eRect.height;

    const browserWidth = _getBodyWidth(beans) - 2; // 2px for 1px borderLeft and 1px borderRight
    const browserHeight = _getBodyHeight(beans) - 2; // 2px for 1px borderTop and 1px borderBottom

    const offsetParent = element.offsetParent;

    if (!offsetParent) {
        return;
    }

    const offsetParentSize = _getElementRectWithOffset(element.offsetParent as HTMLElement);

    const { clientY, clientX } = mouseMoveEvent;

    let top = clientY - offsetParentSize.top - height / 2;
    let left = clientX - offsetParentSize.left - 10;

    const eDocument = _getDocument(beans);
    const win = eDocument.defaultView || window;
    const windowScrollY = win.pageYOffset || eDocument.documentElement.scrollTop;
    const windowScrollX = win.pageXOffset || eDocument.documentElement.scrollLeft;

    // check if the drag and drop image component is not positioned outside of the browser
    if (browserWidth > 0 && left + element.clientWidth > browserWidth + windowScrollX) {
        left = browserWidth + windowScrollX - element.clientWidth;
    }

    if (left < 0) {
        left = 0;
    }

    if (browserHeight > 0 && top + element.clientHeight > browserHeight + windowScrollY) {
        top = browserHeight + windowScrollY - element.clientHeight;
    }

    if (top < 0) {
        top = 0;
    }

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
}

/**  Tuple [target, type, listener, options?] */
export type TempEventHandler = [
    target: EventTarget,
    type: string,
    listener: (e: Event) => void,
    options?: boolean | AddEventListenerOptions,
];

export const addTempEventHandlers = (list: TempEventHandler[], ...handlers: TempEventHandler[]): void => {
    for (const handler of handlers) {
        const [target, type, eventListener, options] = handler;
        target.addEventListener(type, eventListener, options);
        list.push(handler);
    }
};

export const clearTempEventHandlers = (list: TempEventHandler[] | null | undefined): void => {
    if (list) {
        for (const [target, type, listener, options] of list) {
            target.removeEventListener(type, listener, options);
        }
        list.length = 0;
    }
};

export const preventEventDefault = (event: Event) => {
    if (event.cancelable) {
        event.preventDefault();
    }
};
