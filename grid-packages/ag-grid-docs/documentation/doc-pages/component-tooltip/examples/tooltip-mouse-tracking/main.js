const columnDefs = [
    {field: "athlete", minWidth: 150, tooltipField: 'athlete', tooltipComponentParams: {type: 'success'}},
    {field: "age"},
    {field: "country", minWidth: 130, tooltipField: "country"},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

const gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
        tooltipComponent: 'customTooltip'
    },

    tooltipShowDelay: 1000,
    tooltipMouseTrack: true,

    // set rowData to null or undefined to show loading panel by default
    rowData: null,
    columnDefs: columnDefs,

    components: {
        customTooltip: CustomTooltip,
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json').then(response => response.json())
        .then(data => {
            gridOptions.api.setRowData(data);
        });
});
