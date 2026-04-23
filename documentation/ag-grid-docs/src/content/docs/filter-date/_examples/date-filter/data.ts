export function getData(): any[] {
    const rows = [];

    for (let i = 10; i < 30; i++) {
        const m = getRandom(11);
        rows.push({
            startDate: `20${i}-${pad(m, 2)}-${pad(getRandom(28), 2)}`,
            endDate: `20${i}-${pad(m + 1, 2)}-${pad(getRandom(28), 2)}`,
            startDateTime: new Date(13e11 + getRandom(5e8) * 1e3),
            // ISO string format without milliseconds
            endDateTime: new Date(13e11 + getRandom(5e8) * 1e3).toISOString().slice(0, 19),
        });
    }

    return rows;
}

function getRandom(max: number) {
    return Math.ceil(Math.random() * max);
}

function pad(number: number, numDigits: number) {
    let value = String(number);
    while (value.length < numDigits) {
        value = `0${value}`;
    }
    return value;
}
