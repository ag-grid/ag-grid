let rowIdSequence = 100;

export function getData(): any[] {
    const data: any[] = [];
    ['Red', 'Green', 'Blue', 'Red', 'Green', 'Blue', 'Red', 'Green', 'Blue'].forEach(function (color) {
        const newDataItem = {
            id: rowIdSequence++,
            color: color,
            value1: Math.floor(Math.random() * 100),
            value2: Math.floor(Math.random() * 100),
        };
        data.push(newDataItem);
    });
    return data;
}
