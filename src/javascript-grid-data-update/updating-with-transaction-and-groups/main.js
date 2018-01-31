var columnDefs = [
    {field: 'category', rowGroupIndex: 1, hide: true},
    {field: 'price', aggFunc: 'sum', valueFormatter: poundFormatter},
    {field: 'zombies'},
    {field: 'style'},
    {field: 'clothes'},
    {field: 'created'}
];

function poundFormatter(params) {
    return (
        '£' +
        Math.floor(params.value)
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
}

function getInitialRowData() {
    var rowData = [];

    for (var i = 0; i < 12; i++) {
        var category = categories[i % categories.length];
        rowData.push(createNewRowData(category));
    }
    return rowData;
}

// make the data three 10 times bigger
var names = ['Elly', 'Shane', 'Niall', 'Rob', 'John', 'Sean', 'Dicky', 'Willy', 'Shaggy', 'Spud', 'Sugar', 'Spice'];
var models = ['Mondeo', 'Celica', 'Boxter', 'Minty', 'Snacky', 'FastCar', 'Biscuit', 'Whoooper', 'Scoooper', 'Jet Blaster'];
var categories = ['Sold', 'For Sale', 'In Workshop'];

function createNewRowData(category) {
    var newData = {
        // use make if provided, otherwise select random make
        category: category,
        model: models[Math.floor(Math.random() * models.length)],
        price: Math.floor(Math.random() * 800000) + 20000,
        zombies: names[Math.floor(Math.random() * names.length)],
        style: 'Smooth',
        clothes: 'Jeans',
        created: new Date().getTime()
    };
    return newData;
}

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 100
    },
    groupDefaultExpanded: 1,
    rowData: getInitialRowData(),
    rememberGroupStateWhenNewData: true,
    enableSorting: true,
    suppressRowClickSelection: true,
    rowSelection: 'multiple',
    animateRows: true,
    groupSelectsChildren: true,
    // this allows the different colors per group, by assigning a different
    // css class to each group level based on the key
    getRowClass: function(params) {
        var rowNode = params.node;
        if (rowNode.group) {
            switch (rowNode.key) {
                case 'In Workshop':
                    return 'category-in-workshop';
                case 'Sold':
                    return 'category-sold';
                case 'For Sale':
                    return 'category-for-sale';
                default:
                    return null;
            }
        } else {
            // no extra classes for leaf rows
            return null;
        }
    },
    autoGroupColumnDef: {
        headerName: 'Group',
        field: 'model',
        rowGroupIndex: 1,
        cellRenderer:'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true
        }
    },
    onGridReady: function(params) {
       params.api.sizeColumnsToFit();
    }
};

function getRowData() {
    var rowData = [];
    gridOptions.api.forEachNode(function(node) {
        rowData.push(node.data);
    });
    console.log('Row Data:');
    console.log(rowData);
}

function onAddRow(category) {
    var rowDataItem = createNewRowData(category);
    gridOptions.api.updateRowData({add: [rowDataItem]});
}

function onMoveToGroup(category) {
    var selectedRowData = gridOptions.api.getSelectedRows();
    selectedRowData.forEach(function(dataItem) {
        dataItem.category = category;
    });
    gridOptions.api.updateRowData({update: selectedRowData});
}

function onRemoveSelected() {
    var selectedRowData = gridOptions.api.getSelectedRows();
    gridOptions.api.updateRowData({remove: selectedRowData});
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
