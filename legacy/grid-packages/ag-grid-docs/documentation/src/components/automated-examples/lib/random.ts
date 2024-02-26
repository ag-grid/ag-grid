// From http://stackoverflow.com/questions/3062746/special-simple-random-number-generator
let seed = 123456789;
const m = Math.pow(2, 32);
const a = 1103515245;
const c = 12345;

export const pseudoRandom = () => {
    seed = (a * seed + c) % m;
    return seed / m;
};

export function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function simpleRandomSort<T>(array: T[]): T[] {
    return array.sort(() => (Math.random() > 0.5 ? 1 : -1));
}
