import type { Group } from '@tweenjs/tween.js';

import { type AgElementFinder } from '../agElements';
import { type AgElementName } from '../agElements/agElementsConfig';
import { AG_SCROLLABLE_CONTAINER_SELECTOR } from '../constants';
import { type Mouse } from '../createMouse';
import { isInViewport } from '../dom';
import { type ScriptDebugger } from '../scriptDebugger';
import { type EasingFunction } from '../tween';
import { createMoveMouse } from './createMoveMouse';
import { mouseClick } from './mouseClick';
import { waitFor } from './waitFor';

interface MoveToElementAndClickParams {
    agElementFinder: AgElementFinder;
    target: AgElementName;
    targetParams: any;
    useMouseDown?: boolean;
    mouse: Mouse;
    tweenGroup: Group;
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

export async function moveToElementAndClick({
    agElementFinder,
    target,
    targetParams,
    useMouseDown,
    mouse,
    speed,
    duration,
    tweenGroup,
    easing,
    scriptDebugger,
}: MoveToElementAndClickParams) {
    let element = agElementFinder.get(target, targetParams);
    if (!element) {
        throw new Error(`No element found: ${target}`);
    }

    const scrollContainer = element.get()?.closest(AG_SCROLLABLE_CONTAINER_SELECTOR) as HTMLElement;
    if (scrollContainer && !isInViewport({ element: element.get()!, threshold: 0.5, scrollContainer })) {
        element.get()?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
        await waitFor(400);

        // Recalculate element, because of scroll
        element = agElementFinder.get(target, targetParams);
    }

    const toPos = element?.getPos();
    if (!toPos) {
        throw new Error(`Element position not found: ${target}`);
    }

    await createMoveMouse({
        mouse,
        toPos,
        speed,
        duration,
        tweenGroup,
        easing,
        scriptDebugger,
    });

    await waitFor(500);

    if (useMouseDown) {
        return mouseClick({
            mouse,
            coords: toPos,
            scriptDebugger,
        });
    } else {
        mouse.click();
        await 200;
        element?.get()?.click();
    }
}
