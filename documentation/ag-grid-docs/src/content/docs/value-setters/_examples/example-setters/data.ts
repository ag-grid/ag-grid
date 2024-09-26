export function getData(): any[] {
    const rowData = [];
    const firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
    const lastNames = ['Pink', 'Black', 'White', 'Brown', 'Smith', 'Smooth', 'Anderson'];

    for (let i = 0; i < 100; i++) {
        rowData.push({
            a: Math.floor(Math.random() * 100),
            b: Math.floor(Math.random() * 100),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length],
            c: {
                x: Math.floor(Math.random() * 100),
                y: Math.floor(Math.random() * 100),
            },
        });
    }

    return rowData;
}
