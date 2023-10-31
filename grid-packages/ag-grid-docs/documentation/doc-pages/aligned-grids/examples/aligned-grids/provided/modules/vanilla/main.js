const columnDefs = [
    { field: "athlete" },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    { field: "date" },
    { field: "sport" },
    // in the total col, we have a value getter, which usually means we don't need to provide a field
    // however the master/slave depends on the column id (which is derived from the field if provided) in
    // order to match up the columns
    {
        headerName: 'Medals',
        children: [
            {
                columnGroupShow: 'closed', field: "total",
                valueGetter: "data.gold + data.silver + data.bronze"
            },
            { columnGroupShow: 'open', field: "gold" },
            { columnGroupShow: 'open', field: "silver" },
            { columnGroupShow: 'open', field: "bronze" }
        ]
    }
];

// this is the grid options for the top grid
let topApi;
const gridOptionsTop = {
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    },
    columnDefs: columnDefs,
    rowData: null,
    alignedGrids: () => [bottomApi],
    autoSizeStrategy: {
        type: 'fitGridWidth'
    },
};

// this is the grid options for the bottom grid
let bottomApi;
const gridOptionsBottom = {
    defaultColDef: {
        editable: true,
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1,
        minWidth: 100
    },
    columnDefs: columnDefs,
    rowData: null,
    alignedGrids: () => [topApi]
};

function onCbAthlete(value) {
    // we only need to update one grid, as the other is a slave
    topApi.setColumnVisible('athlete', value);
}

function onCbAge(value) {
    // we only need to update one grid, as the other is a slave
    topApi.setColumnVisible('age', value);
}

function onCbCountry(value) {
    // we only need to update one grid, as the other is a slave
    topApi.setColumnVisible('country', value);
}

function setData(rowData) {
    topApi.updateGridOption('rowData', rowData);
    bottomApi.updateGridOption('rowData', rowData);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDivTop = document.querySelector('#myGridTop');
    topApi = agGrid.createGrid(gridDivTop, gridOptionsTop);

    const gridDivBottom = document.querySelector('#myGridBottom');
    bottomApi = agGrid.createGrid(gridDivBottom, gridOptionsBottom);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => setData(data));
});
