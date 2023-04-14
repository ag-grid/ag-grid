import { Group } from '@tweenjs/tween.js';
import { getCell, getCellPos } from '../agQuery';
import { Mouse } from '../createMouse';
import { getScrollOffset } from '../dom';
import { addPoints, minusPoint } from '../geometry';
import { ScriptDebugger } from '../scriptDebugger';
import { EasingFunction } from '../tween';
import { createTween } from './createTween';
import { moveMouse } from './move';

interface DragRangeParams {
    containerEl?: HTMLElement;
    mouse: Mouse;
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
    duration: number;
    easing?: EasingFunction;
    tweenGroup: Group;
    scriptDebugger?: ScriptDebugger;
}

export async function dragRange({
    containerEl,
    mouse,
    startCol,
    startRow,
    endCol,
    endRow,
    duration,
    easing,
    tweenGroup,
    scriptDebugger,
}: DragRangeParams) {
    const fromPos = getCellPos({ containerEl, colIndex: startCol, rowIndex: startRow });
    if (!fromPos) {
        console.error(`Start position not found: col=${startCol}, row=${startRow}`);
        return;
    }

    const toPos = getCellPos({ containerEl, colIndex: endCol, rowIndex: endRow });
    if (!toPos) {
        console.error(`End position not found: col=${endCol}, row=${endRow}`);
        return;
    }

    const startCell = getCell({
        containerEl,
        colIndex: startCol,
        rowIndex: startRow,
    });
    if (!startCell) {
        console.error(`Start cell not found: col=${startCol}, row=${startRow}`);
        return;
    }
    const mouseDownEvent: MouseEvent = new MouseEvent('mousedown', {
        clientX: fromPos.x,
        clientY: fromPos.y,
        bubbles: true,
    });
    startCell.dispatchEvent(mouseDownEvent);

    const offset = mouse.getOffset();
    const scrollOffset = getScrollOffset();
    await createTween({
        group: tweenGroup,
        fromPos,
        toPos,
        onChange: ({ coords }) => {
            const currentScrollOffset = getScrollOffset();
            const currentScrollDiff = minusPoint(scrollOffset, currentScrollOffset);
            const mouseCoords = addPoints(coords, currentScrollDiff);
            // Get the element at the coordinates
            const element = document.elementFromPoint(coords.x, coords.y);
            const mouseMoveEvent: MouseEvent = new MouseEvent('mousemove', {
                clientX: mouseCoords?.x,
                clientY: mouseCoords?.y,
                view: document.defaultView || window,
                bubbles: true,
            });

            element?.dispatchEvent(mouseMoveEvent);

            // Move mouse as well
            moveMouse({ mouse, coords, offset, scriptDebugger });
        },
        duration,
        easing,
    });

    const mouseUpEvent: MouseEvent = new MouseEvent('mouseup', {
        clientX: toPos.x,
        clientY: toPos.y,
        bubbles: true,
    });
    startCell.dispatchEvent(mouseUpEvent);
}
