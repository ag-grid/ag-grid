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

    for (let i = 0; i < 100; i++) {
        rowData.push({
            simple: words[i % words.length],
            numberBad: Math.floor(((i + 2) * 173456) % 10000),
            numberGood: Math.floor(((i + 2) * 476321) % 10000),
        });
    }

    return rowData;
}
