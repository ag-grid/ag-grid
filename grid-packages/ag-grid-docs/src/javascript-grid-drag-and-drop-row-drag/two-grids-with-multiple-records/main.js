var leftColumnDefs = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: function(params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    {
        maxWidth: 50,
        checkboxSelection: true,
        suppressMenu: true,
        headerCheckboxSelection: true
    },
    { field: "athlete" },
    { field: "sport" }
];

var rightColumnDefs = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: function(params, dragItemCount) {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" },
    {
        suppressMenu: true,
        maxWidth: 50,
        cellRenderer: function(params) {
            var button = document.createElement('i');

            button.addEventListener('click', function() {
                params.api.updateRowData({ remove: [params.node.data] });
            });

            button.classList.add('far');
            button.classList.add('fa-trash-alt');
            button.style.cursor = 'pointer';

            return button;
        }
    }
];

var leftGridOptions = {
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
    getRowNodeId: function(data) { return data.athlete; },
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    animateRows: true,
    onGridReady: function(params) {
        addGridDropZone(params);
    }
};

var rightGridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    getRowNodeId: function(data) { return data.athlete; },
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: rightColumnDefs,
    animateRows: true    
};

function addGridDropZone(params) {
    params.api.addRowDropZone({
        target: rightGridOptions,
        dropAtIndex: true,
        onDragStop: function(params) {
            var deselectCheck = document.querySelector('input#deselect').checked;
            var moveCheck = document.querySelector('input#move').checked;
            var nodes = params.dragItem.rowNodes;
            
            if (moveCheck) {
                leftGridOptions.api.updateRowData({
                    remove: nodes.map(function(node) { return node.data; })
                });
            } else if (deselectCheck && nodes.length > 1) {
                nodes.forEach(function(node) {
                    node.setSelected(false);
                });
            }
        }
    });
}

function loadGrid(options, side, data) {
    var grid = document.querySelector('#e' + side + 'Grid');
    
    if (options.api) {
        options.api.destroy();
    }

    options.rowData = data;
    new agGrid.Grid(grid, options);
}

function loadGrids() {
    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            var athletes = [];
            var i = 0;

            while (athletes.length < 20 && i < data.length) {
                var pos = i++;
                if (athletes.some(function(rec) { return rec.athlete === data[pos].athlete; })) { continue; }
                athletes.push(data[pos]);
            }

            loadGrid(leftGridOptions, 'Left', athletes);
            loadGrid(rightGridOptions, 'Right', []);
        });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var resetBtn = document.querySelector('button.reset');

    resetBtn.addEventListener('click', loadGrids);

    loadGrids();
});

