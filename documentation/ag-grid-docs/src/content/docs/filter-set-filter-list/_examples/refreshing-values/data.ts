const animals = ['Monkey', 'Lion', 'Elephant', 'Tiger', 'Giraffe', 'Antelope'];

export function getData(): any[] {
    const rows = [];

    for (let i = 0; i < 2000; i++) {
        const index = Math.floor(Math.random() * animals.length);
        rows.push({ animal: animals[index] });
    }

    return rows;
}
