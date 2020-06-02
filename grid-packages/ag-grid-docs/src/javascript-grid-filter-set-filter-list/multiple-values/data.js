var allAnimals = ['Monkey', 'Lion', 'Elephant', 'Tiger', 'Giraffe', 'Antelope'];

function getRowData() {
    var rows = [];

    for (var i = 0; i < 2000; i++) {
        var animals = [];

        for (var j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
            var index = Math.floor(Math.random() * allAnimals.length);
            var animal = allAnimals[index];

            if (animals.indexOf(animal) < 0) {
                animals.push(animal);
            }
        }

        rows.push({
            animalsArray: animals,
            animalsString: animals.join('|'),
            animalsObjects: animals.map(function(animal) { return { name: animal }; })
        });
    }

    return rows;
}