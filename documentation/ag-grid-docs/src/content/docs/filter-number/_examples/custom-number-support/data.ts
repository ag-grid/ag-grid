export function getData(): any[] {
    const rows = [];

    for (let i = 0; i < 1000; i++) {
        rows.push({ sale: parseFloat(getRandomNumber(-500, 1000).toFixed(2)) });
    }

    return rows;
}

function getRandomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
