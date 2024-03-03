import { Tween } from '@tweenjs/tween.js';
import { AG_ROW_HOVER_CLASSNAME, AG_ROW_SELECTOR } from '../constants';
import { getOffset } from '../dom';
import { Point } from '../geometry';
import { PathItem } from '../pathRecorder';
import { clearAllRowHighlights } from '../scriptActions/clearAllRowHighlights';
import { moveTarget } from './move';

export interface MouseDataItem {
    pos: Point;
}

interface TweenItem {
    fromPos: Point;
    toPos: Point;
    duration: number;
}

function getTweenArray(path: PathItem<MouseDataItem>[]): TweenItem[] {
    if (!path.length) {
        return [];
    }
    let prevItem = path[0];
    const output: TweenItem[] = [];

    path.slice(1).forEach((item) => {
        const fromPos = prevItem.data.pos;
        const toPos = item.data.pos;

        const prevTime = new Date(prevItem.time).getTime();
        const curTime = new Date(item.time).getTime();
        const duration = curTime - prevTime;

        prevItem = item;

        const tweenItem: TweenItem = {
            fromPos,
            toPos,
            duration,
        };
        output.push(tweenItem);
    });

    return output;
}

export async function playPath({ target, path }): Promise<void> {
    if (!path.length) {
        return;
    }

    const offset = getOffset(target);
    const tweenArray = getTweenArray(path);
    return new Promise((resolve) => {
        const [firstTween] = tweenArray;
        const onChange = (event) => {
            const coords = event.target.target;
            moveTarget({ target, coords, offset });

            // Hover over rows
            const hoverOffset: Point = { x: 40, y: 40 }; // To account for differences is mouse size
            const hoverOverEl = document.elementFromPoint(coords.x + hoverOffset.x, coords.y + hoverOffset.y);
            if (hoverOverEl) {
                clearAllRowHighlights();

                const row = hoverOverEl.closest(AG_ROW_SELECTOR);
                if (row) {
                    row.classList.add(AG_ROW_HOVER_CLASSNAME);
                }
            }
        };
        const onComplete = () => {
            resolve();
        };
        const tween = new Tween({
            x: firstTween.fromPos.x,
            y: firstTween.fromPos.y,
        });
        tween.onUpdate(onChange).onComplete(onComplete);

        tweenArray.forEach(({ toPos, duration }) => {
            tween.to(toPos, duration);
        });
    });
}
