import type { RowData } from './config';

const COUNTRIES = [
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Italy',
    'Spain',
    'Australia',
    'Canada',
    'China',
    'Japan',
    'Brazil',
    'Russia',
    'Netherlands',
    'Sweden',
    'Norway',
    'Kenya',
    'Jamaica',
    'Ethiopia',
    'Mexico',
    'Argentina',
];

const SPORTS = [
    'Swimming',
    'Athletics',
    'Gymnastics',
    'Rowing',
    'Cycling',
    'Boxing',
    'Judo',
    'Fencing',
    'Sailing',
    'Diving',
    'Archery',
    'Shooting',
    'Tennis',
    'Wrestling',
    'Weightlifting',
];

// mulberry32: tiny seeded PRNG so every run (and both modes) sees identical data
function createRandom(seed: number): () => number {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function generateRows(count: number): RowData[] {
    const random = createRandom(42);
    const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];
    const rows: RowData[] = new Array(count);
    for (let i = 0; i < count; i++) {
        const gold = Math.floor(random() * 4);
        const silver = Math.floor(random() * 4);
        const bronze = Math.floor(random() * 4);
        rows[i] = {
            id: i,
            athlete: `Athlete ${Math.floor(random() * 1_000_000)
                .toString(36)
                .toUpperCase()}`,
            country: pick(COUNTRIES),
            sport: pick(SPORTS),
            age: 16 + Math.floor(random() * 30),
            year: 1990 + Math.floor(random() * 35),
            gold,
            silver,
            bronze,
            total: gold + silver + bronze,
        };
    }
    return rows;
}
