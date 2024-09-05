import type { Mouse } from '../createMouse';
import type { Point } from '../geometry';
import type { ScriptDebugger } from '../scriptDebugger';
import { waitFor } from './waitFor';

export type ClickType = 'left' | 'middle' | 'right';

interface MouseClickParams {
    /**
     * Pass in element explicitly, otherwise element is derived from `coords`
     */
    element?: HTMLElement;
    mouse: Mouse;
    clickType?: ClickType;
    coords: Point;
    /**
     * Also send a click event
     *
     * Otherwise, it's just mouseDown and mouseUp events
     */
    withClick?: boolean;
    scriptDebugger?: ScriptDebugger;
}

const CLICK_TYPE_MAPPING: Record<ClickType, number> = {
    left: 0,
    middle: 1,
    right: 2,
};
const DEFAULT_CLICK_BUTTON = CLICK_TYPE_MAPPING.left;

export async function mouseClick({
    mouse,
    element: paramElement,
    coords,
    clickType = 'left',
    withClick,
    scriptDebugger,
}: MouseClickParams): Promise<void> {
    const element = paramElement || document.elementFromPoint(coords.x, coords.y);
    if (!element) {
        scriptDebugger?.errorLog('No element found');
        return;
    }

    const button = CLICK_TYPE_MAPPING[clickType] === undefined ? DEFAULT_CLICK_BUTTON : CLICK_TYPE_MAPPING[clickType];

    const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: false,
        view: window,
        button,
        clientX: coords.x,
        clientY: coords.y,
    });
    element.dispatchEvent(mouseDownEvent);

    const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: false,
        view: window,
        button,
        clientX: coords.x,
        clientY: coords.y,
    });
    element.dispatchEvent(mouseUpEvent);

    if (clickType === 'right') {
        const contentMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: false,
            view: window,
            button,
            clientX: coords.x,
            clientY: coords.y,
        });
        element.dispatchEvent(contentMenuEvent);
    }

    if (withClick) {
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: false,
            view: window,
            clientX: coords.x,
            clientY: coords.y,
        });
        element.dispatchEvent(clickEvent);
    }

    mouse.click();
    await waitFor(300);
}
