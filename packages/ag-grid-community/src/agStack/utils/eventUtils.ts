const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel', 'scroll'];
const NON_PASSIVE_EVENTS = ['wheel'];

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
