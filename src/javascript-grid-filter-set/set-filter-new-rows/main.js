var fruitValues = ['Apple','Banana','Orange','Pear'];
var animalValues = ['Elephant','Monkey','Lion','Zebra','Mouse', ''];
var colorValues = ['Blue','Purple','Black','Green','Orange','Red','Pink','Yellow'];
var locationValues = ['North','South','East','West'];

function randomData() {
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

    return newData;
}
var columnDefs = [
    {headerName: "Fruit - Normal", field: "fruit", width: 150, filter: 'agSetColumnFilter',
        filterParams: {} // all default values
    },
    {headerName: "Animal - Keep", field: "animal", width: 150, filter: 'agSetColumnFilter',
        filterParams: {
            newRowsAction: 'keep'
        }
    },
    {headerName: "Color - Values (Sorted)", field: "color", width: 250, filter: 'agSetColumnFilter',
        filterParams: {
            values: colorValues
        }
    },
    {headerName: "Color - Values (As provided)", field: "color", width: 250, filter: 'agSetColumnFilter',
        filterParams: {
            values: colorValues,
            suppressSorting: true
        }
    },
    {headerName: "Location - Values + Keep", field: "location", width: 250, filter: 'agSetColumnFilter',
        filterParams: {
            values: locationValues,
            newRowsAction: 'keep'
        }
    },
    {headerName: "Value", field: "value", width: 150, filter: 'agNumberColumnFilter'}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: randomData(),
    enableFilter: true,
    enableColResize: true
};

function setNewData() {
    gridOptions.api.setRowData(randomData());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
