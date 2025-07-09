import type { AgFrameworkOverrides } from '../interfaces/agFrameworkOverrides';

const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel', 'scroll'];
const NON_PASSIVE_EVENTS = ['wheel'];

export function _addSafePassiveEventListener(
    frameworkOverrides: AgFrameworkOverrides,
    eElement: HTMLElement,
    event: string,
    listener: (event?: any) => void
) {
    const passive = getPassiveStateForEvent(event);

    let options: { passive: boolean } | undefined;

    if (passive != null) {
        options = { passive };
    }

    // this check is here for certain scenarios where I believe the user must be destroying
    // the grid somehow but continuing for it to be used
    if (frameworkOverrides && frameworkOverrides.addEventListener) {
        frameworkOverrides.addEventListener(eElement, event, listener, options);
    }
}

export const getPassiveStateForEvent = (event: string): boolean | undefined => {
    const isPassive = PASSIVE_EVENTS.includes(event);
    const isNonPassive = NON_PASSIVE_EVENTS.includes(event);

    if (isPassive) {
        return true;
    }

    if (isNonPassive) {
        return false;
    }
};
