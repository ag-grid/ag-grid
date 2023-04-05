import { Mouse } from '../createMouse';
import { Point } from '../geometry';
import { waitFor } from './waitFor';

interface RightClickParams {
    containerEl?: HTMLElement;
    mouse: Mouse;
    coords: Point;
}

export async function rightClick({ mouse, coords }: RightClickParams): Promise<void> {
    const element = document.elementFromPoint(coords.x, coords.y);
    if (!element) {
        console.error('No element found');
        return;
    }

    const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: false,
        view: window,
        button: 2,
        buttons: 2,
        clientX: coords.x,
        clientY: coords.y,
    });
    element.dispatchEvent(mouseDownEvent);

    const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: false,
        view: window,
        button: 2,
        buttons: 0,
        clientX: coords.x,
        clientY: coords.y,
    });
    element.dispatchEvent(mouseUpEvent);

    const contentMenuEvent = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: false,
        view: window,
        button: 2,
        buttons: 0,
        clientX: coords.x,
        clientY: coords.y,
    });
    element.dispatchEvent(contentMenuEvent);

    mouse.click();
    await waitFor(300);
}
