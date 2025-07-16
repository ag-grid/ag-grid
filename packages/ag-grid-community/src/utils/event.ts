import type { GridOptionsService } from '../gridOptionsService';
import { _getDomData } from '../gridOptionsUtils';

const AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';

const supports: { [key: string]: boolean } = {};

/**
 * a user once raised an issue - they said that when you opened a popup (eg context menu)
 * and then clicked on a selection checkbox, the popup wasn't closed. this is because the
 * popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
 * checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
 * to get around this, we have a pattern to stop propagation for the purposes of AG Grid,
 * but we still let the event pass back to the body.
 * @param {Event} event
 */
export function _stopPropagationForAgGrid(event: Event): void {
    (event as any)[AG_GRID_STOP_PROPAGATION] = true;
}

export function _isStopPropagationForAgGrid(event: Event): boolean {
    return (event as any)[AG_GRID_STOP_PROPAGATION] === true;
}

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

export function _getCtrlForEventTarget<T>(
    gos: GridOptionsService,
    eventTarget: EventTarget | null,
    type: string
): T | null {
    let sourceElement = eventTarget as HTMLElement;

    while (sourceElement) {
        const renderedComp = _getDomData(gos, sourceElement, type);

        if (renderedComp) {
            return renderedComp as T;
        }

        sourceElement = sourceElement.parentElement!;
    }

    return null;
}
