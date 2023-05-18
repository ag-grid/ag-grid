import interpolate from '../interpolate/value';

interface EasingOpts<T> {
    from: T;
    to: T;
}

export type Easing<T> = (opts: EasingOpts<T>) => (time: number) => T;

function createEase<T>(fn: (x: number) => number): Easing<T> {
    return ({ from, to }) => {
        const interp = interpolate(from, to);
        return (time: number) => interp(fn(time));
    };
}

export function linear<T>({ from, to }: EasingOpts<T>): (time: number) => T {
    return interpolate(from, to);
}

// https://easings.net/
export const easeIn = createEase<any>((x) => 1 - Math.cos((x * Math.PI) / 2));
export const easeOut = createEase<any>((x) => Math.sin((x * Math.PI) / 2));
export const easeInOut = createEase<any>((x) => -(Math.cos(x * Math.PI) - 1) / 2);
export const easeOutElastic = createEase<any>((x) => {
    if (x === 0 || x === 1) return x;

    const scale = Math.pow(2, -10 * x);
    const position = x * 10 - 0.75;
    const arc = (2 * Math.PI) / 3;

    return scale * Math.sin(position * arc) + 1;
});
