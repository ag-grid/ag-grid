import { Group, Tween } from '@tweenjs/tween.js';
import { AG_ROW_HOVER_CLASSNAME, AG_ROW_SELECTOR } from '../constants';
import { Mouse } from '../createMouse';
import { ScriptDebugger } from '../createScriptDebugger';
import { getOffset } from '../dom';
import { Point } from '../geometry';
import { EasingFunction, getTweenDuration } from '../tween';
import { clearAllRowHighlights } from './clearAllRowHighlights';
import { moveMouse } from './move';

interface CreateMoveMouseParams {
    mouse: Mouse;
    tweenGroup: Group;
    fromPos?: Point;
    toPos: Point;
    tweenOnChange?: (params: { coords: Point; elapsed: number }) => void;
    speed?: number;
    duration?: number;
    /**
     * Easing function
     *
     * @see https://createjs.com/docs/tweenjs/classes/Ease.html
     */
    easing?: EasingFunction;
    scriptDebugger?: ScriptDebugger;
}

function getTargetPos(target: HTMLElement): Point | undefined {
    if (!target) {
        console.error('No target');
        return;
    }

    const transform = target.style.transform;
    const regex = /.*\((-?\d+(\.\d+)?)px, ?(-?\d+(\.\d+)?)px\)/;
    const matches = transform.match(regex);

    if (!matches) {
        return;
    }

    const offset = getOffset(target);

    return {
        x: parseInt(matches[1], 10) - offset.x,
        y: parseInt(matches[3], 10) - offset.y,
    };
}

export const createMoveMouse = ({
    mouse,
    tweenGroup,
    fromPos: startingFromPos,
    toPos,
    tweenOnChange,
    speed,
    duration,
    easing,
    scriptDebugger,
}: CreateMoveMouseParams): Promise<void> => {
    const fromPos = startingFromPos ? startingFromPos : getTargetPos(mouse.getTarget());
    const coords = { ...fromPos } as Point;

    if (!fromPos) {
        console.error(`No 'fromPos'`, {
            startingFromPos,
            target: mouse.getTarget(),
            toPos,
            speed,
            duration,
        });
        return Promise.reject(`No 'fromPos'`);
    }

    // NOTE: Need to get the offset at the beginning, rather than on update to account for initial scroll position
    const offset = mouse.getOffset();
    return new Promise((resolve) => {
        const tweenDuration = getTweenDuration({
            fromPos,
            toPos,
            speed,
            duration,
        });

        const tween = new Tween(coords, tweenGroup)
            .to(toPos, tweenDuration)
            .onUpdate((object: Point, elapsed) => {
                moveMouse({ mouse, coords: object, offset, scriptDebugger });

                const hoverOverEl = document.elementFromPoint(object.x, object.y);
                if (hoverOverEl) {
                    clearAllRowHighlights();

                    const row = hoverOverEl.closest(AG_ROW_SELECTOR);
                    if (row) {
                        row.classList.add(AG_ROW_HOVER_CLASSNAME);
                    }
                }
                tweenOnChange && tweenOnChange({ coords: object, elapsed });
            })
            .onComplete(() => {
                resolve();
            });
        if (easing) {
            tween.easing(easing);
        }

        tween.start();
    });
};
