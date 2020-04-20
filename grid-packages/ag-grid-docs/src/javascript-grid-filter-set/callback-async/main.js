var gridOptions = {
    rowData: [
        { value: 'value 1' },
        { value: 'value 1' },
        { value: 'value 1' },
        { value: 'value 1' },
        { value: 'value 2' },
        { value: 'value 2' },
        { value: 'value 2' },
        { value: 'value 2' },
        { value: 'value 2' },
    ],
    columnDefs: [
        {
            headerName: 'Set filter column',
            field: 'value',
            width: 200,
            flex: 1,
            filter: 'agSetColumnFilter',
            filterParams: {
                values: function(params) {
                    setTimeout(function() {
                        params.success(['value 1', 'value 2']);
                    }, 3000);
                }
            }
        }
    ],
    defaultColDef: {
        filter: true,
        floatingFilter: true,
        resizable: true,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

});
