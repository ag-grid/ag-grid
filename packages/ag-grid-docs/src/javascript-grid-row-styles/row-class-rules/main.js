var rowData = [
    {employee: "Josh Finch",    sickDays: 4},
    {employee: "Flavia Mccloskey",  sickDays: 1},
    {employee: "Marine Creason", sickDays: 8},
    {employee: "Carey Livingstone",     sickDays: 2},
    {employee: "Brande Giorgi",   sickDays: 5},
    {employee: "Beatrice Kugler",   sickDays: 3},
    {employee: "Elvia Macko",   sickDays: 7},
    {employee: "Santiago Little",   sickDays: 1},
    {employee: "Mary Clifton",   sickDays: 2},
    {employee: "Norris Iniguez",   sickDays: 1},
    {employee: "Shellie Umland",   sickDays: 5},
    {employee: "Kristi Nawrocki",   sickDays: 2},
    {employee: "Elliot Malo",   sickDays: 3},
    {employee: "Paul Switzer",   sickDays: 11},
    {employee: "Lilly Boaz",   sickDays: 6},
    {employee: "Frank Kimura",   sickDays: 1},
    {employee: "Alena Wages",   sickDays: 5}
];

var columnDefs = [
    {headerName: "Employee", field: "employee"},
    {headerName: "Number Sick Days", field: "sickDays", editable: true}
];

var gridOptions = {
    rowData: rowData,
    columnDefs: columnDefs,
    rowClassRules: {
        // row style function
        'sick-days-warning': function(params) {
            var numSickDays = params.data.sickDays;
            return  numSickDays > 5 && numSickDays <= 7;
        },
        // row style expression
        'sick-days-breach': 'data.sickDays > 8'
    }
};

function setDataValue() {
    gridOptions.api.forEachNode( function(rowNode) {
        rowNode.setDataValue('sickDays', randomInt());
    });
}

function setData() {
    gridOptions.api.forEachNode( function(rowNode) {
        var newData = {
            employee: rowNode.data.employee,
            sickDays:  randomInt()
        };
        rowNode.setData(newData);
    });
}

function updateRowData() {
    var itemsToUpdate = [];
    gridOptions.api.forEachNode( function(rowNode) {
        var data = rowNode.data;
        data.sickDays = randomInt();
        itemsToUpdate.push(data);
    });
    gridOptions.api.updateRowData({update: itemsToUpdate});
}

function randomInt() {
    return Math.floor(Math.random()*10);
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});