import type { Group } from '@tweenjs/tween.js';

import { type AgElementFinder } from '../agElements';
import { type Mouse } from '../createMouse';
import { getScrollOffset } from '../dom';
import { addPoints, minusPoint } from '../geometry';
import { type ScriptDebugger } from '../scriptDebugger';
import { type EasingFunction } from '../tween';
import { createTween } from './createTween';
import { moveMouse } from './move';

interface DragRangeParams {
    agElementFinder: AgElementFinder;
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
    agElementFinder,
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
    const startCell = agElementFinder.get('cell', {
        colIndex: startCol,
        rowIndex: startRow,
    });
    const fromPos = startCell?.getPos();
    if (!fromPos) {
        scriptDebugger?.errorLog(`Start position not found: col=${startCol}, row=${startRow}`);
        return;
    }

    const toPos = agElementFinder
        .get('cell', {
            colIndex: endCol,
            rowIndex: endRow,
        })
        ?.getPos();
    if (!toPos) {
        scriptDebugger?.errorLog(`End position not found: col=${endCol}, row=${endRow}`);
        return;
    }

    const startCellEl = startCell?.get();
    if (!startCellEl) {
        scriptDebugger?.errorLog(`Start cell not found: col=${startCol}, row=${startRow}`);
        return;
    }
    const mouseDownEvent: MouseEvent = new MouseEvent('mousedown', {
        clientX: fromPos.x,
        clientY: fromPos.y,
        bubbles: true,
    });
    startCellEl.dispatchEvent(mouseDownEvent);

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
    startCellEl.dispatchEvent(mouseUpEvent);
}
