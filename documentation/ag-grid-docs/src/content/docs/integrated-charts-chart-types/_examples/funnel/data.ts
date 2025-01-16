export async function getData(delay: number = 100): Promise<any[]> {
    return new Promise((resolve) => setTimeout(() => resolve(generateData()), delay));
}

function generateData(): any[] {
    return [
        { group: 'Page Visit', count: 490 },
        { group: 'Enquiry', count: 340 },
        { group: 'Quote', count: 300 },
        { group: 'Sale', count: 290 },
    ];
}
