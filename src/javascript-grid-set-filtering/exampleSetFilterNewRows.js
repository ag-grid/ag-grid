var fruitValues = ['Apple','Banana','Orange','Pear'];
var animalValues = ['Elephant','Monkey','Lion','Zebra','Mouse'];
var colorValues = ['Blue','Black','Green','Orange','Red','Purple','Pink','Yellow'];
var locationValues = ['North','South','East','West'];

var columnDefs = [
    {headerName: "Fruit - Normal", field: "fruit", width: 150, filter: 'set',
        filterParams: {} // all default values
    },
    {headerName: "Animal - Keep", field: "animal", width: 150, filter: 'set',
        filterParams: {
            newRowsAction: 'keep'
        }
    },
    {headerName: "Color - Values", field: "color", width: 150, filter: 'set',
        filterParams: {
            values: colorValues
        }
    },
    {headerName: "Location - Values + Keep", field: "location", width: 250, filter: 'set',
        filterParams: {
            values: locationValues,
            newRowsAction: 'keep'
        }
    },
    {headerName: "Value", field: "value", width: 150, filter: 'number'}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableColResize: true
};

function setNewData() {
    // randomly build a new list with items from the mail list
    var newData = [];
    for (var i = 0; i<1000; i++) {
        var randomFruit = fruitValues[Math.floor(Math.random()*fruitValues.length)];
        var randomAnimal = animalValues[Math.floor(Math.random()*animalValues.length)];
        var randomColor = colorValues[Math.floor(Math.random()*colorValues.length)];
        var randomLocation= locationValues[Math.floor(Math.random()*locationValues.length)];
        var randomValue = Math.floor(Math.random()*1000);
        newData.push({
            fruit: randomFruit,
            color: randomColor,
            animal: randomAnimal,
            location: randomLocation,
            value: randomValue
        });
    }

    gridOptions.api.setRowData(newData);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    setNewData();
});
