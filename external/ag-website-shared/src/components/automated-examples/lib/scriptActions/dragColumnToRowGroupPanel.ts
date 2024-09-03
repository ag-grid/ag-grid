import type { Group } from '@tweenjs/tween.js';

import { type AgElementFinder } from '../agElements';
import { AG_DND_GHOST_SELECTOR, DRAG_COLUMN_GHOST_CLASS } from '../constants';
import { type Mouse } from '../createMouse';
import { getScrollOffset } from '../dom';
import { addPoints, minusPoint } from '../geometry';
import { type ScriptDebugger } from '../scriptDebugger';
import { type EasingFunction } from '../tween';
import { createMoveMouse } from './createMoveMouse';
import { moveTarget } from './move';
import { removeDragAndDropHandles } from './removeDragAndDropHandles';

interface DragColumnToRowGroupPanelParams {
    mouse: Mouse;
    headerCellName: string;
    duration: number;
    easing?: EasingFunction;
    tweenGroup: Group;
    agElementFinder: AgElementFinder;
    scriptDebugger?: ScriptDebugger;
}

export async function dragColumnToRowGroupPanel({
    mouse,
    headerCellName,
    duration,
    easing,
    tweenGroup,
    agElementFinder,
    scriptDebugger,
}: DragColumnToRowGroupPanelParams) {
    const headerCell = agElementFinder.get('headerCell', {
        text: headerCellName,
    });
    const fromPos = headerCell?.getPos();

    if (!fromPos) {
        scriptDebugger?.errorLog('Header not found:', headerCellName);
        return;
    }

    const dropArea = agElementFinder.get('columnDropArea');
    const dropAreaY = dropArea?.getPos()?.y;
    const rowGroupPanelOffset = {
        x: 20,
        y: dropAreaY === undefined ? -50 : dropAreaY - fromPos.y,
    };
    const toPos = addPoints(fromPos, rowGroupPanelOffset)!;

    const headerElem = headerCell?.get();
    const mouseDownEvent: MouseEvent = new MouseEvent('mousedown', {
        clientX: fromPos.x,
        clientY: fromPos.y,
    });
    if (!headerElem) {
        return;
    }
    headerElem.dispatchEvent(mouseDownEvent);

    const offset = mouse.getOffset();
    const scrollOffset = getScrollOffset();

    await createMoveMouse({
        mouse,
        toPos,
        duration,
        tweenGroup,
        easing,
        tweenOnChange: ({ coords }) => {
            const currentScrollOffset = getScrollOffset();
            const currentScrollDiff = minusPoint(scrollOffset, currentScrollOffset);
            const mouseCoords = addPoints(coords, currentScrollDiff);
            const mouseMoveEvent: MouseEvent = new MouseEvent('mousemove', {
                clientX: mouseCoords?.x,
                clientY: mouseCoords?.y,
                view: document.defaultView || window,
            });
            document.dispatchEvent(mouseMoveEvent);

            // Add extra class to drag and drop ghost, so it can be styled
            document.querySelectorAll(AG_DND_GHOST_SELECTOR).forEach((el) => {
                el.classList.add(DRAG_COLUMN_GHOST_CLASS);
            });

            // Move mouse as well
            moveTarget({ target: mouse.getTarget(), coords, offset });
        },
        scriptDebugger,
    });

    const draggedHeaderItem = document.querySelector(AG_DND_GHOST_SELECTOR);
    if (draggedHeaderItem) {
        const mouseUpEvent: MouseEvent = new MouseEvent('mouseup', {
            clientX: toPos.x,
            clientY: toPos.y,
        });
        document.dispatchEvent(mouseUpEvent);
    } else {
        scriptDebugger?.errorLog('No dragged header item:', headerCellName);
    }

    removeDragAndDropHandles();
}
