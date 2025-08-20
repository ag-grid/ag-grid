// taken from http://stackoverflow.com/questions/3062746/special-simple-random-number-generator
let seed = 123456789;
const m = Math.pow(2, 32);
const a = 1103515245;
const c = 12345;

export const pseudoRandom = () => {
    seed = (a * seed + c) % m;
    return seed / m;
};

export function createDataSizeValue(rows: number, cols: number): string {
    return `${rows}x${cols}`;
}
