var columnDefs = [
    {
        headerName: 'Set filter col', field: 'value', width: 150, filter: 'agSetColumnFilter', filterParams: {
            values: function (params) {
                setTimeout( function() {
                    params.success(['value 1', 'value 2'])
                }, 5000);
            }
        }
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: [
        {value:'value 1'},
        {value:'value 1'},
        {value:'value 1'},
        {value:'value 1'},
        {value:'value 2'},
        {value:'value 2'},
        {value:'value 2'},
        {value:'value 2'},
        {value:'value 2'}
    ],
    enableFilter: true,
    floatingFilter: true
};


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

});
