const columnDefs = [
    { field: "athlete" },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    { field: "sport" },
    {
        headerName: 'Medals',
        children: [
            {
                colId: 'total',
                columnGroupShow: 'closed',
                valueGetter: "data.gold + data.silver + data.bronze"
            },
            { columnGroupShow: 'open', field: "gold" },
            { columnGroupShow: 'open', field: "silver" },
            { columnGroupShow: 'open', field: "bronze" }
        ]
    }
];
const defaultColDef = {
    filter: true,
    minWidth: 100
}

// this is the grid options for the top grid
let topApi;
const gridOptionsTop = {
    defaultColDef,
    columnDefs,
    rowData: null,
    alignedGrids: () => [bottomApi],
    autoSizeStrategy: {
        type: 'fitGridWidth'
    },
};

// this is the grid options for the bottom grid
let bottomApi;
const gridOptionsBottom = {
    defaultColDef,
    columnDefs,
    rowData: null,
    alignedGrids: () => [topApi],
    autoSizeStrategy: {
        type: 'fitGridWidth'
    },
};

function onCbAthlete(value) {
    // we only need to update one grid, as the other is a slave
    topApi.setColumnsVisible(['athlete'], value);
}

function onCbAge(value) {
    // we only need to update one grid, as the other is a slave
    topApi.setColumnsVisible(['age'], value);
}

function onCbCountry(value) {
    // we only need to update one grid, as the other is a slave
    topApi.setColumnsVisible(['country'], value);
}

function setData(rowData) {
    topApi.setGridOption('rowData', rowData);
    bottomApi.setGridOption('rowData', rowData);
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
