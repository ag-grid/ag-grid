import { Group } from '@tweenjs/tween.js';
import { AG_ROW_HOVER_CLASSNAME, AG_ROW_SELECTOR } from '../constants';
import { Mouse } from '../createMouse';
import { addPoints, Point } from '../geometry';
import { ScriptDebugger } from '../scriptDebugger';
import { EasingFunction } from '../tween';
import { clearAllRowHighlights } from './clearAllRowHighlights';
import { createMoveMouse } from './createMoveMouse';

interface MoveTargetParams {
    target: HTMLElement;
    coords: Point;
    offset?: Point;
    scriptDebugger?: ScriptDebugger;
}

export interface MoveMouseParams {
    mouse: Mouse;
    coords: Point;
    offset?: Point;
    scriptDebugger?: ScriptDebugger;
}

interface MoveToParams {
    mouse: Mouse;
    toPos: Point | (() => Point | undefined);
    speed?: number;
    duration?: number;
    hoverOver?: boolean;
    tweenGroup: Group;
    easing?: EasingFunction;
    scriptDebugger?: ScriptDebugger;
}

export function moveTarget({ target, coords, offset, scriptDebugger }: MoveTargetParams) {
    const x = coords.x + (offset?.x ?? 0);
    const y = coords.y + (offset?.y ?? 0);

    target.style.setProperty('transform', `translate(${x}px, ${y}px)`);

    scriptDebugger?.drawPoint({ x, y });
}

export function moveMouse({ mouse, coords, offset, scriptDebugger }: MoveMouseParams) {
    const mousePos = addPoints(coords, offset)!;

    mouse.getTarget().style.setProperty('transform', `translate(${mousePos.x}px, ${mousePos.y}px)`);

    scriptDebugger?.drawPoint(addPoints(mousePos, mouse.getCursorOffset())!);
}

export function moveTo({
    mouse,
    toPos: toPosValue,
    speed,
    duration,
    hoverOver,
    tweenGroup,
    easing,
    scriptDebugger,
}: MoveToParams) {
    const toPos = toPosValue instanceof Function ? toPosValue() : toPosValue;

    if (!toPos) {
        scriptDebugger?.errorLog(`No 'toPos'`);
        return;
    }

    return createMoveMouse({
        mouse,
        toPos,
        speed: speed,
        duration: duration,
        tweenGroup,
        easing,
        tweenOnChange: ({ coords }) => {
            if (hoverOver) {
                const hoverOverEl = document.elementFromPoint(coords.x, coords.y);
                if (hoverOverEl) {
                    clearAllRowHighlights();

                    const row = hoverOverEl.closest(AG_ROW_SELECTOR);
                    if (row) {
                        row.classList.add(AG_ROW_HOVER_CLASSNAME);
                    }
                }
            }
        },
        scriptDebugger,
    });
}
