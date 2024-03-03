var animals = ['Monkey', 'Lion', 'Elephant', 'Tiger', 'Giraffe', 'Antelope'];

export function getData(): any[] {
    var rows = [];

    for (var i = 0; i < 2000; i++) {
        var index = Math.floor(Math.random() * animals.length);
        rows.push({ animal: animals[index] });
    }

    return rows;
}