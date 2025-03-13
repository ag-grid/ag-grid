export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise((resolve) => setTimeout(() => resolve(generateData()), delay));
}

const scales = [10_000_000, 100_000_000, 1_000_000_000];

function generateData(): any[] {
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

    function randomData(): number {
        return Math.round(
            Math.random() * (scales[Math.round((Math.random() * 10) % (scales.length - 1))] - 150_000_000)
        );
    }

    return countries.map((country) => ({
        country,
        early: randomData(),
        mid: randomData(),
        end: randomData(),
    }));
}
