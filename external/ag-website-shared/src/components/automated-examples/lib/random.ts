export const pseudoRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

export function randomBetween(min: number, max: number) {
    return Math.floor(pseudoRandom() * (max - min + 1)) + min;
}

export function simpleRandomSort<T>(array: T[]): T[] {
    return array.sort(() => (pseudoRandom() > 0.5 ? 1 : -1));
}
