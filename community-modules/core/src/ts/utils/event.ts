import { GridOptionsService } from '../gridOptionsService';
import { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import { includes } from './array';

const AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';
const PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel', 'scroll'];
const supports: { [key: string]: boolean; } = {};

/**
 * a user once raised an issue - they said that when you opened a popup (eg context menu)
 * and then clicked on a selection checkbox, the popup wasn't closed. this is because the
 * popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
 * checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
 * to get around this, we have a pattern to stop propagation for the purposes of AG Grid,
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

    const eventChecker = (eventName: any) => {
        if (typeof supports[eventName] === 'boolean') {
            return supports[eventName];
        }

        const el = document.createElement(tags[eventName] || 'div');
        eventName = 'on' + eventName;

        return supports[eventName] = (eventName in el);
    };

    return eventChecker;
})();

export function getCtrlForEvent<T>(gridOptionsService: GridOptionsService, event: Event, type: string): T | null {
    let sourceElement = event.target as HTMLElement;

    while (sourceElement) {
        const renderedComp = gridOptionsService.getDomData(sourceElement, type);

        if (renderedComp) {
            return renderedComp as T;
        }

        sourceElement = sourceElement.parentElement!;
    }

    return null;
}

export function isElementInEventPath(element: HTMLElement, event: Event): boolean {
    if (!event || !element) {
        return false;
    }

    return event.composedPath().indexOf(element) >= 0;
}

export function addSafePassiveEventListener(
    frameworkOverrides: IFrameworkOverrides,
    eElement: HTMLElement,
    event: string, listener: (event?: any) => void
) {
    const isPassive = includes(PASSIVE_EVENTS, event);
    const options = isPassive ? {passive: true} : undefined;

    // this check is here for certain scenarios where I believe the user must be destroying
    // the grid somehow but continuing for it to be used
    if (frameworkOverrides && frameworkOverrides.addEventListener) {
        frameworkOverrides.addEventListener(eElement, event, listener, options);
    }
}
