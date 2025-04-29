export function getData(): any[] {
    const rows = [];

    for (let i = 0; i < 1000; i++) {
        rows.push({
            price: parseFloat(getRandomNumber(-500, 1000).toFixed(2)),
            quantity: Number(getRandomNumber(0, 1000).toFixed(0)),
        });
    }

    return rows;
}

function getRandomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
