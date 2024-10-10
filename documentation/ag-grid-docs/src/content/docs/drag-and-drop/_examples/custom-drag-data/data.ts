let rowIdSequence = 100;

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

export function getData(): any[] {
    const data: any[] = [];
    ['Red', 'Green', 'Blue', 'Red', 'Green', 'Blue', 'Red', 'Green', 'Blue'].forEach(function (color) {
        const newDataItem = {
            id: rowIdSequence++,
            color: color,
            value1: Math.floor(pRandom() * 100),
            value2: Math.floor(pRandom() * 100),
        };
        data.push(newDataItem);
    });
    return data;
}
