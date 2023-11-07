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

    return countries.map((country, index) => {
        const gold = Math.floor(((index + 1 / 7) * 333) % 100);
        const silver = Math.floor(((index + 1 / 3) * 555) % 100);
        const bronze = Math.floor(((index + 1 / 7.3) * 777) % 100);

        return {
            country,
            gold,
            silver,
            bronze,
            total: gold + silver + bronze
        };
    });
}
