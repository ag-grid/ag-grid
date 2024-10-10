export function getData(): any[] {
    const animals = ['Monkey', 'Lion', 'Elephant', 'Tiger', 'Giraffe', 'Antelope', 'Otter', 'Penguin', null];
    const rows = [];

    for (let i = 0; i < 2000; i++) {
        const index = Math.floor(Math.random() * animals.length);
        rows.push({ animal: animals[index] });
    }

    return rows;
}
