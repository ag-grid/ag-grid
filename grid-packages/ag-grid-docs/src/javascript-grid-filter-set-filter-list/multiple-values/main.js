var valueGetter = function(params) {
    return params.data['animalsString'].split('|');
}

var valueFormatter = function(params) {
    return params.value.map(function(animal) { return animal.name; }).join(', ');
}

var keyCreator = function(params) {
    return params.value.map(function(animal) { return animal.name; });
}

var gridOptions = {
    columnDefs: [
        {
            headerName: 'Animals (array)',
            field: 'animalsArray',
            filter: 'agSetColumnFilter',
        },
        {
            headerName: 'Animals (string)',
            filter: 'agSetColumnFilter',
            valueGetter: valueGetter
        },
        {
            headerName: 'Animals (objects)',
            field: 'animalsObjects',
            filter: 'agSetColumnFilter',
            valueFormatter: valueFormatter,
            keyCreator: keyCreator
        }
    ],
    defaultColDef: {
        flex: 1,
    },
    rowData: getRowData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
