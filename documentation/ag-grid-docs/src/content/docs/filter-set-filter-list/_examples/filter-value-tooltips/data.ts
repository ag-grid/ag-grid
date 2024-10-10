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
    const latinWords =
        'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore'.split(' ');

    function randomSentence() {
        const startIndex = Math.floor(pRandom() * (latinWords.length / 2));
        const str = latinWords.slice(startIndex, latinWords.length).join(' ');
        return str.charAt(0).toUpperCase() + str.slice(1, str.length);
    }

    const rowData = [];
    for (let i = 0; i < 100; i++) {
        const row = {
            colA: randomSentence(),
            colB: randomSentence(),
            colC: randomSentence(),
        };

        rowData.push(row);
    }

    return rowData;
}
