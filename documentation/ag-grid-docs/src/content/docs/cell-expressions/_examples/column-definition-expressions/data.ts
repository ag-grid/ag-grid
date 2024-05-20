export function getData(): any[] {
    const rowData = [];

    const words = [
        'One',
        'Apple',
        'Moon',
        'Sugar',
        'Grid',
        'Banana',
        'Sunshine',
        'Stars',
        'Black',
        'White',
        'Salt',
        'Beach',
    ];
    const firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
    const lastNames = ['Pink', 'Black', 'White', 'Brown', 'Smith', 'Smooth', 'Anderson'];

    for (let i = 0; i < 100; i++) {
        const randomWords = words[i % words.length] + ' ' + words[(i * 17) % words.length];
        rowData.push({
            simple: randomWords,
            number: Math.floor(((i + 2) * 476321) % 10000),
            a: Math.floor(i % 4),
            b: Math.floor(i % 7),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length],
        });
    }

    return rowData;
}
