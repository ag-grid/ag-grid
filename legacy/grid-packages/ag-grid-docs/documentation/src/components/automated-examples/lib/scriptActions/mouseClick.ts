import { Mouse } from '../createMouse';
import { Point } from '../geometry';
import { ScriptDebugger } from '../scriptDebugger';
import { waitFor } from './waitFor';

export type ClickType = 'left' | 'middle' | 'right';

interface MouseClickParams {
    containerEl?: HTMLElement;
    mouse: Mouse;
    clickType?: ClickType;
    coords: Point;
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
    coords,
    clickType = 'left',
    scriptDebugger,
}: MouseClickParams): Promise<void> {
    const element = document.elementFromPoint(coords.x, coords.y);
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

    const contentMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: false,
        view: window,
        button,
        clientX: coords.x,
        clientY: coords.y,
    });
    element.dispatchEvent(contentMenuEvent);

    mouse.click();
    await waitFor(300);
}
