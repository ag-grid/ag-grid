export function getData(): any[] {
    const rowData = [];
    const firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
    const lastNames = ['Pink', 'Black', 'White', 'Brown', 'Smith', 'Smooth', 'Anderson'];

    for (let i = 0; i < 100; i++) {
        rowData.push({
            a: Math.floor(pRandom() * 100),
            b: Math.floor(pRandom() * 100),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length],
            c: {
                x: Math.floor(pRandom() * 100),
                y: Math.floor(pRandom() * 100),
            },
        });
    }

    return rowData;
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
