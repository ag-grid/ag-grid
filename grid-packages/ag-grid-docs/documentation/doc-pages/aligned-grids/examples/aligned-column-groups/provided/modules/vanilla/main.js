const columnDefs = [
    {
        headerName: 'Group 1',
        groupId: 'Group1',
        children: [
            { field: 'athlete', pinned: true, },
            { field: 'age', pinned: true, columnGroupShow: 'open', },
            { field: 'country', },
            { field: 'year', columnGroupShow: 'open', },
            { field: 'date', },
            { field: 'sport', columnGroupShow: 'open', },
        ]
    },
    {
        headerName: 'Group 2',
        groupId: 'Group2',
        children: [
            { field: 'athlete', pinned: true, },
            { field: 'age', pinned: true, columnGroupShow: 'open', },
            { field: 'country', },
            { field: 'year', columnGroupShow: 'open', },
            { field: 'date', },
            { field: 'sport', columnGroupShow: 'open', },
        ]
    }
];

// this is the grid options for the top grid
let topApi;
let bottomApi;
const gridOptionsTop = {
    defaultColDef: {
        filter: true,
        flex: 1,
        minWidth: 120
    },
    columnDefs: columnDefs,
    rowData: null,
    alignedGrids: () => [bottomApi],
    autoSizeStrategy: {
        type: 'fitGridWidth'
    },
};

// this is the grid options for the bottom grid
const gridOptionsBottom = {
    defaultColDef: {
        filter: true,
        flex: 1,
        minWidth: 120
    },
    columnDefs: columnDefs,
    rowData: null,
    alignedGrids: () => [topApi],
};

function setData(rowData) {
    topApi.setGridOption('rowData', rowData);
    bottomApi.setGridOption('rowData', rowData);

    // mix up some columns
    topApi.moveColumnByIndex(11, 4);
    topApi.moveColumnByIndex(11, 4);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDivTop = document.querySelector('#myGridTop');
    topApi = agGrid.createGrid(gridDivTop, gridOptionsTop);

    const gridDivBottom = document.querySelector('#myGridBottom');
    bottomApi = agGrid.createGrid(gridDivBottom, gridOptionsBottom);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => {
            setData(data);
        });
});
