export function getData(): any[] {
    const rowData = [];

    for (let i = 0; i < 10; i++) {
        rowData.push({
            id: i,
            numberGood: Math.floor(((i + 2) * 476321) % 10000),
            q1: Math.floor(((i + 2) * 173456) % 10000),
            q2: Math.floor(((i + 200) * 173456) % 10000),
            q3: Math.floor(((i + 20000) * 173456) % 10000),
            q4: Math.floor(((i + 2000000) * 173456) % 10000),
            year: i % 2 == 0 ? '2015' : '2016',
        });
    }

    return rowData;
}
