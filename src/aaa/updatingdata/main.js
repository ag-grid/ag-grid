var columnDefs = [
    {headerName: "Category", field: "category", rowGroupIndex: 1, hide: true},
    {headerName: "Price", field: "price", aggFunc: 'sum', valueFormatter: poundFormatter},
    {headerName: "Zombies", field: "zombies"}
];

var rowData = [
    {keys: ['Sold'], group: true, zombies: "** Fred & Sam & Mike **"},
    {keys: ['Sold', 'Mondeo'], group: true, zombies: "** Fred & Sam **"},
    {keys: ['Sold', 'Mondeo'], price: 32000, zombies: "Fred"},
    {keys: ['Sold', 'Mondeo'], price: 43000, zombies: "Sam"},
    {keys: ['Sold', 'Boxter'], group: true, zombies: "** Mike **"},
    {keys: ['Sold', 'Boxter'], price: 56000, zombies: "Mike"}
];

var names = ['Elly','Shane','Niall','Rob','John','Sean','Dicky','Willy','Shaggy','Spud','Sugar','Spice'];
var models = ['Mondeo','Celica','Boxter','Minty','Snacky','FastCar','Biscuit','Whoooper','Scoooper','Jet Blaster'];
var categories = ['Sold','For Sale','In Workshop'];

function createNewRowData(category) {
    var model = models[Math.floor(Math.random() * models.length)];
    return {
        keys: [category, model],
        price: Math.floor(Math.random() * 800000) + 20000,
        zombies: names[Math.floor(Math.random() * names.length)]
    };
}

var gridOptions = {
    columnDefs: columnDefs,
    groupDefaultExpanded: -1,
    rowData: rowData,
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
                case 'In Workshop': return 'category-in-workshop';
                case 'Sold': return 'category-sold';
                case 'For Sale': return 'category-for-sale';
                default: return null;
            }
        } else {
            // no extra classes for leaf rows
            return null;
        }
    },
    autoGroupColumnDef: {
        headerName: "Group",
        field: "price",
        rowGroupIndex: 0,
        cellRenderer: 'group',
        cellRendererParams: {checkbox: true}
    },
    getGroupKeys: function(data) {
        return data.keys;
    },
    isGroup: function(data) {
        return data.group === true;
    },
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

function onAddRow(category) {
    var rowDataItem = createNewRowData(category);
    gridOptions.api.updateRowData({add: [rowDataItem]});
}

function onMoveToGroup(category) {
    var selectedRowData = gridOptions.api.getSelectedRows();
    selectedRowData.forEach( function(dataItem) {
        dataItem.category = category;
    });
    gridOptions.api.updateRowData({update: selectedRowData});
}

function onRemoveSelected() {
    var selectedRowData = gridOptions.api.getSelectedRows();
    gridOptions.api.updateRowData({remove: selectedRowData});
}

function poundFormatter(params) {
    return '£' + Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});