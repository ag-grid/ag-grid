var columnDefs = [
    {headerName: "Make", field: "make", rowGroupIndex: 1, hide: true},
    {headerName: "Price", field: "price"},
    {headerName: "Zombies", field: "zombies"},
    {headerName: "Style", field: "style"},
    {headerName: "Clothes", field: "clothes"}
];

var rowData = [];

// make the data three 10 times bigger
var names = ['Elly','Shane','Niall','Rob','John','Sean','Dicky','Willy','Shaggy','Spud','Sugar','Spice'];
var models = ['Mondeo','Celica','Boxter','Minty','Snacky','FastCar','Biscuit','Whoooper','Scoooper','Jet Blaster'];
var makes = ['Toyota','Ford','SuperCar'];

function createNewRowData(make) {
    var newData = {
        // use make if provided, otherwise select random make
        make: make ? make : makes[Math.floor(Math.random() * makes.length)],
        model: models[Math.floor(Math.random() * models.length)],
        price: Math.floor(Math.random() * 800000) + 20000,
        zombies: names[Math.floor(Math.random() * names.length)],
        style: 'Smooth',
        clothes: 'Jeans'
    };
    return newData;
}

for (var i = 0; i<15; i++) {
    rowData.push(createNewRowData());
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    rememberGroupStateWhenNewData: true,
    enableSorting: true,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    groupColumnDef: {headerName: "Group", field: "model", rowGroupIndex: 1, cellRenderer: 'group',
        cellRendererParams: {
            checkbox: true
        }},
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

function getRowData() {
    var rowData = [];
    gridOptions.api.forEachNode( function(node) {
        rowData.push(node.data);
    });
    console.log('Row Data:');
    console.log(rowData);
}

function onAddRow(make) {
    var newItem = createNewRowData(make);
    gridOptions.api.addItems([newItem]);
}

function onInsertRowAtZero(make) {
    var newItem = createNewRowData(make);
    gridOptions.api.insertItemsAtIndex(0, [newItem]);
}

function onRemoveSelected() {
    var selectedNodes = gridOptions.api.getSelectedNodes();
    gridOptions.api.removeItems(selectedNodes);
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
