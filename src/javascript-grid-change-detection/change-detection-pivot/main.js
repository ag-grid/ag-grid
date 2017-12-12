var columnDefs = [
    {headerName: 'Student ID', field: 'student'},
    {headerName: 'Year Group', field: 'yearGroup', rowGroup: true},
    {headerName: 'Age', field: 'age'},
    {headerName: 'Course', field: 'course', pivot: true},
    {headerName: 'Age Range', field: 'ageRange', valueGetter: ageRangeValueGetter, pivot: true},
    {headerName: 'Points', field: 'points', aggFunc: 'sum'}
];

function ageRangeValueGetter(params) {
    var age = params.getValue('age');
    if (age === undefined) {
        return null;
    }
    if (age < 20) {
        return '< 20';
    } else if (age > 30) {
        return '> 30';
    } else {
        return '20 to 30';
    }
}

var studentIdSequence = 10023;

// pretty basic, but deterministic (so same numbers each time we run), random number generator
var seed;
function random() {
    seed = ((seed || 1) * 16807) % 2147483647;
    return seed;
}

function getRowData() {
    var rowData = [];
    for (var i = 1; i <= 100; i++) {
        var row = createRow();
        rowData.push(row);
    }
    return rowData;
}

function createRow() {
    var randomNumber = random();
    var result = {
        student: studentIdSequence++,
        points: randomNumber % 60 + 40,
        course: ['Science', 'History'][randomNumber % 3 === 0 ? 0 : 1],
        yearGroup: 'Year ' + (randomNumber % 4 + 1), // 'Year 1' to 'Year 4'
        age: randomNumber % 25 + 15 // 15 to 40
    };
    return result;
}

function pivotMode() {
    var checked = document.getElementById('pivot-mode').checked;

    if (checked) {
        gridOptions.columnApi.setPivotMode(true);
        gridOptions.columnApi.setRowGroupColumns(['yearGroup']);
        gridOptions.columnApi.setPivotColumns(['course', 'ageRange']);
    } else {
        gridOptions.columnApi.setPivotMode(false);
        gridOptions.columnApi.setRowGroupColumns([]);
        gridOptions.columnApi.setPivotColumns([]);
    }
}

function updateOneRecord() {
    var rowNodeToUpdate = pickExistingRowNodeAtRandom(gridOptions.api);
    var randomValue = createNewRandomScore(rowNodeToUpdate.data);
    console.log('updating points to ' + randomValue + ' on ', rowNodeToUpdate.data);
    rowNodeToUpdate.setDataValue('points', randomValue);
}

function createNewRandomScore(data) {
    var randomValue = createRandomNumber();
    // make sure random number is not actually the same number again
    while (randomValue === data.points) {
        randomValue = createRandomNumber();
    }
    return randomValue;
}

function createRandomNumber() {
    return Math.floor(Math.random() * 100);
}

function pickExistingRowNodeAtRandom(gridApi) {
    var allItems = [];
    gridApi.forEachLeafNode(function(rowNode) {
        allItems.push(rowNode);
    });

    if (allItems.length === 0) {
        return;
    }
    var result = allItems[Math.floor(Math.random() * allItems.length)];

    return result;
}

function pickExistingRowItemAtRandom(gridApi) {
    var rowNode = pickExistingRowNodeAtRandom(gridApi);
    return rowNode ? rowNode.data : null;
}

function updateUsingTransaction() {
    var itemToUpdate = pickExistingRowItemAtRandom(gridOptions.api);
    if (!itemToUpdate) {
        return;
    }

    console.log('updating - before', itemToUpdate);
    itemToUpdate.points = createRandomNumber(itemToUpdate);
    var transaction = {
        update: [itemToUpdate]
    };
    console.log('updating - after', itemToUpdate);
    gridOptions.api.updateRowData(transaction);
}

function addNewGroupUsingTransaction() {
    var item1 = createRow();
    var item2 = createRow();
    item1.yearGroup = 'Year 5';
    item2.yearGroup = 'Year 5';
    var transaction = {
        add: [item1, item2]
    };
    console.log('add - ', item1);
    console.log('add - ', item2);
    gridOptions.api.updateRowData(transaction);
}

function addNewCourse() {
    var item1 = createRow();
    item1.course = 'Physics';
    var transaction = {
        add: [item1]
    };
    console.log('add - ', item1);
    gridOptions.api.updateRowData(transaction);
}

function removePhysics() {
    var allPhysics = [];
    gridOptions.api.forEachLeafNode(function(rowNode) {
        if (rowNode.data.course === 'Physics') {
            allPhysics.push(rowNode.data);
        }
    });
    var transaction = {
        remove: allPhysics
    };
    console.log('removing ' + allPhysics.length + ' physics items.');
    gridOptions.api.updateRowData(transaction);
}

function moveCourse() {
    var item = pickExistingRowItemAtRandom(gridOptions.api);
    if (!item) {
        return;
    }
    item.course = item.course === 'History' ? 'Science' : 'History';
    var transaction = {
        update: [item]
    };
    console.log('moving ' + item);
    gridOptions.api.updateRowData(transaction);
}

var gridOptions = {
    defaultColDef: {
        cellRenderer:'agAnimateShowChangeCellRenderer',
        width: 120
    },
    columnDefs: columnDefs,
    rowData: getRowData(),
    pivotMode: true,
    groupDefaultExpanded: 1,
    // enableCellChangeFlash: true,
    animateRows: true,
    enableColResize: true,
    enableSorting: true,
    getRowNodeId: function(data) {
        return data.student;
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
