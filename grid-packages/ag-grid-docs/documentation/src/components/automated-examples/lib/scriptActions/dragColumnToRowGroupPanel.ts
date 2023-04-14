import { Group } from '@tweenjs/tween.js';
import { getHeaderCell, getHeaderCellPos } from '../agQuery';
import { AG_DND_GHOST_SELECTOR } from '../constants';
import { Mouse } from '../createMouse';
import { getScrollOffset } from '../dom';
import { addPoints, minusPoint } from '../geometry';
import { EasingFunction } from '../tween';
import { createTween } from './createTween';
import { moveTarget } from './move';

interface DragColumnToRowGroupPanelParams {
    containerEl?: HTMLElement;
    mouse: Mouse;
    headerCellName: string;
    duration: number;
    easing?: EasingFunction;
    tweenGroup: Group;
}

export async function dragColumnToRowGroupPanel({
    containerEl,
    mouse,
    headerCellName,
    duration,
    easing,
    tweenGroup,
}: DragColumnToRowGroupPanelParams) {
    const fromPos = getHeaderCellPos({ containerEl, headerCellText: headerCellName });

    if (!fromPos) {
        console.error('Header not found:', headerCellName);
        return;
    }
    const rowGroupPanelOffset = {
        x: 20,
        y: -50,
    };
    const toPos = addPoints(fromPos, rowGroupPanelOffset)!;

    const headerElem = getHeaderCell({ containerEl, headerCellText: headerCellName });
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
    await createTween({
        group: tweenGroup,
        fromPos,
        toPos,
        onChange: ({ coords }) => {
            const currentScrollOffset = getScrollOffset();
            const currentScrollDiff = minusPoint(scrollOffset, currentScrollOffset);
            const mouseCoords = addPoints(coords, currentScrollDiff);
            const mouseMoveEvent: MouseEvent = new MouseEvent('mousemove', {
                clientX: mouseCoords?.x,
                clientY: mouseCoords?.y,
                view: document.defaultView || window,
            });
            document.dispatchEvent(mouseMoveEvent);

            // Move mouse as well
            moveTarget({ target: mouse.getTarget(), coords, offset });
        },
        duration,
        easing,
    });

    const draggedHeaderItem = document.querySelector(AG_DND_GHOST_SELECTOR);
    if (draggedHeaderItem) {
        const mouseUpEvent: MouseEvent = new MouseEvent('mouseup', {
            clientX: toPos.x,
            clientY: toPos.y,
        });
        document.dispatchEvent(mouseUpEvent);
    } else {
        console.error('No dragged header item:', headerCellName);
    }
}
