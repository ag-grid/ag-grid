var columnDefs = [
    {headerName: 'Author', field: 'author', width: 90 },
    {headerName: 'Details', children: [
        {headerName: 'Title', field: 'title', minWidth: 470, flex: 1},
        {headerName: 'Link', field: 'link', flex: 1},
        {headerName: 'Date', field: 'date', width: 200}
    ]},
    {headerName: 'Foo', width: 100}
];

var gridOptions = {
    defaultColDef: {
        resizable: true
    },
    columnDefs: columnDefs
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/blogs.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
