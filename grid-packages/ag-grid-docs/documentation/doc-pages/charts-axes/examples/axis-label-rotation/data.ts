const years: number[] = [];
for (let year = 2005; year <= 2022; year++) {
    years.push(year);
}

const countries = [
    'Ireland',
    'Spain',
    'United Kingdom',
    'France',
    'Germany',
    'Luxembourg',
    'Sweden',
    'Norway',
    'Italy',
    'Greece',
    'Iceland',
    'Portugal',
    'Malta',
    'Brazil',
    'Argentina',
    'Colombia',
    'Peru',
    'Venezuela',
    'Uruguay',
    'Belgium',
];
countries.sort();

export function getData(): any[] {
    return years.map((year, idx) => ({
        year,
        country: countries[idx],
        value: Math.round(Math.random() * 1000),
    }));
}
