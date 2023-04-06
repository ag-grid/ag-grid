import { Easing, linear } from './easing';

export interface KeyframesOptions<T> {
    from: T;
    to: T;
    duration: number;
    ease?: Easing<T>;
}

export enum RepeatType {
    Loop = 'loop',
    Reverse = 'reverse',
}

export interface AnimationOptions<T> extends KeyframesOptions<T> {
    autoplay?: boolean;
    driver?: Driver;
    repeat?: number;
    repeatType?: RepeatType;
    onComplete?: () => void;
    onPlay?: () => void;
    onRepeat?: () => void;
    onStop?: () => void;
    onUpdate?: (v: T) => void;
}

export interface AnimationControls {
    isPlaying: boolean;
    play: () => AnimationControls;
    pause: () => AnimationControls;
    stop: () => AnimationControls;
}

export interface DriverControls {
    start: () => void;
    stop: () => void;
}

export type Driver = (update: (time: number) => void) => DriverControls;

function requestAnimationFrameDriver(update: (time: number) => void) {
    let requestId: number | undefined;
    let lastTime: number | undefined;

    function frame(time: number) {
        if (lastTime === undefined) lastTime = time;
        const delta = time - lastTime;
        lastTime = time;
        update(delta);

        requestId = requestAnimationFrame(frame);
    }

    return {
        start: () => {
            requestId = requestAnimationFrame(frame);
        },
        stop: () => {
            if (requestId) cancelAnimationFrame(requestId);
        },
    };
}

export function animate<T = number>({
    from,
    to,
    duration,
    autoplay = true,
    driver = requestAnimationFrameDriver,
    ease = linear,
    repeat: repeatMax = Infinity,
    repeatType = RepeatType.Loop,
    onComplete,
    onPlay,
    onRepeat,
    onStop,
    onUpdate,
}: AnimationOptions<T>): AnimationControls {
    let state: T;
    let elapsed = 0;
    let iteration = 0;
    let isForward = true;
    let isOverlapped = false;

    const easing = ease({ from, to });
    const controls: AnimationControls = { isPlaying: false, play, pause, stop };
    const driverControls = driver(update);

    function play(): AnimationControls {
        controls.isPlaying = true;
        driverControls.start();
        onPlay?.();
        return controls;
    }

    function pause(): AnimationControls {
        controls.isPlaying = false;
        return controls;
    }

    function stop(): AnimationControls {
        controls.isPlaying = false;
        driverControls.stop();
        onStop?.();
        return controls;
    }

    function repeat() {
        iteration++;

        if (repeatType === RepeatType.Reverse) {
            isForward = iteration % 2 === 0;
            elapsed = isForward ? elapsed % duration : duration - (elapsed % duration);
        } else {
            elapsed = elapsed % duration;
        }

        isOverlapped = false;
        onRepeat?.();
    }

    function complete() {
        stop();
        onComplete?.();
    }

    function update(delta: number): void {
        if (!isForward) delta = -delta;
        elapsed += delta;

        if (!isOverlapped) {
            state = easing(Math.max(0, elapsed / duration));
            isOverlapped = isForward ? elapsed >= duration : elapsed <= 0;
        }

        onUpdate?.(state);

        if (isOverlapped) {
            if (iteration < repeatMax) {
                repeat();
            } else {
                complete();
            }
        }
    }

    if (autoplay) play();

    return controls;
}
