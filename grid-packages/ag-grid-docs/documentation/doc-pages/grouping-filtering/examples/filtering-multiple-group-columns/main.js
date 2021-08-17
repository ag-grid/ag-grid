var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        floatingFilter: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        // supplies filter values to the column filters based on the colId
        filterValueGetter: params => {
            const colId = params.column.colId;
            if (colId.includes('country')) {
                return params.data.country;
            }
            if (colId.includes('year') > -1) {
                return params.data.year;
            }
        },
    },
    groupDisplayType: 'multipleColumns',
    animateRows: true,
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
