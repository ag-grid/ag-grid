export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise((resolve) => setTimeout(() => resolve(generateData()), delay));
}

export function deepMerge(obj1: any, obj2: any): any {
    const output = { ...obj1 };

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
                output[key] = deepMerge(obj1[key] || {}, obj2[key]);
            } else {
                output[key] = obj2[key];
            }
        }
    }

    return output;
}

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

    return countries.map((country, index) => ({
        country,
        gold: Math.floor(((index + 1 / 7) * 333) % 100),
        silver: Math.floor(((index + 1 / 3) * 555) % 100),
        bronze: Math.floor(((index + 1 / 7.3) * 777) % 100),
    }));
}
