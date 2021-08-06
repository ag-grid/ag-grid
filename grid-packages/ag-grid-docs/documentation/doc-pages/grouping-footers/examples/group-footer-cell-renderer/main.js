var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        resizable: true,
    },
    groupIncludeFooter: true,
    groupIncludeTotalFooter: true,
    groupDefaultExpanded: true,
    autoGroupColumnDef: {
        minWidth: 250,
        cellRendererParams: {
            innerRenderer: p => {
                if (p.node.footer) {
                    if (p.node.level === -1) {
                        return `<div style="color:navy; font-weight:bold">Grand Total</div>`;
                    }
                    return `<div style="color:navy">Sub Total ${p.value}</div>`;
                }
                return p.value;
            }
        }
    },
    // optional as 'singleColumn' is the default group display type
    groupDisplayType: 'singleColumn',
    animateRows: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data.slice(0, 10));
        });
});
