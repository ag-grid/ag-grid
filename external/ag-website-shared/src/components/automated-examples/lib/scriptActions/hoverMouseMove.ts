import type { Group } from '@tweenjs/tween.js';

import { type Mouse } from '../createMouse';
import { getScrollOffset } from '../dom';
import { type Point, addPoints, minusPoint } from '../geometry';
import { type ScriptDebugger } from '../scriptDebugger';
import { type EasingFunction } from '../tween';
import { createTween } from './createTween';
import { moveMouse } from './move';

interface HoverMouseMoveParams {
    mouse: Mouse;
    fromPos: Point;
    toPos: Point;
    duration: number;
    easing?: EasingFunction;
    tweenGroup: Group;
    scriptDebugger?: ScriptDebugger;
}

export async function hoverMouseMove({
    mouse,
    fromPos,
    toPos,
    duration,
    easing,
    tweenGroup,
    scriptDebugger,
}: HoverMouseMoveParams) {
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
}
