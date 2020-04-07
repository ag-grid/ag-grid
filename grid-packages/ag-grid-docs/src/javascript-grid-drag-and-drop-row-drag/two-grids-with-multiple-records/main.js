var leftColumnDefs = [
    {   rowDrag: true,
        maxWidth: 50,
        rowDragText: function(params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes'
            }
            return params.rowNode.data.athlete;
        },
    },
    {
        maxWidth: 50,
        checkboxSelection: true
    },
    { field: "athlete" },
    { field: "sport" }
];

var rightColumnDefs = [
    {   rowDrag: true,
        maxWidth: 50,
        rowDragText: function(params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes'
            }
            return params.rowNode.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" }
];

var gridOptions = {
    Left: {
        defaultColDef: {
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
            resizable: true
        },
        rowSelection: 'multiple',
        enableMultiRowDragging: true,
        suppressRowClickSelection: true,
        getRowNodeId: function(data) { return data.athlete },
        rowDragManaged: true,
        suppressMoveWhenRowDragging: true,
        columnDefs: leftColumnDefs,
        animateRows: true,
        onGridReady: function(params) {
            addGridDropZone(params, 'Right');
        }
    },
    Right: {
        defaultColDef: {
            flex: 1,
            minWidth: 100,
            sortable: true,
            filter: true,
            resizable: true
        },
        getRowNodeId: function(data) { return data.athlete },
        rowDragManaged: true,
        suppressMoveWhenRowDragging: true,
        columnDefs: rightColumnDefs,
        animateRows: true
    }
};

function addGridDropZone(params, side) {
    params.api.addDropZone({
        target: gridOptions[side],
        dropAtIndex: true
    });
}

function loadGrid(side, data) {
    var grid = document.querySelector('#e' + side + 'Grid');
    var options = gridOptions[side];

    options.rowData = data;
    new agGrid.Grid(grid, options);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        var athletes = [];
        var i = 0;

        while (athletes.length < 20 && i < data.length) {
            var pos = i++;
            if (athletes.some(function(rec) { return rec.athlete === data[pos].athlete })) { continue; }
            athletes.push(data[pos]);
        }

        loadGrid('Left', athletes);
        loadGrid('Right', []);
    });
});
