var gridOptions = {
    columnDefs: [
        { field: "country", pivot: true, enablePivot: true },
        { field: "year" },
        { field: "date" },
        { field: "sport" },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
        resizable: true
    },
    pivotMode: true,
    sideBar: true,
};

function setTitle(title) {
    document.querySelector('#title').innerText = title;
}

function clearFilter() {
    gridOptions.api.setFilterModel(null);
    setTitle('All Medals by Country');
}

function filterUKAndIrelandBoxing() {
    gridOptions.api.setFilterModel({
        country: {
            type: 'set',
            values: ['Ireland', 'Great Britain']
        },
        sport: {
            type: 'set',
            values: ['Boxing']
        }
    });
    setTitle('UK and Ireland - Boxing');
}

function filterUKAndIrelandEquestrian() {
    gridOptions.api.setFilterModel({
        country: {
            type: 'set',
            values: ['Ireland', 'Great Britain']
        },
        sport: {
            type: 'set',
            values: ['Equestrian']
        }
    });
    setTitle('UK and Ireland - Equestrian');
}

function filterUsaAndCanadaBoxing() {
    gridOptions.api.setFilterModel({
        country: {
            type: 'set',
            values: ['United States', 'Canada']
        },
        sport: {
            type: 'set',
            values: ['Boxing']
        }
    });
    setTitle('USA and Canada - Boxing');
}

function filterUsaAndCanadaEquestrian() {
    gridOptions.api.setFilterModel({
        country: {
            type: 'set',
            values: ['United States', 'Canada']
        },
        sport: {
            type: 'set',
            values: ['Equestrian']
        }
    });
    setTitle('USA and Canada - Equestrian');
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
