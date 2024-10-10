export function getData(): any[] {
    const rows = [];

    for (let i = 0; i < 1000; i++) {
        rows.push({ sale: parseFloat(getRandomNumber(-500, 1000).toFixed(2)) });
    }

    return rows;
}

const pRandom = (() => {
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

function getRandomNumber(min: number, max: number) {
    return pRandom() * (max - min) + min;
}
