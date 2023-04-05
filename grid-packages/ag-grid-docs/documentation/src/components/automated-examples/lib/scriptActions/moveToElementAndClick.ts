import { Group } from '@tweenjs/tween.js';
import { AgElementFinder } from '../agElements';
import { AgElementName } from '../agElements/agElementsConfig';
import { Mouse } from '../createMouse';
import { ScriptDebugger } from '../scriptDebugger';
import { EasingFunction } from '../tween';
import { createMoveMouse } from './createMoveMouse';
import { waitFor } from './waitFor';

interface MoveToElementAndClickParams {
    agElementFinder: AgElementFinder;
    target: AgElementName;
    targetParams: any;
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
    mouse,
    speed,
    duration,
    tweenGroup,
    easing,
    scriptDebugger,
}: MoveToElementAndClickParams) {
    const element = agElementFinder.get(target, targetParams);
    if (!element) {
        console.error(`No element found: ${target}`);
        return;
    }
    const toPos = element.getPos()!;

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
    mouse.click();
    await 200;

    element.get()?.click();
}
