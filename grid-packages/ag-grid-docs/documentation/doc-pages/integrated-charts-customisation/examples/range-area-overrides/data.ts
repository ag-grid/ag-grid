export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise(resolve => setTimeout(() => resolve(generateData()), delay));
}

function generateData(): any[] {
    const countries = [
        'Ireland', 'Spain', 'United Kingdom', 'France', 'Germany',
        'Luxembourg', 'Sweden', 'Norway', 'Italy', 'Greece',
        'Iceland', 'Portugal', 'Malta', 'Brazil', 'Argentina',
        'Colombia', 'Peru', 'Venezuela', 'Uruguay', 'Belgium',
    ];

    const years = [2020, 2021, 2022, 2023, 2024];

    return years.flatMap((year, yearIndex) => countries.map((country, index) => ({
        year,
        country,
        gold: Math.floor(((index + 1 / 7) * 333) % 100) + Math.round(50 * Math.sin((yearIndex / (years.length - 1)) * (Math.PI * 0.75))),
        silver: Math.floor(((index + 1 / 3) * 555) % 100) + Math.round(50 * Math.sin((yearIndex / (years.length - 1)) * (Math.PI * 0.75))),
        bronze: Math.floor(((index + 1 / 7.3) * 777) % 100) + Math.round(50 * Math.sin((yearIndex / (years.length - 1)) * (Math.PI * 0.75))),
    })));
}
