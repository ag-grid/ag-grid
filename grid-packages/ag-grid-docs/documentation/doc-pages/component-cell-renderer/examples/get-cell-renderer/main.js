const columnDefs = [
    {field: 'athlete', width: 150},
    {field: 'country', width: 150},
    {field: 'year', width: 100},
    {field: 'gold', width: 100, cellRenderer: 'medalCellRenderer'},
    {field: 'silver', width: 100, cellRenderer: 'medalCellRenderer'},
    {field: 'bronze', width: 100, cellRenderer: 'medalCellRenderer'},
    {field: 'total', width: 100}
];

const gridOptions = {
    columnDefs: columnDefs,
    components: {
        'medalCellRenderer': MedalCellRenderer
    },
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    }
};

function onCallGold() {
    console.log('=========> calling all gold');
    // pass in list of columns, here it's gold only
    const params = {columns: ['gold']};
    const instances = gridOptions.api.getCellRendererInstances(params);
    instances.forEach(instance => {
        if (instance.getFrameworkComponentInstance) {
            instance.getFrameworkComponentInstance().medalUserFunction();
        } else {
            instance.medalUserFunction();
        }
    });
}

function onFirstRowGold() {
    console.log('=========> calling gold row one');
    // pass in one column and one row to identify one cell
    const firstRowNode = gridOptions.api.getDisplayedRowAtIndex(0);
    const params = {columns: ['gold'], rowNodes: [firstRowNode]};

    const instances = gridOptions.api.getCellRendererInstances(params);
    instances.forEach(instance => {
        if (instance.getFrameworkComponentInstance) {
            instance.getFrameworkComponentInstance().medalUserFunction();
        } else {
            instance.medalUserFunction();
        }
    });
}

function onCallAllCells() {
    console.log('=========> calling everything');
    // no params, goes through all rows and columns where cell renderer exists
    const instances = gridOptions.api.getCellRendererInstances();
    instances.forEach(instance => {
        if (instance.getFrameworkComponentInstance) {
            instance.getFrameworkComponentInstance().medalUserFunction();
        } else {
            instance.medalUserFunction();
        }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            gridOptionsTop.api.setRowData(data);
        });
});
