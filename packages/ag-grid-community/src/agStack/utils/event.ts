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
