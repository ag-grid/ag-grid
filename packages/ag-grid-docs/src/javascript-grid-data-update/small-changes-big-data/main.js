var columnDefs = [
    { field: 'dataGroup', enableRowGroup: true, rowGroup: true, hide: true, },
    { field: "id", headerName: "ID" },
    { field: "name" },
    { field: 'value' }
];

function isFirstColumn(params) {
    let displayedColumns = params.columnApi.getAllDisplayedColumns();
    let thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
}

var defaultColDef = {
    filter: true,
    sortable: true,
    resizable: true
};

function getRowNodeId(data) {
    return data.id;
}

function onBtDelete() {

    var start = new Date().getTime();

    // var selectedData = data[5];
    var selectedData = gridOptions.api.getDisplayedRowAtIndex(1).childrenAfterGroup[0].data;
    // var selectedData = gridOptions.api.getSelectedNodes()[0].data;
    data = data.filter( function(item) {
        return selectedData!==item;
    });

    gridOptions.api.setRowData(data);

    var end = new Date().getTime();

    console.log('done ' + (end - start) + 'ms');

    // let start = Date.now();
    // let { data, selected } = this.state;
    //
    // if (selected.length > 0) {
    //     let newData = data.filter(item => {
    //         return !selected.includes(item.id);
    //     });
    //
    //     this.setState({
    //         data: newData,
    //     });
    // }
}

var rowData = [
    {id: 'aa', make: "Toyota", model: "Celica", price: 35000},
    {id: 'bb', make: "Ford", model: "Mondeo", price: 32000},
    {id: 'cc', make: "Porsche", model: "Boxter", price: 72000},
    {id: 'dd', make: "BMW", model: "5 Series", price: 59000},
    {id: 'ee', make: "Dodge", model: "Challanger", price: 35000},
    {id: 'ff', make: "Mazda", model: "MX5", price: 28000},
    {id: 'gg', make: "Horse", model: "Outside", price: 99000}
];

var gridOptions = {
    getRowNodeId: getRowNodeId,
    deltaRowDataMode: true,
    defaultColDef: defaultColDef,
    columnDefs: columnDefs,
    animateRows: true,
    suppressMaintainUnsortedOrder: true
};

var data = [];

function createData() {
    let nextGroup = 0;
    for (let i = 0; i < 10000; i++) {
        if (i % 2 === 0) {
            nextGroup++;
        }
        data.push({
            id: i,
            name: `Thing ${i}`,
            dataGroup: `group-${nextGroup}`,
            value: Math.random(5000)
        });
    }
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    createData();

    setTimeout( function() {
        gridOptions.api.setRowData(data);
    }, 100);
});
