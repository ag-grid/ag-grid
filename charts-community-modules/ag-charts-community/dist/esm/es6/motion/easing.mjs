import interpolate from '../interpolate/value.mjs';
function createEase(fn) {
    return ({ from, to }) => {
        const interp = interpolate(from, to);
        return (time) => interp(fn(time));
    };
}
export function linear({ from, to }) {
    return interpolate(from, to);
}
// https://easings.net/
export const easeIn = createEase((x) => 1 - Math.cos((x * Math.PI) / 2));
export const easeOut = createEase((x) => Math.sin((x * Math.PI) / 2));
export const easeInOut = createEase((x) => -(Math.cos(x * Math.PI) - 1) / 2);
export const easeOutElastic = createEase((x) => {
    if (x === 0 || x === 1)
        return x;
    const scale = Math.pow(2, -10 * x);
    const position = x * 10 - 0.75;
    const arc = (2 * Math.PI) / 3;
    return scale * Math.sin(position * arc) + 1;
});
