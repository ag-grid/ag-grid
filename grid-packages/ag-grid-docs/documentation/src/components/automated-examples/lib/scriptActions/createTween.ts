import { Group, Tween } from '@tweenjs/tween.js';
import { Point } from '../geometry';
import { EasingFunction, getTweenDuration } from '../tween';

interface CreateTweenParams {
    group: Group;
    fromPos: Point;
    toPos: Point;
    onChange: (params: { elapsed: number; coords: Point }) => void;
    speed?: number;
    duration?: number;
    /**
     * Easing function
     *
     * @see https://createjs.com/docs/tweenjs/classes/Ease.html
     */
    easing?: EasingFunction;
}

export const createTween = ({ group, fromPos, toPos, onChange, speed, duration, easing }: CreateTweenParams) => {
    const coords = { ...fromPos };

    return new Promise((resolve) => {
        const tweenDuration = getTweenDuration({
            fromPos,
            toPos,
            speed,
            duration,
        });

        const tween = new Tween(coords, group)
            .to(toPos, tweenDuration)
            .onUpdate((object, elapsed) => {
                onChange && onChange({ elapsed, coords: object });
            })
            .onComplete(resolve);

        if (easing) {
            tween.easing(easing);
        }

        tween.start();
    });
};
