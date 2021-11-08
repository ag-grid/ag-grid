const columnDefs = [
    {
        headerName: 'Everything Resizes',
        children: [
            {headerName: 'Athlete', field: 'athlete', headerClass: 'resizable-header'},
            {headerName: 'Age', field: 'age', headerClass: 'resizable-header'},
            {headerName: 'Country', field: 'country', headerClass: 'resizable-header'}
        ]
    },
    {
        headerName: 'Only Year Resizes',
        children: [
            {headerName: 'Year', field: 'year', headerClass: 'resizable-header'},
            {headerName: 'Date', field: 'date', resizable: false, headerClass: 'fixed-size-header'},
            {headerName: 'Sport', field: 'sport', resizable: false, headerClass: 'fixed-size-header'}
        ]
    },
    {
        headerName: 'Nothing Resizes',
        children: [
            {headerName: 'Gold', field: 'gold', resizable: false, headerClass: 'fixed-size-header'},
            {headerName: 'Silver', field: 'silver', resizable: false, headerClass: 'fixed-size-header'},
            {headerName: 'Bronze', field: 'bronze', resizable: false, headerClass: 'fixed-size-header'},
            {headerName: 'Total', field: 'total', resizable: false, headerClass: 'fixed-size-header'}
        ]
    }
];

const gridOptions = {
    defaultColDef: {
        width: 150,
        resizable: true
    },
    columnDefs: columnDefs
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
