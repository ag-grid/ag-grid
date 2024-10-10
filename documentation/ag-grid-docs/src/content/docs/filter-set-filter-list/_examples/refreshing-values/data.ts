const animals = ['Monkey', 'Lion', 'Elephant', 'Tiger', 'Giraffe', 'Antelope'];

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
    const rows = [];

    for (let i = 0; i < 2000; i++) {
        const index = Math.floor(pRandom() * animals.length);
        rows.push({ animal: animals[index] });
    }

    return rows;
}
