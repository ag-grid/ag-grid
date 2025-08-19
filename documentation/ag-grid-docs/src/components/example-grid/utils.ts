// taken from http://stackoverflow.com/questions/3062746/special-simple-random-number-generator
let seed = 123456789;
const m = Math.pow(2, 32);
const a = 1103515245;
const c = 12345;

const IS_SSR = typeof window === 'undefined';

export const pseudoRandom = () => {
    seed = (a * seed + c) % m;
    return seed / m;
};

// the moving animation looks crap on IE, firefox and safari, so we turn it off in the demo for them
export const suppressColumnMoveAnimation = () => {
    if (IS_SSR) {
        return false;
    }
    const isFirefox = typeof InstallTrigger !== 'undefined';
    // At least Safari 3+: "[object HTMLElementConstructor]"
    const isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    return isFirefox || isSafari;
};

export function createDataSizeValue(rows: number, cols: number): string {
    return `${rows}x${cols}`;
}
