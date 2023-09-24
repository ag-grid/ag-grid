import type { Easing } from './easing';
export interface KeyframesOptions<T> {
    duration: number;
    from: T;
    to: T;
    ease?: Easing<T>;
}
export declare enum RepeatType {
    Loop = "loop",
    Reverse = "reverse"
}
export interface AnimationOptions<T> extends KeyframesOptions<T> {
    driver: Driver;
    autoplay?: boolean;
    delay?: number;
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
    reset: () => AnimationControls;
}
export interface DriverControls {
    start: () => void;
    stop: () => void;
    reset: () => void;
}
export declare type Driver = (update: (time: number) => void) => DriverControls;
export declare function animate<T = number>({ driver, duration, from, to, autoplay, delay, ease, repeat: repeatMax, repeatType, onComplete, onPlay, onRepeat, onStop, onUpdate, }: AnimationOptions<T>): AnimationControls;
export interface TweenOptions<T> extends KeyframesOptions<T> {
    driver: Driver;
}
export interface TweenControls<T> {
    start: (onUpdate?: (value: T) => void) => TweenControls<T>;
    stop: () => TweenControls<T>;
}
export declare function tween<T>(opts: TweenOptions<T>): TweenControls<T>;
//# sourceMappingURL=animate.d.ts.map