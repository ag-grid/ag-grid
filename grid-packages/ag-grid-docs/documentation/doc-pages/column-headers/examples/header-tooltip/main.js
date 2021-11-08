const columnDefs = [
    {field: 'athlete'},
    {field: 'age'},
    {field: 'country', headerTooltip: 'The country the athlete represented'},
    {field: 'year', headerTooltip: 'The year of the Olympics'},
    {field: 'date', headerTooltip: 'The date of the Olympics'},
    {field: 'sport', headerTooltip: 'The sport the medal was for'},
    {field: 'gold', headerTooltip: 'How many gold medals'},
    {field: 'silver', headerTooltip: 'How many silver medals'},
    {field: 'bronze', headerTooltip: 'How many bronze medals'},
    {field: 'total', headerTooltip: 'The total number of medals'}
];

const gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 150
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
