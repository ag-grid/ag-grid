import { DEFAULT_MOUSE_SPEED } from './constants';
import { Point } from './geometry';

export type EasingFunction = (amount: number) => number;

export function getDurationFromSpeed({
    fromPos,
    toPos,
    speed,
}: {
    speed: number;
    fromPos: Point;
    toPos: Point;
}): number {
    const distance = Math.sqrt(Math.pow(toPos.x - fromPos.x, 2) + Math.pow(toPos.y - fromPos.y, 2));

    return Math.round(distance / speed);
}

/**
 * Get tween duration by the following priority:
 *  - `speed` for distance between `fromPos` to `toPos`
 *  - `duration`
 *  - default speed for distance between `fromPos` to `toPos`
 */
export function getTweenDuration({
    fromPos,
    toPos,
    speed,
    duration,
}: {
    fromPos: Point;
    toPos: Point;
    speed?: number;
    duration?: number;
}): number {
    let outputDuration: number = getDurationFromSpeed({
        fromPos,
        toPos,
        speed: DEFAULT_MOUSE_SPEED,
    });

    if (speed !== undefined) {
        outputDuration = getDurationFromSpeed({
            fromPos,
            toPos,
            speed,
        });
    } else if (duration !== undefined) {
        outputDuration = duration;
    }

    return outputDuration;
}
