export interface TAthlete {
    name: string;
    medals: {
        gold: number;
        silver: number;
        bronze: number;
    };
    person: {
        age: number;
        country: string;
    };
}

export function fetchDataAsync(): Promise<TAthlete[]> {
    // Simulate a slow network request
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { name: 'Michael Phelps', person: { age: 23, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Michael Phelps', person: { age: 19, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Michael Phelps', person: { age: 27, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Natalie Coughlin', person: { age: 25, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Aleksey Nemov', person: { age: 24, country: 'Russia' }, medals: getRandomMedals() },
                { name: 'Alicia Coutts', person: { age: 24, country: 'Australia' }, medals: getRandomMedals() },
                { name: 'Missy Franklin', person: { age: 17, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Ryan Lochte', person: { age: 27, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Allison Schmitt', person: { age: 22, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Natalie Coughlin', person: { age: 21, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Ian Thorpe', person: { age: 17, country: 'Australia' }, medals: getRandomMedals() },
                { name: 'Dara Torres', person: { age: 33, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Cindy Klassen', person: { age: 26, country: 'Canada' }, medals: getRandomMedals() },
                { name: 'Nastia Liukin', person: { age: 18, country: 'United States' }, medals: getRandomMedals() },
                { name: 'Marit Bjørgen', person: { age: 29, country: 'Norway' }, medals: getRandomMedals() },
                { name: 'Sun Yang', person: { age: 20, country: 'China' }, medals: getRandomMedals() },
            ]);
        }, 600);
    });
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

function getRandomMedals() {
    return {
        gold: Math.floor(pRandom() * 10),
        silver: Math.floor(pRandom() * 10),
        bronze: Math.floor(pRandom() * 10),
    };
}
